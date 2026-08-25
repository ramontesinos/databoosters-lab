/* =========================================================================
   DATABOOSTERS · LABORATORIO SQL
   motor.js  —  la maquinaria. Normalmente no necesitas tocar este archivo.
   =========================================================================
   Lo que hace, en orden:
     1. levanta sql.js dentro de un Web Worker
     2. monta el editor (CodeMirror 5) y dibuja el esquema
     3. ejecuta la consulta del alumno y pinta la tabla
     4. compara su resultado contra el de la solucion, en vivo
     5. avisa al iframe padre de su altura, para que crezca solo

   POR QUE UN WORKER: sql.js es sincronico. Un JOIN sin ON cuelga la pestana
   sin salida. En un worker se puede matar el proceso y avisar con calma.
   ========================================================================= */
(function () {
  'use strict';

  var CDN_SQLJS = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';
  var LIMITE_MS = 5000;      // mas de esto y se corta la consulta
  var TOPE_FILAS = 500;      // no pintamos mas filas que esto

  // ---------------------------------------------------------------------
  // PROGRESO
  // ---------------------------------------------------------------------
  // Dos sitios donde puede vivir el progreso, en este orden:
  //
  //   1. LA PAGINA PADRE. Si el laboratorio va dentro de un iframe en
  //      LearnWorlds, el padre nos dice quien es el alumno y guarda por
  //      nosotros. Eso importa: dentro de un iframe de otro dominio,
  //      Safari y Chrome parten o bloquean el almacenamiento, asi que
  //      guardar en el padre (que es primera parte) es lo unico fiable.
  //   2. localStorage propio. Es lo que aplica cuando se abre el
  //      laboratorio directo, sin iframe.
  //
  // ORIGENES_PADRE es una lista blanca. Sin ella, cualquier pagina que nos
  // embebiera podria mandarnos un id de alumno o un progreso inventado.
  // CAMBIA ESTO si publicas el sitio en otro dominio.
  var ORIGENES_PADRE = [
    'https://cursos.databoosters.mx',
    'https://databoosters.mx'
  ];
  var CLAVE = 'db-lab-sql-v1';
  var ESPERA_PADRE_MS = 800;   // si el padre no contesta, seguimos solos

  var $ = function (id) { return document.getElementById(id); };

  var estado = {
    worker: null,
    listo: false,
    indice: 0,
    ejercicio: null,
    editor: null,
    pendientes: {},
    contador: 0,
    resueltos: {},
    tema: null,          // null = todos los temas
    usuario: null,       // id de LearnWorlds, si el padre nos lo dice
    guardaPadre: false,  // true = el padre es quien guarda
    ultimoSQL: '',       // el sql que se ejecuto, para poder explicarlo
    ultimoRes: null,     // ultimo resultado pintado, para cambiar de vista
    forma: null,         // que grafica admite ese resultado
    vistaPref: null      // vista que eligio el alumno a mano
  };

  /* ======================================================================
     1 · EL WORKER
     Se crea desde un Blob para no necesitar un archivo aparte.
     ====================================================================== */
  var CODIGO_WORKER = [
    'let SQL = null, db = null;',
    'self.onmessage = async function (e) {',
    '  const m = e.data;',
    '  try {',
    '    if (m.tipo === "arrancar") {',
    '      importScripts(m.cdn + "sql-wasm.js");',
    '      SQL = await initSqlJs({ locateFile: f => m.cdn + f });',
    '      self.postMessage({ tipo: "arrancado" });',
    '      return;',
    '    }',
    '    if (m.tipo === "cargar") {',
    '      if (db) db.close();',
    '      db = new SQL.Database();',
    '      db.run(m.sql);',
    '      self.postMessage({ tipo: "cargado", id: m.id });',
    '      return;',
    '    }',
    '    if (m.tipo === "ejecutar") {',
    '      const r = db.exec(m.sql);',
    '      self.postMessage({ tipo: "ok", id: m.id, res: r });',
    '      return;',
    '    }',
    '  } catch (err) {',
    '    self.postMessage({ tipo: "fallo", id: m.id, mensaje: String(err && err.message || err) });',
    '  }',
    '};'
  ].join('\n');

  function crearWorker() {
    var url = URL.createObjectURL(new Blob([CODIGO_WORKER], { type: 'text/javascript' }));
    var w = new Worker(url);
    w.onmessage = function (e) {
      var m = e.data;
      if (m.tipo === 'arrancado') { estado.listo = true; if (estado.alArrancar) estado.alArrancar(); return; }
      var p = estado.pendientes[m.id];
      if (!p) return;
      clearTimeout(p.reloj);
      delete estado.pendientes[m.id];
      if (m.tipo === 'fallo') p.mal({ tipo: 'sql', mensaje: m.mensaje });
      else p.bien(m.tipo === 'ok' ? m.res : true);
    };
    return w;
  }

  /** Manda algo al worker y devuelve una promesa. Si tarda mas de
   *  LIMITE_MS, mata el worker, lo vuelve a crear y avisa de tiempo agotado. */
  function pedir(mensaje) {
    return new Promise(function (bien, mal) {
      var id = ++estado.contador;
      mensaje.id = id;
      var reloj = setTimeout(function () {
        delete estado.pendientes[id];
        estado.worker.terminate();
        estado.listo = false;
        estado.worker = crearWorker();
        arrancarWorker().then(function () { return cargarDataset(); });
        mal({ tipo: 'tiempo' });
      }, LIMITE_MS);
      estado.pendientes[id] = { bien: bien, mal: mal, reloj: reloj };
      estado.worker.postMessage(mensaje);
    });
  }

  function arrancarWorker() {
    return new Promise(function (bien) {
      estado.alArrancar = bien;
      estado.worker.postMessage({ tipo: 'arrancar', cdn: CDN_SQLJS });
    });
  }

  /** Reconstruye la base entera. Se llama antes de cada verificacion, asi
   *  que si el alumno escribio DROP TABLE no rompe nada. */
  function cargarDataset() {
    var d = DATASETS[estado.ejercicio.dataset];
    return pedir({ tipo: 'cargar', sql: d.sql });
  }

  /* ======================================================================
     2 · COMPARACION DE RESULTADOS
     ====================================================================== */

  /** Una celda a texto canonico, para que 1 y 1.00 no cuenten como distintos
   *  y para que NULL tenga una sola representacion. */
  function normalizarCelda(v, cfg) {
    if (v === null || v === undefined) return '∅';
    if (typeof v === 'number') {
      if (!isFinite(v)) return String(v);
      return v.toFixed(cfg.decimales);
    }
    var t = String(v).trim();
    return cfg.mayusculas ? t : t.toLowerCase();
  }

  /** Un resultado de sql.js a { columnas, filas } ya normalizado. */
  function normalizar(res, cfg) {
    if (!res || !res.length) return { columnas: [], filas: [] };
    var r = res[res.length - 1];   // si hay varias sentencias, vale la ultima
    return {
      columnas: (r.columns || []).map(function (c) { return String(c).trim().toLowerCase(); }),
      filas: (r.values || []).map(function (fila) {
        return fila.map(function (c) { return normalizarCelda(c, cfg); });
      })
    };
  }

  function comparar(mio, suyo, cfg) {
    // 1) numero de columnas
    if (mio.columnas.length !== suyo.columnas.length) {
      return {
        ok: false, motivo: 'columnas',
        texto: 'Tu consulta trae <b>' + mio.columnas.length + ' columna' +
               (mio.columnas.length === 1 ? '' : 's') + '</b> y se esperaban <b>' +
               suyo.columnas.length + '</b>.'
      };
    }

    // 2) nombres, solo si el ejercicio lo pide
    var mFilas = mio.filas, sFilas = suyo.filas;
    if (cfg.columnas === 'nombre') {
      var orden = suyo.columnas.map(function (c) { return mio.columnas.indexOf(c); });
      if (orden.some(function (i) { return i === -1; })) {
        return {
          ok: false, motivo: 'nombres',
          texto: 'Los nombres de las columnas no coinciden. Se esperaban: <code>' +
                 suyo.columnas.join('</code>, <code>') + '</code>.'
        };
      }
      mFilas = mFilas.map(function (f) { return orden.map(function (i) { return f[i]; }); });
    }

    // 3) numero de filas
    if (mFilas.length !== sFilas.length) {
      var mas = mFilas.length > sFilas.length;
      return {
        ok: false, motivo: 'filas',
        texto: 'Tu consulta trae <b>' + mFilas.length + ' fila' +
               (mFilas.length === 1 ? '' : 's') + '</b> y se esperaban <b>' +
               sFilas.length + '</b>.',
        extra: mas ? 'Quizá falta un <code>WHERE</code> o un <code>LIMIT</code> que recorte.'
                   : 'Puede que el filtro esté dejando fuera filas que sí cuentan.'
      };
    }

    // 4) orden: libre por defecto, porque SQL sin ORDER BY no lo garantiza
    if (cfg.orden !== 'estricto') {
      var clave = function (f) { return f.join(''); };
      mFilas = mFilas.slice().sort(function (a, b) { return clave(a) < clave(b) ? -1 : 1; });
      sFilas = sFilas.slice().sort(function (a, b) { return clave(a) < clave(b) ? -1 : 1; });
    }

    // 5) celda a celda, y se reporta la PRIMERA diferencia
    for (var i = 0; i < sFilas.length; i++) {
      for (var j = 0; j < sFilas[i].length; j++) {
        if (mFilas[i][j] !== sFilas[i][j]) {
          return {
            ok: false, motivo: 'celda',
            texto: 'La forma es correcta, pero la fila <b>' + (i + 1) + '</b> no coincide.',
            fila: i + 1,
            tuyo: mFilas[i].join(' · '),
            esperado: sFilas[i].join(' · '),
            extra: cfg.orden === 'estricto'
              ? 'Este ejercicio sí exige un orden concreto: revisa el <code>ORDER BY</code>.'
              : null
          };
        }
      }
    }
    return { ok: true };
  }

  /* ======================================================================
     3 · PINTAR
     ====================================================================== */

  function limpiarAvisos() { $('avisos').innerHTML = ''; }

  var ICONOS = {
    bien: '<path d="M20 6 9 17l-5-5"/>',
    mal: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8v.01"/>'
  };

  function avisar(clase, titulo, cuerpo, comparativa) {
    var caja = document.createElement('div');
    caja.className = 'aviso aviso-' + clase;
    var comp = '';
    if (comparativa) {
      comp = '<div class="comparativa">' +
        '<div><em>Tu fila</em><code>' + escapar(comparativa.tuyo) + '</code></div>' +
        '<div><em>Esperada</em><code>' + escapar(comparativa.esperado) + '</code></div>' +
        '</div>';
    }
    caja.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONOS[clase === 'bien' ? 'bien' : clase === 'mal' ? 'mal' : 'info'] + '</svg>' +
      '<div class="aviso-cuerpo"><p><b>' + titulo + '</b></p>' +
      (cuerpo ? '<p>' + cuerpo + '</p>' : '') + comp + '</div>';
    $('avisos').appendChild(caja);
    medirAltura();
  }

  function escapar(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function pintarTabla(res) {
    var zona = $('zona-resultado');
    var env = $('tabla-envoltura');
    zona.hidden = false;

    if (!res || !res.length || !res[res.length - 1].values.length) {
      env.innerHTML = '<p class="vacio">La consulta funcionó, pero no devolvió ninguna fila.</p>';
      $('res-cuenta').textContent = '0 filas';
      // Cero filas es justo cuando mas falta hace la explicacion: casi
      // siempre el WHERE filtro de mas.
      pintarExplicacion(estado.ultimoSQL || '', null);
      estado.ultimoRes = null; estado.forma = null;
      $('vistas').hidden = true;
      $('grafica-envoltura').hidden = true;
      env.hidden = false;
      medirAltura();
      return;
    }

    var r = res[res.length - 1];
    var filas = r.values.slice(0, TOPE_FILAS);
    var html = '<table><thead><tr>';
    r.columns.forEach(function (c) { html += '<th>' + escapar(c) + '</th>'; });
    html += '</tr></thead><tbody>';
    filas.forEach(function (f) {
      html += '<tr>';
      f.forEach(function (c) {
        if (c === null || c === undefined) html += '<td class="nulo">NULL</td>';
        else if (typeof c === 'number') html += '<td class="num">' + escapar(c) + '</td>';
        else html += '<td>' + escapar(c) + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    env.innerHTML = html;

    var n = r.values.length;
    $('res-cuenta').textContent = n + (n === 1 ? ' fila' : ' filas') +
      (n > TOPE_FILAS ? ' · se muestran las primeras ' + TOPE_FILAS : '');

    estado.ultimoRes = r;
    prepararVistas(r);
    pintarExplicacion(estado.ultimoSQL || '', r);
    medirAltura();
  }

  function pintarAprende(ej) {
    var c = ej.concepto;
    if (!c) { $('aprende').hidden = true; return; }
    $('aprende').hidden = false;
    $('ap-titulo').textContent = c.titulo || '';
    $('ap-texto').innerHTML = c.texto || '';

    $('ap-sintaxis-caja').hidden = !c.sintaxis;
    if (c.sintaxis) $('ap-sintaxis').textContent = c.sintaxis;

    $('ap-ejemplo-caja').hidden = !c.ejemplo;
    if (c.ejemplo) {
      $('ap-ejemplo').textContent = c.ejemplo;
      $('ap-dice').textContent = c.queHace || '';
      $('btn-probar').onclick = function () { probarEjemplo(c.ejemplo); };
    }
  }

  // Cargar el ejemplo y ejecutarlo. Aqui SI se lleva al alumno al resultado,
  // porque lo pidio el: pulso un boton que dice "probar".
  function probarEjemplo(sql) {
    estado.editor.setValue(sql);
    ejecutar();
    setTimeout(function () {
      var z = $('zona-resultado');
      if (z && !z.hidden && z.scrollIntoView) {
        z.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 900);
  }

  function pintarEsquema() {
    var d = DATASETS[estado.ejercicio.dataset];
    $('esquema-nombre').textContent = d.nombre;
    // Se leen las tablas del propio SQL del dataset: si agregas una tabla,
    // aparece aqui sola, sin tocar nada mas.
    var caja = $('esquema');
    caja.innerHTML = '';
    var re = /CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi, m;
    while ((m = re.exec(d.sql)) !== null) {
      var cols = m[2].split('\n').map(function (l) { return l.trim(); })
        .filter(function (l) { return l && !/^(PRIMARY|FOREIGN|UNIQUE|CHECK)/i.test(l); })
        .map(function (l) {
          var p = l.replace(/,$/, '').split(/\s+/);
          return { nombre: p[0], tipo: (p[1] || '').toUpperCase() };
        }).filter(function (c) { return c.nombre; });
      var div = document.createElement('div');
      div.className = 'tabla-esq';
      div.innerHTML = '<h3>' + escapar(m[1]) + '</h3><ul>' + cols.map(function (c) {
        return '<li>' + escapar(c.nombre) + '<span>' + escapar(c.tipo) + '</span></li>';
      }).join('') + '</ul>';
      caja.appendChild(div);
    }
  }

  function pintarPasos() {
    var caja = $('pasos');
    caja.innerHTML = '';
    // Los numeros NO se renumeran al filtrar: el 4 es siempre el cuarto
    // ejercicio, filtres o no. Asi un enlace ?ej=join-01 y lo que ve el
    // alumno dicen lo mismo.
    var v = visibles();
    EJERCICIOS.forEach(function (ej, i) {
      if (v.indexOf(i) === -1) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'paso' + (i === estado.indice ? ' paso-on' : '') +
                    (estado.resueltos[ej.id] && i !== estado.indice ? ' paso-hecho' : '');
      b.textContent = String(i + 1);
      b.title = ej.titulo;
      b.setAttribute('aria-label', 'Ejercicio ' + (i + 1) + ': ' + ej.titulo);
      b.onclick = function () { irA(i); };
      caja.appendChild(b);
    });
  }

  /* ======================================================================
     3.5 · PROGRESO: GUARDAR Y RECUPERAR
     ====================================================================== */

  function claveLocal() {
    return CLAVE + (estado.usuario ? ':' + estado.usuario : '');
  }

  function guardarProgreso() {
    var datos = { v: 1, resueltos: estado.resueltos, fecha: new Date().toISOString() };
    if (estado.guardaPadre) {
      try {
        parent.postMessage({
          tipo: 'db-lab-progreso', app: 'sql',
          usuario: estado.usuario, datos: datos
        }, '*');
      } catch (e) { /* sin padre alcanzable */ }
    }
    // Se escribe tambien en local: si el navegador lo permite es un respaldo
    // gratis, y si lo bloquea el catch lo absorbe sin romper nada.
    try { localStorage.setItem(claveLocal(), JSON.stringify(datos)); } catch (e) {}
  }

  function aplicarProgreso(datos) {
    if (!datos || typeof datos !== 'object') return;
    var r = datos.resueltos;
    if (!r || typeof r !== 'object') return;
    // Solo se aceptan ids que existan de verdad en EJERCICIOS: asi un
    // progreso viejo con ejercicios que ya borraste no arrastra basura.
    var validos = {};
    EJERCICIOS.forEach(function (ej) { if (r[ej.id] === true) validos[ej.id] = true; });
    estado.resueltos = validos;
  }

  function leerLocal() {
    try {
      var s = localStorage.getItem(claveLocal());
      return s ? JSON.parse(s) : null;
    } catch (e) { return null; }
  }

  function olvidarProgreso() {
    estado.resueltos = {};
    try { localStorage.removeItem(claveLocal()); } catch (e) {}
    if (estado.guardaPadre) {
      try {
        parent.postMessage({
          tipo: 'db-lab-progreso', app: 'sql',
          usuario: estado.usuario, datos: { v: 1, resueltos: {}, fecha: new Date().toISOString() }
        }, '*');
      } catch (e) {}
    }
    pintarPasos(); pintarTemas(); pintarProgreso();
  }

  // Le pregunta al padre quien es el alumno y si tiene progreso guardado.
  // Devuelve una promesa que SIEMPRE se resuelve: si el padre no contesta
  // en ESPERA_PADRE_MS, seguimos con lo que haya en local.
  function preguntarAlPadre() {
    return new Promise(function (listo) {
      if (window.parent === window) { listo(false); return; }
      var contestado = false;

      function alMensaje(e) {
        if (ORIGENES_PADRE.indexOf(e.origin) === -1) return;
        var d = e.data;
        if (!d || d.tipo !== 'db-lab-usuario') return;
        if (contestado) return;
        contestado = true;
        window.removeEventListener('message', alMensaje);
        estado.usuario = (typeof d.usuario === 'string' && d.usuario) ? d.usuario : null;
        estado.guardaPadre = true;
        if (d.progreso) aplicarProgreso(d.progreso);
        listo(true);
      }

      window.addEventListener('message', alMensaje);
      try { parent.postMessage({ tipo: 'db-lab-hola', app: 'sql' }, '*'); } catch (e) {}
      setTimeout(function () {
        if (contestado) return;
        window.removeEventListener('message', alMensaje);
        listo(false);
      }, ESPERA_PADRE_MS);
    });
  }

  function cargarProgreso() {
    return preguntarAlPadre().then(function (loTraeElPadre) {
      // Si el padre contesto pero no traia progreso, aun puede haber una
      // partida local de cuando se abrio el laboratorio suelto.
      if (!loTraeElPadre || !Object.keys(estado.resueltos).length) {
        aplicarProgreso(leerLocal());
      }
    });
  }

  function pintarProgreso() {
    var total = EJERCICIOS.length;
    var n = EJERCICIOS.filter(function (ej) { return estado.resueltos[ej.id]; }).length;
    var pips = EJERCICIOS.map(function (ej) {
      return '<i class="' + (estado.resueltos[ej.id] ? 'on' : '') + '"></i>';
    }).join('');
    var quien = estado.usuario ? ' · tu avance queda guardado' :
      (n ? ' · guardado en este navegador' : '');
    var html = '<span class="pip" aria-hidden="true">' + pips + '</span>' +
               '<span>' + n + ' de ' + total + ' resueltos' + quien + '</span>';
    if (n) html += '<button class="borrar-prog" id="btn-olvidar" type="button">Empezar de cero</button>';
    var caja = $('progreso');
    caja.innerHTML = html;
    var b = $('btn-olvidar');
    if (b) {
      b.onclick = function () {
        if (confirm('¿Borrar tu progreso y empezar de cero?')) olvidarProgreso();
      };
    }
  }

  /* ======================================================================
     3.6 · FILTRO DE TEMAS
     Los temas salen de los propios ejercicios: si en ejercicios.js escribes
     un tema nuevo, aparece aqui solo. No hay lista que mantener.
     ====================================================================== */

  function listaTemas() {
    var vistos = [], salida = [];
    EJERCICIOS.forEach(function (ej) {
      var tm = ej.tema || 'Sin tema';
      if (vistos.indexOf(tm) === -1) { vistos.push(tm); salida.push({ tema: tm, n: 1 }); }
      else salida[vistos.indexOf(tm)].n++;
    });
    return salida;
  }

  function visibles() {
    if (!estado.tema) return EJERCICIOS.map(function (_, i) { return i; });
    return EJERCICIOS.map(function (ej, i) { return (ej.tema || 'Sin tema') === estado.tema ? i : -1; })
                     .filter(function (i) { return i >= 0; });
  }

  function pintarTemas() {
    var caja = $('temas');
    caja.innerHTML = '';
    var temas = listaTemas();
    // Con un solo tema el filtro no filtra nada: mejor no ensenarlo.
    if (temas.length < 2) { caja.hidden = true; return; }
    caja.hidden = false;

    function chip(texto, valor, n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tema' + (estado.tema === valor ? ' tema-on' : '');
      b.innerHTML = escapar(texto) + '<span class="n">' + n + '</span>';
      b.setAttribute('aria-pressed', estado.tema === valor ? 'true' : 'false');
      b.onclick = function () { filtrarPor(valor); };
      caja.appendChild(b);
    }

    chip('Todos', null, EJERCICIOS.length);
    temas.forEach(function (x) {
      var hechos = EJERCICIOS.filter(function (ej) {
        return (ej.tema || 'Sin tema') === x.tema && estado.resueltos[ej.id];
      }).length;
      chip(x.tema, x.tema, hechos === x.n ? '✓' : hechos + '/' + x.n);
    });
  }

  function filtrarPor(tema) {
    estado.tema = tema;
    pintarTemas();
    var v = visibles();
    // Si el ejercicio abierto no esta en el tema elegido, saltamos al
    // primero del tema. Dejar en pantalla un ejercicio que el filtro
    // acaba de esconder es el clasico "y esto de donde salio".
    if (v.indexOf(estado.indice) === -1 && v.length) irA(v[0]);
    else { pintarPasos(); medirAltura(); }
  }

  /* ======================================================================
     3.7 · VISTA GRAFICA DEL RESULTADO
     Se decide por la FORMA del resultado, no por el texto de la consulta:
     parsear SQL para adivinar la intencion se rompe con el primer alias.
     ====================================================================== */

  var FMT = (typeof Intl !== 'undefined' && Intl.NumberFormat)
    ? new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })
    : null;

  function num(n) { return FMT ? FMT.format(n) : String(n); }
  function esNum(v) { return typeof v === 'number' && isFinite(v); }

  function analizarForma(r) {
    if (!r || !r.values || !r.values.length) return null;
    var filas = r.values, cols = r.columns;

    // Una columna es numerica si TODOS sus valores no nulos lo son.
    var numericas = [];
    for (var c = 0; c < cols.length; c++) {
      var vistos = 0, ok = true;
      for (var f = 0; f < filas.length; f++) {
        var v = filas[f][c];
        if (v === null || v === undefined) continue;
        vistos++;
        if (!esNum(v)) { ok = false; break; }
      }
      if (ok && vistos > 0) numericas.push(c);
    }

    // Una fila y puros numeros: eso es un indicador, no una tabla.
    if (filas.length === 1 && cols.length <= 4 && numericas.length === cols.length) {
      return { tipo: 'kpi' };
    }

    // Etiqueta de texto en la primera columna + alguna numerica = barras.
    // Se exige que la primera columna NO sea numerica a proposito: en
    // "SELECT id, nombre, total" el id es un numero, pero graficarlo no
    // dice nada.
    if (filas.length >= 2 && filas.length <= 25 &&
        numericas.length >= 1 && numericas.indexOf(0) === -1) {
      return { tipo: 'barras', etiqueta: 0, valor: numericas[0] };
    }

    return null;
  }

  function pintarKPI(r) {
    var html = '<div class="kpis">';
    r.columns.forEach(function (c, i) {
      var v = r.values[0][i];
      html += '<div class="kpi"><span class="et">' + escapar(c) + '</span>' +
        (v === null || v === undefined
          ? '<span class="val es-nulo">Sin dato (NULL)</span>'
          : '<span class="val">' + escapar(num(v)) + '</span>') +
        '</div>';
    });
    return html + '</div>';
  }

  function pintarBarras(r, forma) {
    var ie = forma.etiqueta, iv = forma.valor;
    var tope = 0;
    r.values.forEach(function (f) {
      var v = f[iv];
      if (esNum(v) && Math.abs(v) > tope) tope = Math.abs(v);
    });
    if (!tope) tope = 1;

    var html = '<div class="barras"><span class="barras-cab">' +
      escapar(r.columns[iv]) + ' por ' + escapar(r.columns[ie]) + '</span>';

    r.values.forEach(function (f) {
      var et = (f[ie] === null || f[ie] === undefined) ? 'NULL' : String(f[ie]);
      var v = f[iv];
      var ancho = esNum(v) ? (Math.abs(v) / tope) * 100 : 0;
      html += '<div class="barra-f">' +
        '<span class="lb" title="' + escapar(et) + '">' + escapar(et) + '</span>' +
        '<span class="pista-b"><span class="rel" style="width:' + ancho.toFixed(2) + '%"></span></span>' +
        '<span class="vl' + (esNum(v) && v < 0 ? ' neg' : '') + '">' +
          (esNum(v) ? escapar(num(v)) : 'NULL') + '</span>' +
        '</div>';
    });

    if (r.columns.length > 2) {
      html += '<p class="barras-pie">La gráfica usa <b>' + escapar(r.columns[ie]) +
        '</b> como etiqueta y <b>' + escapar(r.columns[iv]) +
        '</b> como valor. Las demás columnas están en la tabla.</p>';
    }
    return html + '</div>';
  }

  function cambiarVista(cual) {
    var puede = !!estado.forma;
    var g = (cual === 'grafica' && puede);
    $('tabla-envoltura').hidden = g;
    $('grafica-envoltura').hidden = !g;
    $('vista-tabla').classList.toggle('vista-on', !g);
    $('vista-grafica').classList.toggle('vista-on', g);
    $('vista-tabla').setAttribute('aria-pressed', String(!g));
    $('vista-grafica').setAttribute('aria-pressed', String(g));
    medirAltura();
  }

  function prepararVistas(r) {
    var forma = analizarForma(r);
    estado.forma = forma;
    var caja = $('grafica-envoltura');

    if (!forma) {
      caja.innerHTML = '';
      caja.hidden = true;
      $('vistas').hidden = true;
      $('tabla-envoltura').hidden = false;
      return;
    }

    caja.innerHTML = forma.tipo === 'kpi' ? pintarKPI(r) : pintarBarras(r, forma);
    $('vistas').hidden = false;

    // Un solo numero se lee mejor como indicador que como tabla de 1x1, asi
    // que ahi la grafica va por defecto. En barras la tabla sigue mandando,
    // pero si el alumno ya eligio una vista a mano, se respeta.
    var porDefecto = forma.tipo === 'kpi' ? 'grafica' : 'tabla';
    cambiarVista(estado.vistaPref || porDefecto);
  }

  /* ======================================================================
     3.8 · QUE HIZO TU CONSULTA
     Se explica en el ORDEN EN QUE SQL EJECUTA, que no es el orden en que
     se escribe. Ese desfase es lo que mas cuesta entender al principio:
     se escribe SELECT primero, pero se ejecuta casi al final.

         FROM -> JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT

     Esto NO decide si la respuesta es correcta (de eso se encarga la
     comparacion, ejecutando de verdad). Es solo narracion, asi que un
     analisis aproximado es aceptable: si algo no se reconoce, se calla en
     vez de inventar.
     ====================================================================== */

  var MARCA = '\u0001';   // separador que no puede aparecer en SQL escrito
  //          ^ sin esto, 'CDMX' se cambiaria por un "0" pelon y luego
  //            restaurar() se comeria cualquier numero de la consulta.

  // Saca comentarios y guarda el contenido de las cadenas, para no
  // confundir un WHERE escrito dentro de un texto con la clausula WHERE.
  function despejar(sql) {
    var textos = [];
    var s = sql.replace(/--[^\n]*/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ');
    s = s.replace(/'[^']*'/g, function (m) {
      textos.push(m); return MARCA + (textos.length - 1) + MARCA;
    });
    return { sql: s, textos: textos };
  }

  function restaurar(txt, textos) {
    return String(txt).replace(new RegExp(MARCA + '(\\d+)' + MARCA, 'g'),
      function (_, i) { return textos[+i]; });
  }

  // Corta el trozo que hay entre una palabra clave y la siguiente.
  function entre(s, desde, hasta) {
    var re = new RegExp('\\b' + desde + '\\b([\\s\\S]*?)(?=\\b(?:' + hasta + ')\\b|$)', 'i');
    var m = s.match(re);
    return m ? m[1].trim().replace(/[;\s]+$/, '') : null;
  }

  var SIGUIENTES = 'where|group\\s+by|having|order\\s+by|limit|union|except|intersect';

  var AGREGADOS = {
    count: 'contó cuántas filas hay',
    sum:   'sumó los valores',
    avg:   'sacó el promedio',
    min:   'buscó el valor más chico',
    max:   'buscó el valor más grande'
  };

  function cod(x) { return '<code>' + escapar(x) + '</code>'; }

  function explicarConsulta(sqlCrudo, r) {
    var d = despejar(sqlCrudo);
    var L = d.sql.replace(/\s+/g, ' ').trim();
    if (!/^select\b/i.test(L)) return null;   // solo narramos SELECT

    var pasos = [];
    var agrega = function (clausula, texto) { pasos.push({ cl: clausula, tx: texto }); };

    // ---- FROM ----------------------------------------------------------
    var mFrom = L.match(/\bfrom\s+([a-z_][\w]*)(?:\s+(?:as\s+)?([a-z_][\w]*))?/i);
    if (!mFrom) return null;
    var tabla = mFrom[1];
    agrega('FROM', 'Abriste la tabla <b>' + escapar(tabla) + '</b>. Aquí empieza todo: ' +
      'antes de filtrar o de elegir columnas, SQL necesita las filas.');

    // ---- JOIN ----------------------------------------------------------
    var reJoin = /\b(inner|left|right|full|cross)?\s*join\s+([a-z_][\w]*)(?:\s+(?:as\s+)?([a-z_][\w]*))?\s*(?:on\s+([^]*?))?(?=\b(?:inner|left|right|full|cross|join|where|group|having|order|limit)\b|$)/gi;
    var mj;
    while ((mj = reJoin.exec(L)) !== null) {
      var tipo = (mj[1] || '').toLowerCase();
      var otra = mj[2];
      var cond = mj[4] ? restaurar(mj[4].trim(), d.textos) : null;
      var txt = 'La uniste con <b>' + escapar(otra) + '</b>' +
        (cond ? ', emparejando las filas donde ' + cod(cond) : '') + '. ';
      txt += (tipo === 'left')
        ? 'Al ser <b>LEFT JOIN</b>, se conservan todas las filas de la primera tabla aunque no encuentren pareja.'
        : 'Solo sobreviven las filas que encuentran pareja en las dos tablas.';
      agrega((tipo ? tipo.toUpperCase() + ' ' : '') + 'JOIN', txt);
    }

    // ---- WHERE ---------------------------------------------------------
    var w = entre(L, 'where', SIGUIENTES);
    if (w) {
      agrega('WHERE', 'Te quedaste solo con las filas que cumplen ' +
        cod(restaurar(w, d.textos)) + '. Las demás se descartaron aquí, ' +
        'antes de agrupar y antes de calcular nada.');
    }

    // ---- GROUP BY ------------------------------------------------------
    var g = entre(L, 'group\\s+by', 'having|order\\s+by|limit|union');
    if (g) {
      agrega('GROUP BY', 'Juntaste las filas en un grupo por cada valor distinto de ' +
        cod(g) + '. A partir de aquí ya no trabajas con filas sueltas, sino con grupos.');
    }

    // ---- funciones de agregado ----------------------------------------
    var listaSel = L.replace(/^select\s+(distinct\s+)?/i, '').split(/\bfrom\b/i)[0] || '';
    var vistos = [];
    listaSel.replace(/\b(count|sum|avg|min|max)\s*\(/gi, function (_, f) {
      f = f.toLowerCase();
      if (vistos.indexOf(f) === -1) vistos.push(f);
      return '';
    });
    if (vistos.length) {
      agrega('AGREGADO', 'Sobre ' + (g ? 'cada grupo' : 'todas las filas juntas') + ' ' +
        vistos.map(function (f) { return '<b>' + f.toUpperCase() + '</b> ' + AGREGADOS[f]; })
              .join(', y ') + '. Por eso el resultado tiene menos filas que la tabla original.');
    }

    // ---- HAVING --------------------------------------------------------
    var h = entre(L, 'having', 'order\\s+by|limit|union');
    if (h) {
      agrega('HAVING', 'Descartaste grupos enteros que no cumplen ' + cod(restaurar(h, d.textos)) +
        '. Es como WHERE, pero se aplica <b>después</b> de agrupar, y por eso sí puede ' +
        'mirar el resultado de un COUNT o un SUM.');
    }

    // ---- SELECT --------------------------------------------------------
    if (r && r.columns) {
      agrega('SELECT', (/^select\s+distinct/i.test(L) ? 'Con <b>DISTINCT</b>, te quedaste con ' +
        'las combinaciones distintas de estas ' : 'Recién aquí elegiste qué mostrar: ') +
        '<b>' + r.columns.length + (r.columns.length === 1 ? ' columna' : ' columnas') + '</b> (' +
        r.columns.map(function (c) { return escapar(c); }).join(', ') + ').');
    }

    // ---- ORDER BY ------------------------------------------------------
    var o = entre(L, 'order\\s+by', 'limit|union');
    if (o) {
      var desc = /\bdesc\b/i.test(o);
      agrega('ORDER BY', 'Ordenaste el resultado por ' + cod(o.replace(/\s+(asc|desc)\b/gi, '')) +
        ', de ' + (desc ? '<b>mayor a menor</b>' : '<b>menor a mayor</b>') + '. ' +
        'Esto pasa al final: ordenar no cambia qué filas hay, solo en qué orden salen.');
    }

    // ---- LIMIT ---------------------------------------------------------
    var lim = L.match(/\blimit\s+(\d+)/i);
    if (lim) {
      agrega('LIMIT', 'Y de todo eso te quedaste solo con ' + (o
        ? 'las primeras <b>' + lim[1] + '</b> filas ya ordenadas.'
        : '<b>' + lim[1] + '</b> filas. Ojo: sin ORDER BY, cuáles te tocan no está garantizado.'));
    }

    return { pasos: pasos, ordenRaro: !!(o || g || vistos.length) };
  }

  function pintarExplicacion(sql, r) {
    var caja = $('det-explica');
    var e = explicarConsulta(sql, r);
    if (!e || !e.pasos.length) { caja.hidden = true; return; }
    caja.hidden = false;

    var html = e.pasos.map(function (p) {
      return '<div class="paso-sql"><span class="cl">' + escapar(p.cl) + '</span>' +
             '<span class="tx">' + p.tx + '</span></div>';
    }).join('');

    if (r && r.values) {
      var f = r.values.length, c = r.columns.length;
      html += '<p class="explica-salida">Te quedaron <b>' + f +
        (f === 1 ? ' fila</b> y <b>' : ' filas</b> y <b>') + c +
        (c === 1 ? ' columna</b>.' : ' columnas</b>.') + '</p>';
    }

    if (e.ordenRaro) {
      html += '<p class="explica-nota"><b>Fíjate en el orden.</b> Escribiste ' +
        '<code>SELECT</code> al principio, pero SQL lo ejecuta casi al final: ' +
        'primero junta las filas (FROM), luego filtra (WHERE), luego agrupa ' +
        '(GROUP BY) y hasta entonces decide qué columnas mostrar. Por eso no ' +
        'puedes usar en <code>WHERE</code> un alias que inventaste en ' +
        '<code>SELECT</code>: cuando WHERE corre, ese alias todavía no existe.</p>';
    }

    $('explica-cuerpo').innerHTML = html;
  }

  /* ======================================================================
     4 · ACCIONES
     ====================================================================== */

  function ocupado(btn, si) {
    if (si) {
      btn.classList.add('cargando');
      btn.disabled = true;
      btn._svg = btn.querySelector('svg');
      if (btn._svg) { btn._svg.style.display = 'none'; }
      var aro = document.createElement('span');
      aro.className = 'aro';
      btn.insertBefore(aro, btn.firstChild);
    } else {
      btn.classList.remove('cargando');
      btn.disabled = false;
      var a = btn.querySelector('.aro');
      if (a) a.remove();
      if (btn._svg) btn._svg.style.display = '';
    }
  }

  function explicarError(e) {
    if (e.tipo === 'tiempo') {
      avisar('info', 'La consulta tardó demasiado',
        'La corté a los 5 segundos para que no se congele la página. ' +
        'Suele pasar cuando a un <code>JOIN</code> le falta la condición <code>ON</code> ' +
        'y la base cruza todas las filas con todas.');
      return;
    }
    var m = e.mensaje || 'Error desconocido';
    var pista = null;
    if (/no such table/i.test(m)) pista = 'Revisa el nombre de la tabla en el esquema de arriba.';
    else if (/no such column/i.test(m)) pista = 'Revisa el nombre de la columna: puede tener acento o guion bajo.';
    else if (/syntax error/i.test(m)) pista = 'Casi siempre es una coma de más, uno de menos, o un paréntesis sin cerrar.';
    else if (/unrecognized token/i.test(m)) pista = 'Puede que falte cerrar una comilla.';
    avisar('mal', 'La base no entendió la consulta',
      '<code>' + escapar(m) + '</code>' + (pista ? '<br>' + pista : ''));
  }

  function ejecutar() {
    limpiarAvisos();
    var sql = estado.editor.getValue().trim();
    if (!sql) { avisar('info', 'El editor está vacío', 'Escribe una consulta y vuelve a intentarlo.'); return; }
    estado.ultimoSQL = sql;
    var btn = $('btn-ejecutar');
    ocupado(btn, true);
    cargarDataset()
      .then(function () { return pedir({ tipo: 'ejecutar', sql: sql }); })
      .then(function (res) { ocupado(btn, false); pintarTabla(res); })
      .catch(function (e) { ocupado(btn, false); explicarError(e); });
  }

  function verificar() {
    limpiarAvisos();
    var sql = estado.editor.getValue().trim();
    if (!sql) { avisar('info', 'El editor está vacío', 'Escribe tu consulta antes de verificar.'); return; }

    var ej = estado.ejercicio;
    var cfg = Object.assign(
      { orden: 'libre', columnas: 'posicion', decimales: 2, mayusculas: false },
      ej.comparar || {});

    estado.ultimoSQL = sql;
    var btn = $('btn-verificar');
    ocupado(btn, true);
    var mio;

    cargarDataset()
      .then(function () { return pedir({ tipo: 'ejecutar', sql: sql }); })
      .then(function (res) {
        mio = res;
        pintarTabla(res);
        // La base se reconstruye antes de la solucion, por si el alumno
        // dejo la BD tocada con un UPDATE o un DROP.
        return cargarDataset();
      })
      .then(function () { return pedir({ tipo: 'ejecutar', sql: ej.solucion }); })
      .then(function (resSol) {
        ocupado(btn, false);
        var v = comparar(normalizar(mio, cfg), normalizar(resSol, cfg), cfg);
        if (v.ok) {
          estado.resueltos[ej.id] = true;
          guardarProgreso();
          pintarPasos(); pintarTemas(); pintarProgreso();
          var quedan = estado.indice < EJERCICIOS.length - 1;
          avisar('bien', '¡Correcto!',
            'Tu consulta devuelve exactamente lo que pedía el ejercicio.' +
            (quedan ? ' Pulsa el número siguiente de arriba para continuar.' : ' Terminaste todos los ejercicios.'));
        } else {
          avisar('mal', 'Todavía no', v.texto + (v.extra ? '<br>' + v.extra : ''),
            v.motivo === 'celda' ? { tuyo: v.tuyo, esperado: v.esperado } : null);
        }
      })
      .catch(function (e) { ocupado(btn, false); explicarError(e); });
  }

  /* ======================================================================
     5 · ALTURA PARA EL IFRAME
     El padre escucha este mensaje y ajusta el alto, para que no haya
     scroll dentro de scroll cuando el resultado pasa de 2 a 20 filas.
     ====================================================================== */
  var ultimaAltura = 0;
  function medirAltura() {
    var h = Math.ceil(document.documentElement.scrollHeight);
    if (Math.abs(h - ultimaAltura) < 4) return;
    ultimaAltura = h;
    try {
      parent.postMessage({ tipo: 'db-sql-altura', altura: h, id: location.search }, '*');
    } catch (e) { /* sin padre, da igual */ }
  }

  /* ======================================================================
     6 · ARRANQUE
     ====================================================================== */

  function irA(i) {
    estado.indice = i;
    estado.ejercicio = EJERCICIOS[i];
    var ej = estado.ejercicio;

    $('ej-etiqueta').textContent = 'Ejercicio ' + (i + 1) + ' de ' + EJERCICIOS.length +
      (ej.tema ? ' · ' + ej.tema : '');
    $('ej-titulo').textContent = ej.titulo;
    $('ej-enunciado').innerHTML = ej.enunciado;
    $('ej-pista').innerHTML = ej.pista || 'Este ejercicio no tiene pista.';
    $('det-pista').open = false;
    limpiarAvisos();
    $('zona-resultado').hidden = true;
    $('vistas').hidden = true;
    $('det-explica').hidden = true;
    $('grafica-envoltura').hidden = true;
    $('grafica-envoltura').innerHTML = '';
    $('tabla-envoltura').hidden = false;
    estado.ultimoRes = null;
    estado.forma = null;
    estado.editor.setValue(ej.plantilla || '');
    // NO se hace focus() aqui. Enfocar el editor lo arrastra a la vista: en
    // movil abre el teclado y dentro de un iframe mueve la pagina de
    // LearnWorlds. Al pulsar un tema o un numero lo que quieres es LEER el
    // reto, no escribir. El cursor si se deja puesto, para que al pinchar
    // el editor ya estes donde toca.
    estado.editor.setCursor(estado.editor.lineCount(), 0);
    pintarAprende(ej);
    pintarEsquema();
    pintarPasos();
    pintarProgreso();
    cargarDataset().then(medirAltura);
  }

  function montarEditor() {
    estado.editor = CodeMirror.fromTextArea($('editor'), {
      mode: 'text/x-sql',
      lineNumbers: true,
      lineWrapping: true,
      viewportMargin: Infinity,
      extraKeys: {
        'Ctrl-Enter': ejecutar,
        'Cmd-Enter': ejecutar,
        Tab: function (cm) { cm.replaceSelection('  '); }
      }
    });
    estado.editor.on('change', medirAltura);
  }

  function conectarBotones() {
    $('btn-ejecutar').onclick = ejecutar;
    $('btn-verificar').onclick = verificar;
    $('btn-reiniciar').onclick = function () {
      limpiarAvisos();
      $('zona-resultado').hidden = true;
      estado.editor.setValue(estado.ejercicio.plantilla || '');
      estado.editor.focus();
      medirAltura();
    };
    $('btn-solucion').onclick = function () {
      estado.editor.setValue(estado.ejercicio.solucion);
      limpiarAvisos();
      avisar('info', 'Esta es una solución posible',
        'SQL casi siempre admite varios caminos. Pulsa <b>Ejecutar</b> para verla funcionar, ' +
        'y luego intenta reescribirla a tu manera.');
      medirAltura();
    };
    // Al cambiar de vista se recuerda la eleccion: si el alumno prefiere la
    // grafica, no hay que volver a pulsarla en cada consulta.
    $('vista-tabla').onclick = function () { estado.vistaPref = 'tabla'; cambiarVista('tabla'); };
    $('vista-grafica').onclick = function () { estado.vistaPref = 'grafica'; cambiarVista('grafica'); };

    $('det-explica').addEventListener('toggle', medirAltura);
    $('det-esquema').addEventListener('toggle', medirAltura);
    $('det-pista').addEventListener('toggle', medirAltura);
    window.addEventListener('resize', medirAltura);
  }

  function paso(txt) { $('arranque-paso').textContent = txt; }

  function arrancar() {
    // OJO: no se puede preguntar por window.EJERCICIOS. Un `const` en el
    // nivel superior de un script crea un enlace global pero NO una
    // propiedad de window; eso solo lo hacen `var` y las funciones.
    if (typeof EJERCICIOS === 'undefined' || !EJERCICIOS.length) {
      paso('No encontré ejercicios en ejercicios.js');
      return;
    }
    var url = new URLSearchParams(location.search);

    // Abrir un ejercicio concreto:  sql.html?ej=sel-02
    var pedido = url.get('ej');
    var inicio = 0;
    if (pedido) {
      var k = EJERCICIOS.findIndex(function (e) { return e.id === pedido; });
      if (k >= 0) inicio = k;
    }

    // Abrir ya filtrado por tema:  sql.html?tema=JOINs
    // Asi cada leccion de LearnWorlds puede mostrar solo lo suyo con el
    // mismo archivo publicado. Se compara sin acentos ni mayusculas para
    // que ?tema=agrupacion encuentre "Agrupación".
    var temaPedido = url.get('tema');
    if (temaPedido) {
      var plano = function (s) {
        return String(s).toLowerCase()
          .normalize ? String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                     : String(s).toLowerCase();
      };
      var hallado = null;
      EJERCICIOS.forEach(function (e) {
        if (e.tema && plano(e.tema) === plano(temaPedido)) hallado = e.tema;
      });
      if (hallado) {
        estado.tema = hallado;
        // Si no se pidio un ejercicio suelto, arrancamos en el primero
        // del tema; abrir el 1 con el filtro puesto en otro tema deja la
        // pantalla en un ejercicio que los chips no muestran.
        if (!pedido) {
          for (var j = 0; j < EJERCICIOS.length; j++) {
            if (EJERCICIOS[j].tema === hallado) { inicio = j; break; }
          }
        }
      }
    }

    paso('Cargando el motor de SQL…');
    estado.worker = crearWorker();
    arrancarWorker()
      .then(function () {
        paso('Montando la base de datos…');
        estado.ejercicio = EJERCICIOS[inicio];
        return cargarDataset();
      })
      .then(function () {
        paso('Recuperando tu progreso…');
        return cargarProgreso();
      })
      .then(function () {
        paso('Listo');
        montarEditor();
        conectarBotones();
        $('lab').hidden = false;
        pintarTemas();
        irA(inicio);
        $('arranque').classList.add('fuera');
        setTimeout(function () { $('arranque').remove(); medirAltura(); }, 400);
      })
      .catch(function (e) {
        paso('No pude cargar el motor. Revisa tu conexión y recarga la página.');
        console.error(e);
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
