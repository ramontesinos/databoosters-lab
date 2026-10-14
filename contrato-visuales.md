# Contrato de visuales · DataBoosters Lab

**Versión 0.1 (borrador para revisión con diseño)** · 14-oct-2026

## Qué es este documento

Lista, para cada visual de la aplicación, **qué campos lleva, qué valores acepta y qué reglas debe cumplir**. Sirve para dos cosas:

1. **Diseño:** crear cada visual en función de los campos que realmente existen, sin sorpresas por ejercicio.
2. **Contenido:** corregir los ejercicios para que todos cumplan el mismo contrato (ver §6).

## De dónde sale

Se leyó `lab_ejercicios.dataset` del proyecto Supabase "Web Page": **2,008 ejercicios** en 7 rutas (Excel 500, SQL 481, Python 437, Estadística 347, Storytelling 205, pruebas 32, prueba-sql 6), más `lab_mecanicas` y `lab_soluciones`.

## Qué NO se revisó

**No se revisó el código del renderizador ni se vio nada en pantalla.** Este contrato describe lo que los **datos** contienen. Donde hay duda sobre cómo se ve o qué significa un campo, está marcado **⚠ verificar**.

## Leyenda

| Marca | Significa |
|---|---|
| ✅ | Consistente en los datos hoy |
| ⚠️ | Inconsistente en los datos, o por verificar en pantalla |
| 🆕 | **Propuesto.** No existe hoy; se necesita para cumplir el contrato |
| *Hoy* | Cuántos ejercicios usan el campo |

## Convenciones de nombres (ya existen, se conservan)

| Clave | Significado |
|---|---|
| `v` | valor interno (identificador, no se muestra) |
| `et` | etiqueta visible |
| `vs` | lista de valores numéricos |
| `clave` | identificador corto en minúsculas, sin espacios ni acentos |
| `sub` | texto secundario bajo la etiqueta |

---

# 1 · Resumen: las 14 familias de visual

| # | Familia | Qué es | Ejercicios hoy |
|---|---|---|---|
| V1 | **Hoja** | Tabla estilo hoja de cálculo | 524 |
| V2 | **Gráfica** | Barras y otros tipos, una sola especificación | 79 + las de V6 |
| V3 | **Miniaturas** | Dibujos pequeños para comparar y elegir | 35 |
| V4 | **Vistas** | Conmutador entre dos o más vistas de lo mismo | 41 |
| V5 | **Mandos** | Interruptores que transforman una gráfica | 4 |
| V6 | **Antes / Después** y **Reacomodar** | Dos gráficas, o fichas sobre una gráfica | 2 |
| V7 | **Fichas y grupos** | Piezas para ordenar, clasificar y conectar | ~280 |
| V8 | **Opciones** | Lista de respuestas tocables | ~750 |
| V9 | **Plantilla con huecos** | Frase o fórmula con espacios por llenar | 240 |
| V10 | **Pares** | Emparejar dos columnas | 22 |
| V11 | **Caso con decisiones** | Escenario y ramificar | 6 |
| V12 | **Pistas** | Detective | 135 |
| V13 | **Control numérico** | Deslizador, magnitud, apuesta | ~150 |
| V14 | **Explicación y recorridos** | Tarjeta de lectura, animación, diagrama, balance | ~275 |

---

# 2 · Elementos comunes a toda pantalla

Todos los ejercicios comparten estos campos en `dataset`.

| Campo | Tipo | Req. | Reglas y valores | Hoy |
|---|---|---|---|---|
| `interaccion` | texto | **Sí** | Nombre de la mecánica (ver §5) | ✅ 2,008 |
| `gesto` | texto \| null | No | Etiqueta corta en imperativo sobre el ejercicio ("Toca el dato"). Es texto libre | ⚠️ 909 vacíos y **72 textos distintos**. Conviene fijar ~12 |
| `contexto` | texto \| null | No | 🆕 **Escenario previo** al enunciado. Hoy solo lo llena `conmutador` | ⚠️ 28 de 2,008 |
| `comoSeHace` | lista de pasos | No | Ver abajo | ✅ |
| `estadoInicial` | texto | No | Descripción del estado inicial. ⚠️ verificar si se muestra o es solo nota interna | ✅ |
| `error` | texto \| null | No | Tipo de retroalimentación al fallar: `especifico` (1,404), `generico` (334), `parcial` (82), `inmediato` (22), vacío (166) | ✅ |
| `sinBoton` | bool \| null | No | `true`: la mecánica no muestra botón Comprobar | ✅ |
| `botonVacio` | texto \| null | No | Texto del botón **mientras está deshabilitado** ("Falta 1 hueco", "Continuar") | ✅ |

## `comoSeHace`: los pasos de instrucción

Lista de `{ tono, icono, texto }`.

| Campo | Valores |
|---|---|
| `tono` | `accion` (2,121) · `advertencia` (1,428) · `final` (1,048) → **3 estilos de paso** a diseñar |
| `icono` | `hand-click` · `check` · `refresh` · `arrow-back-up` · `arrow-down` · `target` · `arrows-horizontal` · `hand-off` · `arrows-sort` · `arrow-right` · `eye` · `switch-horizontal` · `eye-off` · `search` · `repeat` → **15 íconos** a diseñar |
| `texto` | Admite `**negritas**`. El último paso típico es "Pulsa **Comprobar**" |

⚠️ **Regla de contenido:** si la mecánica tiene `sinBoton: true`, ningún paso puede decir "Pulsa Comprobar". Hoy ocurre en `clic-dato` y `miniaturas`.

## Campos que viven fuera de `dataset`

| Dónde | Campo | Qué pinta |
|---|---|---|
| `lab_ejercicios` | `titulo`, `enunciado`, `pista` | Encabezado, pregunta y ayuda. El enunciado admite `<br>` y `**negritas**` |
| `lab_soluciones.explica` | `nota`, `insight`, `calculo` | **Panel de acierto** (3 textos) |
| `lab_soluciones.diagnosticos` | `{ valor_de_la_opcion: texto }` | **Panel de error por opción** (mensaje específico) |

Longitudes observadas (para dimensionar): enunciado promedio 129 caracteres, **máximo 331**. Etiqueta de opción promedio 52, **máximo 231**, y **31 % pasa de 60 caracteres**.

---

# 3 · Familias de visual

## V1 · Hoja (tabla)

**Dónde:** `dataset.hoja`. Es el visual más usado: 524 ejercicios en todas las rutas. ✅ **Los 524 traen exactamente los mismos 15 campos.** Mecánicas que la usan: `clic-celda`, `clic-celdas`, `pintar`, `cloze`, `estimar`, `filtros`, `dinamica`, `detective` y otras.

**Tamaños observados:** columnas de 1 a 10 (promedio 1.2 a 3.4, salvo Estadística: 4 a 10), filas de 1 a 9 (promedio ~4). Es una tabla **pequeña**.

| Campo | Tipo | Req. | Regla | Hoy |
|---|---|---|---|---|
| `columnas` | texto[] | **Sí** | Letras de columna: `["A","B","C"]` | 524 |
| `cols` | texto[] | — | ⚠️ **Idéntico a `columnas` en los 524.** Duplicado, se elimina | 524 |
| `titulos` | texto[] | **Sí** | Encabezado de cada columna. Puede ser `""` | 524 |
| `filas` | lista de filas; cada celda `{ v }` | **Sí** | `v` es texto, número o `null` (celda vacía) | 524 |
| `fils` | `[inicio, fin]` | **Sí** | Rango de **numeración de filas** visibles. No duplica `filas` | 524 |
| `roles` | `{ columna: rol }` | **Sí** | Rol por columna. Define el estilo de la celda. Ver abajo | 524 |
| `clicables` | texto[] | Si hay toque | Celdas tocables (`["B1","C2"]`) | 163 |
| `seleccion` | texto \| null | No | Celda, columna o fila ya seleccionada (`"B3"`, `"B"`, `"1"`) | 14 |
| `enfasis` | `{ parte }` \| null | No | Resalta una **parte de la interfaz de Excel**. Ver abajo | 16 |
| `cromo` | bool \| null | No | ⚠️ **verificar significado.** Presumible: dibuja el marco de la aplicación | 21 (Excel 19, SQL 2) |
| `estado` | bool \| null | No | ⚠️ **verificar significado.** Solo aparece en `encuesta` | 9 |
| `pestanas` | texto[] \| null | No | Pestañas de hoja (`["Ventas","Gastos"]`) | 2 |
| `pie` | texto \| null | No | Texto bajo la tabla | 204 en Excel; 45 en SQL; solo 1 en Storytelling |
| `pieTrasGesto` | texto \| null | No | Texto del pie **después** de la acción del alumno ("B5 elegida") | 40+ |
| `cuando` | `"al_corregir"` \| null | No | ⚠️ **verificar significado** | 3 |
| `oculta` | siempre `null` | — | ⚠️ **No se usa.** Se elimina | 0 |

**`roles` (5 valores, 5 estilos de celda a diseñar):** `contexto` (733) · `tocable` (237) · `texto` (184) · `numero` (78) · `destino` (77).

**`enfasis.parte` (5 valores):** `barra_estado` · `barra_formulas` · `cinta` · `reja` · `pestanas`.

**Estados a diseñar:** celda en reposo, tocable, seleccionada, correcta, incorrecta, "destino" (donde va el resultado), fila pintada.

**Pendiente de decisión:** `pie` aparece en 204 hojas de Excel y casi nunca en Storytelling. En `ST-M2L7-06` el `pie` dice "Pastel de 5 regiones, sin etiquetas" bajo una tabla. ⚠️ **verificar** si ahí el pastel se dibuja o solo se describe.

---

## V2 · Gráfica

**Dónde:** `dataset.grafica` (79 ejercicios) y variantes dentro de otras mecánicas (ver más abajo). Mecánicas: `clic-dato` (59), `armagrafica` (16), `taller`, `antesdespues`, `revisar`.

### Hoy: la misma gráfica con **cinco formas distintas**

| Dónde | Forma | Problema |
|---|---|---|
| `grafica` | `{tipo, titulo, series[], filas[{clave, et, vs[]}], flags}` | `tipo` es `null` en las 79 |
| `cambios.antes` / `.despues` | `{tipo:"barras", titulo, filas[{clave, et, vs[]}]}` | `tipo` aquí sí viene |
| `reacomodar.grafica` | `{tipo:"barras", filas, titulo}` | Igual que la anterior |
| `ajustar.categorias` | `[{et, clave, valor}]` | ⚠️ **`valor` escalar, no `vs[]`** |
| `hoja` + `pie` | Tabla con texto que describe la gráfica | No es una gráfica |

**Contrato:** una sola especificación `Grafica`, igual en todas partes.

### Especificación `Grafica` (canónica)

| Campo | Tipo | Req. | Regla |
|---|---|---|---|
| `tipo` | enum | **Sí** | 🆕 `barras` · `barras_h` · `linea` · `circular` · `puntos` · `dispersion` (hoy siempre `null`; se asume barras) |
| `titulo` | texto | **Sí** | ✅ Las 79 lo tienen |
| `subtitulo` | texto \| null | No | 🆕 |
| `unidad` | texto \| null | No | 🆕 "miles de pesos", "%". Hoy no existe |
| `series` | texto[] | **Sí** | ≥ 1. `[""]` si es una sola. Con 2: barras agrupadas. ⚠️ Solo 1 de 79 tiene 2 series |
| `filas` | lista | **Sí** | Ver abajo |
| `ejes` | `{x:{titulo}, y:{titulo, min, visible}}` | No | 🆕 Hoy no hay rótulos de eje. Equivale a `ejeMin` y `sinEjeY` actuales |
| `resaltar` | `clave` \| null | No | 🆕 Barra en acento; el resto en gris. Hoy no existe |
| `etiquetasDatos` | bool | No | 🆕 |
| `estilo` | objeto | No | Defectos o decisiones de diseño. Ver catálogo abajo |

### `filas[]`

| Campo | Tipo | Req. | Regla |
|---|---|---|---|
| `clave` | texto | **Sí** | Identificador. ⚠️ **Falta en 13 barras** |
| `et` | texto | **Sí** | Etiqueta. ⚠️ Máximo observado **71 caracteres**. Propuesta: ≤ 14 en vertical |
| `vs` | número[] | **Sí** | Longitud = `series.length`. **Solo números.** ⚠️ Hay 19 filas con texto o `null` (ver §6) |

### Variantes hoy (79 gráficas)

| Barras | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|
| Gráficas | 4 | 15 | 23 | 23 | 6 | 3 | 1 | 4 |

El 85 % tiene 2 a 5 barras. **Propuesta a validar con diseño:** N entre 2 y 6 en barras verticales; 7 a 9 solo en barras horizontales; N = 1 no es una gráfica de comparación (se resuelve con un número grande).

### Catálogo `estilo` (nombres canónicos y su procedencia hoy)

Hoy el mismo concepto se llama distinto según la ruta. Se unifican así:

| `estilo` canónico | Aparece hoy como |
|---|---|
| `rejilla` (bool) | `sinRejilla` (grafica) · mando `rejilla` (pruebas) · mando `cuadricula` (Excel) |
| `tresd` | `tresd` (grafica y mando "quitar") · mando `agregar_3d` (Excel, **activa**) |
| `colorPorBarra` | `arcoiris` · mando `arcoiris` · `color_por_ciudad` (+ efecto `con_arcoiris`) · `colores_distintos` · `color_aleatorio` |
| `leyenda` | mando `quitar_leyenda` (Excel) |
| `etiquetasDatos` | mando `etiquetas_datos` |
| `ejeY` visible | `sinEjeY` · mando `ejeY` |
| `ejeDesdeCero` | `ejeMin` · mando `cero` |
| `ordenada` | `ordenada` · mando `orden` |
| `borde` 🆕 | Solo en el texto de `explicacion` ("borde"); sin bandera ni mando |
| `resaltar` 🆕 | No existe |

⚠️ **verificar:** `tresd`, `arcoiris`, `ordenada` y `sinRejilla` valen `null` en las 79 gráficas. Los defectos de `taller` los aplican los mandos. Hay que confirmar en `alpha-taller` que el renderizador respeta estas banderas al usarlas en `clic-dato`.

### Estados a diseñar

Gráfica en reposo · elemento tocable · elemento seleccionado · correcto · incorrecto · atenuada (referencia "Antes") · con elemento resaltado.

### Ejemplo canónico

```json
{
  "tipo": "barras",
  "titulo": "Ventas por región",
  "unidad": "miles de pesos",
  "series": ["T2", "T3"],
  "filas": [
    { "clave": "norte", "et": "Norte", "vs": [175, 180] },
    { "clave": "sur",   "et": "Sur",   "vs": [120, 75]  }
  ],
  "ejes": { "y": { "titulo": "Ventas", "min": 0, "visible": true } },
  "resaltar": "sur",
  "estilo": { "rejilla": true, "tresd": false, "colorPorBarra": false }
}
```

---

## V3 · Miniaturas

**Dónde:** `dataset.miniaturas[]` (mecánica `miniaturas`, 35 ejercicios, 82 dibujos). Cada dibujo es una gráfica pequeña **sin ejes** (referencia en `lab_mecanicas`: 120×54).

| Campo | Tipo | Req. | Regla |
|---|---|---|---|
| `v` | texto | **Sí** | Identificador de la opción |
| `et` | texto | **Sí** | Descripción corta (también para accesibilidad) |
| `dibujo` | enum | **Sí** | Nombre del dibujo del catálogo |

**Catálogo `dibujo` (8 dibujos a diseñar):** `barras` (31) · `numero` (20) · `linea` (15) · `circular` (7) · `ganar_perder` (3) · `dispersion` (2) · `puntos` (2) · `color` (1).

⚠️ **Hallazgos:** 1 `dibujo` trae texto libre ("20% de clientes vs. 40% de ventas") en vez de un nombre del catálogo. **24 de 35 ejercicios tienen solo 2 opciones** (adivinar vale 50 %); propuesta: 3 o 4.

**Estados:** reposo · seleccionada · correcta · incorrecta.

---

## V4 · Vistas comparadas (conmutador)

**Dónde:** `dataset.vistas[]` (mecánica `conmutador`, 41 ejercicios, 55 vistas). Control segmentado que cambia entre vistas de lo mismo. No se corrige: cuenta como respondido cuando se abrieron todas.

| Campo | Tipo | Req. | Regla |
|---|---|---|---|
| `v` | texto | **Sí** | Identificador de la vista |
| `et` | texto | **Sí** | Descripción de la vista |
| `etiqueta` | texto | **Sí** | Texto corto del botón del segmentado ("Director") |
| `titulo` | texto | **Sí** | Título que se muestra con la vista |
| `nota` | texto | **Sí** | Qué resalta esta vista |
| `contexto` (nivel ejercicio) | texto | **Sí** | ✅ Único lugar donde `contexto` está lleno (41 de 41) |

⚠️ **Hallazgo importante:** una vista **no trae datos de gráfica**, solo textos. Los 55 `v` son casi todos distintos (~45 nombres: `boxplot`, `densidad`, `enjambre`, `rug`, `pearson`, `spearman`, `director`, `multiplos`, `resaltado`…). Si cada `v` es un dibujo propio en el código, **aquí está el mayor costo de diseño**: un visual nuevo por cada nombre. **Decisión abierta:** que cada vista referencie una `Grafica` de V2 en vez de un nombre. Además `sola` y `multiplos` se repiten con etiquetas distintas.

**Estados:** botón del segmentado en reposo · activo · ya visitado.

---

## V5 · Mandos (taller, antesdespues, revisar)

**Dónde:** `dataset.mandos[]` sobre una `Grafica`. Mecánicas `taller` (1), `antesdespues` (1), `revisar` (2). ⚠️ **Solo web** (`movil = false`).

| Campo | Tipo | Req. | Regla |
|---|---|---|---|
| `mandos[].v` | texto | **Sí** | Nombre del efecto. Debe estar en el catálogo `estilo` de V2 |
| `mandos[].et` | texto | **Sí** | Frase en imperativo ("Quitar el 3D de las barras") |
| `efectos` | `{ mando: efecto }` | No | Efecto compuesto (hoy 1: `color_por_ciudad → con_arcoiris`) |
| `grafica` | `Grafica` | **Sí** | La que se transforma en vivo |

La solución (en `lab_soluciones`) es la lista de `v` que hay que **aplicar**, separada por comas. Puede haber un mando **trampa** que no hay que tocar.

⚠️ **Duplicados a unificar:** `rejilla`/`cuadricula`, `tresd` (quita) / `agregar_3d` (pone), cinco nombres para "color por barra". Ver catálogo de V2.

**Estados:** mando apagado · encendido · efecto aplicado en la gráfica.

---

## V6 · Antes/Después y Reacomodar

### `cambios` (mecánica `cambios`, 1 ejercicio, apta para móvil)

| Campo | Tipo | Regla |
|---|---|---|
| `cambios.antes` | `Grafica` | Atenuada, de referencia |
| `cambios.despues` | `Grafica` | Interactiva: se tocan los puntos que cambiaron |
| `cambios.total` | número | Cuántos cambios hay |

La solución es la lista de `clave` que cambiaron. Dos gráficas apiladas.

### `reacomodar` (1 ejercicio, apta para móvil)

| Campo | Tipo | Regla |
|---|---|---|
| `reacomodar.fichas[]` | `{v, texto}` | Fichas por colocar |
| `reacomodar.casillas[]` | `{v, et, pos}` | Casillas sobre la gráfica. `pos` es `arriba` o una `clave` |
| `reacomodar.grafica` | `Grafica` | Gráfica ya dibujada |

---

## V7 · Fichas y grupos

**Dónde:** `piezas[]` y `grupos[]`. Mecánicas `ordenar` (127), `clasificar` (129), `conexiones` (5), `adivina`, `filtros`, `dinamica`. 1,095 piezas.

| Campo | Tipo | Req. | Regla |
|---|---|---|---|
| `piezas[].v` | texto | **Sí** | Identificador |
| `piezas[].et` | texto | **Sí** | Texto visible de la ficha |
| `piezas[].sub` | texto | No | Texto secundario (465 de 1,095) |
| `grupos[].id` | texto | **Sí** | Identificador del grupo |
| `grupos[].et` | texto | **Sí** | Nombre del grupo |
| `grupos[].cupo` | número | No | Máximo de fichas (20 casos; `conexiones` usa 4) |

**Estados de la ficha:** reposo · tomada · colocada · correcta · incorrecta · deshabilitada. **Estados del grupo:** vacío · con fichas · lleno · completo.

---

## V8 · Opciones

**Dónde:** `opciones[]`. Mecánicas `opcion` (580), `detective`, `encuesta`, `magnitud`, `armagrafica`. **2,234 opciones.**

| Campo | Tipo | Req. | Regla |
|---|---|---|---|
| `v` | texto | **Sí** | Identificador |
| `et` | texto | **Sí** | Texto. ⚠️ **Máximo 231 caracteres, 31 % pasa de 60.** Debe poder ir en varias líneas |
| `icono` | texto | No | Solo `armagrafica` (46): `chart-bar`, `chart-line`, `chart-pie`, `chart-dots` |
| `hoja` | `Hoja` | No | V1 junto a las opciones |

⚠️ **`opcion` no puede mostrar una gráfica** (solo tiene `hoja`). Un enunciado que diga "mira la gráfica" necesita otra mecánica.

**Estados:** reposo · seleccionada · correcta · incorrecta (con mensaje de `diagnosticos`).

---

## V9 · Plantilla con huecos (cloze, adivina)

**Dónde:** `formula` y `huecos[]`. 240 ejercicios con `formula`, 228 con `huecos`.

| Campo | Tipo | Req. | Regla |
|---|---|---|---|
| `formula.plantilla` | texto | **Sí** | La frase completa con marcadores `{h0}`, `{h1}`. Ej.: `"Mi audiencia es {h0}."` |
| `formula.celda` | texto \| null | No | Celda de la fórmula (`"F1"`). `null` si es una frase, no una fórmula |
| `huecos[].v` | texto | **Sí** | Debe coincidir con el marcador (`h0`) |
| `huecos[].et` | texto | **Sí** | Rótulo que se muestra sobre las piezas ("quién decide algo con este reporte") |
| `huecos[].piezas[]` | `{v, et}` | **Sí** | Paleta corta de este hueco. Máx. 3 a 4 |
| `intentos` | número | Solo `adivina` | Intentos permitidos |

🆕 **Regla de contenido (nacida del ejercicio de la captura):** si la frase empieza con "Y…" o continúa algo anterior, **la primera parte debe estar visible**: dentro de `plantilla` o en `contexto`.

**Estados del hueco:** vacío · activo · lleno · correcto · incorrecto. **Estados de la pieza:** disponible · usada.

---

## V10 · Pares (emparejar)

**Dónde:** `emparejar[]` (22 ejercicios). Dos columnas; se toca un lado y luego el otro.

| Campo | Tipo | Req. | Regla |
|---|---|---|---|
| `emparejar[].a` | texto | **Sí** | Elemento de la columna fija |
| `emparejar[].b` | texto | **Sí** | Su pareja. Un solo valor |

⚠️ **Hallazgo:** en **11 de 22 ejercicios** hay **una sola pareja** y el resto viene empaquetado dentro de `b` con `|` y `:` (ej. `"Texto grande|3 ciudades por 12 meses exactos:Tabla|…"`). ⚠️ **verificar en pantalla** (`ST-M2L1-06`) si el renderizador lo desempaqueta. Contrato: **una pareja por elemento de la lista**, mínimo 3.

---

## V11 · Caso con decisiones (escenario, ramificar)

**Dónde:** `decisiones[]` (6 ejercicios). Un caso con varias paradas; cada elección da retroalimentación sin bloquear.

| Campo | Tipo | Req. | Regla |
|---|---|---|---|
| `decisiones[].v` | texto | **Sí** | Identificador de la parada |
| `decisiones[].pregunta` | texto | **Sí** | La decisión |
| `decisiones[].opciones[]` | lista | **Sí** | `{v, et, nota, lleva[], siguiente}` |
| `…lleva[]` | `{coste, cuando}` | No | Consecuencia; `cuando` condiciona ("Añadir un cuarto tramo") |
| `…siguiente` | texto \| null | No | Parada a la que lleva (hoy siempre `null`: casos lineales) |
| `aciertos` | texto[] | Escenario | `v` de las mejores opciones. `ramificar` no tiene |

**Estados:** parada activa · opción elegida · consecuencia mostrada · resumen final.

---

## V12 · Pistas (detective)

**Dónde:** `pistasLista[]` + `opciones[]` + `hoja` (135 ejercicios).

| Campo | Tipo | Regla |
|---|---|---|
| `pistasLista[].v` | texto | Identificador |
| `pistasLista[].et` | texto | Texto de la pista; se abre al tocar, en cualquier orden |
| `opciones[]` | V8 | Se elige al final ("acusar") |

**Estados de la pista:** cerrada · abierta.

---

## V13 · Control numérico (estimar, magnitud, encuesta)

| Mecánica | Campo | Tipo | Regla |
|---|---|---|---|
| `estimar` (135) | `estimar.min`, `.max`, `.paso` | número | Rango del deslizador |
| | `estimar.tolerancia` | número | Margen de acierto (vive también en `lab_soluciones`) |
| | `estimar.sinValor` | bool | Oculta el número mientras se mueve |
| `magnitud` (6) | `vistaPrevia.izq`, `.der` | `{n, et}` | Dos cifras comparadas; `n` número, `et` descripción |
| | `opciones[]` | V8 | Órdenes de magnitud |
| `encuesta` (9) | `apuesta.acierta`, `.ordenada` | texto, bool | Qué opción es la cercana; si el orden importa |
| | `revelacion.texto`, `.valor` | texto | Lo que se destapa tras apostar |

**Estados del deslizador:** reposo · movido · cerca · lejos.

---

## V14 · Explicación y recorridos

| Mecánica | Campos | Notas |
|---|---|---|
| `explicacion` (251) | `detalle {titulo, texto}` · `explicacion.lineas[] {codigo, nota}` | Tarjeta de lectura. No se corrige; botón "Continuar" |
| `animada` (5) | `recorrido {fila, trae, busca, colBusca, colDestino}` · `detalle` · `formula` | Recorrido paso a paso sobre una hoja. No se corrige |
| `diagrama` (7) | `pasos[] {v, et, sub, fragmento}` · `fragmentos[] {v, et}` · `formula` | Pasos de una fórmula dibujados |
| `balance` (1) | `ecuacion {izq, der}` · `operaciones[] {v, et}` | Ecuación que se despeja con botones |
| `ajustar` (1) | `ajustar {rango, titulo, categorias[]}` | ⚠️ `categorias[].valor` es escalar (ver V2) |
| `arrastre` (2) | `referencias[] {v, base}` · `celdaAparte {et, ref, valor}` · `formula` | Fijar referencias con `$` |

⚠️ **verificar:** `animacion` (Excel, 4) no se observó con detalle.

---

# 4 · Estados genéricos que el diseño debe cubrir

Todo componente tocable necesita, como mínimo: **reposo · presionado · seleccionado · correcto · incorrecto · "casi" (error parcial) · deshabilitado**. Además, las pantallas necesitan: **vacío** (sin respuesta aún), **panel de acierto** y **panel de error**.

---

# 5 · Mapa mecánica → visuales

| Mecánica | Ejercicios | Familias que pinta | Móvil |
|---|---|---|---|
| `opcion` | 580 | V8 (+ V1) | Sí |
| `explicacion` | 251 | V14 | Sí |
| `cloze` | 228 | V9 (+ V1) | Sí |
| `detective` | 135 | V12 + V8 (+ V1) | Sí |
| `estimar` | 135 | V13 (+ V1) | Sí |
| `clasificar` | 129 | V7 | Sí |
| `ordenar` | 127 | V7 | Sí |
| `clic-celdas` | 82 | V1 | Sí |
| `clic-celda` | 72 | V1 | Sí |
| `clic-dato` | 59 | V2 | Sí |
| `conmutador` | 41 | V4 | Sí |
| `miniaturas` | 35 | V3 | Sí |
| `pintar` | 29 | V1 | Sí |
| `emparejar` | 22 | V10 | Sí |
| `armagrafica` | 16 | V2 + V8 | Sí |
| `filtros` | 10 | V1 + V7 | **No** |
| `encuesta` | 9 | V8 + V13 (+ V1) | Sí |
| `dinamica` | 7 | V1 + V7 | **No** |
| `diagrama` | 7 | V14 + V9 | Sí |
| `magnitud` | 6 | V13 | Sí |
| `conexiones` | 5 | V7 | Sí |
| `escenario` | 5 | V11 | Sí |
| `animada` | 5 | V14 | Sí |
| `adivina` · `arrastre` | 2 · 2 | V9 / V14 | Sí |
| `revisar` | 2 | V5 | **No** |
| `ajustar` · `balance` · `ramificar` · `reacomodar` · `cambios` | 1 c/u | V14 · V14 · V11 · V6 · V6 | Sí |
| `taller` · `antesdespues` | 1 c/u | V5 | **No** |
| `simulacion` | 0 | (construida, sin contenido) | **No** |

---

# 6 · Hallazgos en los datos que se corrigen contra este contrato

Es la lista de trabajo de la siguiente fase.

| # | Hallazgo | Alcance |
|---|---|---|
| H1 | **Filas de gráfica con valor no numérico o vacío** | 19 filas en 11 ejercicios: `ST-M2L3-03`, `ST-M2L8-04`, `ST-M4L1-04`, `ST-M5L1-04`, `ST-M6L1-02`, `ST-M6L1-03`, `ST-M8L1-02`, `ES-M7L2-03`, `ES-M9L1-04`, `ES-M10L4-02`, `ES-M11L5-04`. Patrón: la etiqueta se corta en una coma o en un `:` |
| H2 | **`emparejar` con parejas empaquetadas** | 11 de 22: `ST-M2L1-06`, `ST-M2L2-04`, `ST-M2L6-05`, `ST-M8L4-07`, `ES-M8L3-04`, `ES-M4L3-07`, `ES-M1L2-05`, `ES-M1L3-05`, `ES-M6L7-04`, `ES-M8L2-04`, `xl00-emparejar-01` |
| H3 | **Elementos tocables de una composición metidos en `grafica`** (leyenda, KPI, eje) | `ST-M5L1-04`, `ST-M6L1-03`, `ST-M8L1-02`. Necesitan la familia 🆕 *Composición con zonas tocables* |
| H4 | **Barras sin `clave`** | 13 filas |
| H5 | **Gráfica con forma distinta** (`ajustar.categorias`, `cambios`, `reacomodar`) | 3 ejercicios |
| H6 | **`miniaturas`**: 24 de 35 con 2 opciones; 1 `dibujo` con texto libre | 35 |
| H7 | **`contexto` vacío**, aunque el enunciado depende de un escenario previo | ≈ 1,980 ejercicios |
| H8 | **Texto "Pulsa Comprobar" sin botón** (`sinBoton: true`) | `clic-dato`, `miniaturas` |
| H9 | **Campos muertos o duplicados en `hoja`** | `cols` (524), `oculta` (524) |
| H10 | **Nombres duplicados de efecto** (`rejilla`/`cuadricula`, `tresd`/`agregar_3d`, 5 de "color por barra") | 17 mandos |
| H11 | **`gesto`**: 72 textos distintos, 909 vacíos | Todos |
| H12 | **Lección 1 de Storytelling**: narrativa y datos incoherentes, y falta el ejercicio de quitar ruido | 5 |

---

# 7 · Decisiones abiertas

1. **Significado de `cromo`, `estado`, `cuando`** (¿marco de la app? ¿qué hace `estado`?). Se confirma mirando `sq00-clic-celda-01`, `xl02-encuesta-01` y `xl00-opcion-02` en pantalla.
2. **Tipos de gráfica de la v1:** ¿barras, línea, circular, puntos, dispersión? Y si `circular` entra como opción de diseño o solo como mal ejemplo.
3. **Límites:** N de barras (2 a 6 propuesto), largo de etiqueta (≤ 14 propuesto), opciones por pregunta.
4. **`vistas`:** ¿cada una apunta a una `Grafica` o sigue siendo un dibujo propio en el código?
5. **Familia nueva: Composición con zonas tocables** (diapositiva, dashboard, interfaz), para sacar de V2 lo que no es gráfica. ¿Se crea?
6. **Móvil:** `taller`, `antesdespues` y `revisar` son solo web. ¿Se construye widget móvil o se usan variantes (`solo_movil` / `variante_de`)?
7. **Qué es `contexto`** visualmente: ¿tarjeta sobre el enunciado? ¿Se pinta en todas las mecánicas o solo en `conmutador`? ⚠️ **verificar**.

---

# 8 · Qué se le pide al diseño por familia

Por cada familia V1 a V14:

- Versión **web** y versión **móvil** (360 px de ancho como mínimo).
- Los **estados** listados en cada sección, en claro y en oscuro.
- Variantes de tamaño: tabla de 1×1 a 10×9 (V1), gráfica de 2 a 6 barras con 1 y 2 series (V2).
- Los **catálogos cerrados**: 5 roles de celda · 5 partes de Excel (`enfasis`) · 8 dibujos de miniatura · 15 íconos de paso · 3 tonos de paso · efectos de V2.
- **Comportamiento de texto largo** (opciones de hasta 231 caracteres, enunciados de hasta 331).
