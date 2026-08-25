/* =========================================================================
   DATABOOSTERS · LABORATORIO SQL
   ejercicios.js  —  ESTE ES EL UNICO ARCHIVO QUE NECESITAS EDITAR
   =========================================================================

   Aqui no hay logica, solo datos. Dos cosas:

     DATASETS    las bases de datos disponibles (CREATE TABLE + INSERT)
     EJERCICIOS  la lista de ejercicios, en orden

   ------------------------------------------------------------------------
   COMO AGREGAR UN EJERCICIO
   ------------------------------------------------------------------------
   Copia un objeto de EJERCICIOS entero y cambia lo que necesites:

     id         texto unico, sin espacios. Aparece en la URL: ?ej=sel-01
     titulo     el nombre corto que se ve arriba
     tema       para el filtro de temas. Si escribes uno nuevo, aparece solo
                como chip. Los que hay: Básico, Filtros, Orden, Agrupación,
                JOINs
     concepto   OPCIONAL pero recomendado. Es la parte que se ENSENA antes
                del reto, al estilo de W3Schools: primero entiendes, luego
                practicas. Cuatro campos:
                  titulo    de que va
                  texto     la explicacion. Admite <b> <code> <br>
                  sintaxis  la forma general, en monoespaciada
                  ejemplo   una consulta REAL sobre este dataset, que el
                            alumno puede ejecutar con un boton
                  queHace   una linea diciendo que devuelve el ejemplo
                Si lo omites, el ejercicio simplemente no muestra el bloque.
     enunciado  la instruccion. Admite HTML simple: <b> <code> <br>
     pista      se muestra solo si el alumno la pide
     dataset    la clave de DATASETS contra la que se consulta
     plantilla  lo que aparece escrito en el editor al abrir
     solucion   la consulta correcta. NO se le ensena al alumno salvo que
                pulse "Ver solucion". De aqui SE CALCULA el resultado
                esperado, en vivo: si manana cambias un INSERT del dataset,
                lo esperado se recalcula solo y nada se rompe.
     comparar   como se compara. Los tres ajustes:

                orden: "libre"     ignora el orden de las filas (por defecto)
                orden: "estricto"  exige el mismo orden. Usalo SOLO cuando el
                                   ejercicio pida ORDER BY, o castigarias algo
                                   que no ensenaste.

                columnas: "posicion"  compara por posicion e ignora los
                                      nombres (por defecto). Asi un alias como
                                      "AS cliente" no marca error.
                columnas: "nombre"    exige los nombres. Solo si el ejercicio
                                      es justo sobre alias.

                decimales: 2       a cuantos decimales se redondean los
                                   numeros antes de comparar, para que 1.0
                                   y 1.00 no cuenten como distintos.

                mayusculas: false  si es true, "MEXICO" y "Mexico" difieren.

   ------------------------------------------------------------------------
   COMO AGREGAR UN DATASET
   ------------------------------------------------------------------------
   Agrega una clave a DATASETS con su nombre y su SQL completo (CREATE TABLE
   e INSERT). Se ejecuta tal cual sobre una base SQLite en blanco, y se
   reconstruye entera antes de cada verificacion.
   ========================================================================= */

const DATASETS = {

  tiendamx: {
    nombre: "TiendaMX",
    descripcion: "Una tienda en línea con clientes, productos y pedidos.",
    sql: `
CREATE TABLE clientes (
  id              INTEGER PRIMARY KEY,
  nombre          TEXT    NOT NULL,
  email           TEXT,
  ciudad          TEXT,
  fecha_registro  TEXT
);

CREATE TABLE productos (
  id         INTEGER PRIMARY KEY,
  nombre     TEXT    NOT NULL,
  categoria  TEXT,
  precio     REAL,
  stock      INTEGER
);

CREATE TABLE pedidos (
  id          INTEGER PRIMARY KEY,
  cliente_id  INTEGER,
  fecha       TEXT,
  estado      TEXT,
  total       REAL
);

CREATE TABLE detalle_pedidos (
  id              INTEGER PRIMARY KEY,
  pedido_id       INTEGER,
  producto_id     INTEGER,
  cantidad        INTEGER,
  precio_unitario REAL
);

INSERT INTO clientes (id, nombre, email, ciudad, fecha_registro) VALUES
  (1,  'Ximena Robledo',    'ximena.robledo@correo.mx',  'Guadalajara', '2025-01-14'),
  (2,  'Alonso Barragán',   'alonso.b@correo.mx',        'Monterrey',   '2025-01-28'),
  (3,  'Fernanda Quiroz',   'fer.quiroz@correo.mx',      'CDMX',        '2025-02-03'),
  (4,  'Rodrigo Elizondo',  'r.elizondo@correo.mx',      'Monterrey',   '2025-02-19'),
  (5,  'Citlali Mendoza',   'citlali.m@correo.mx',       'Puebla',      '2025-03-07'),
  (6,  'Emiliano Cázares',  'emi.cazares@correo.mx',     'Mérida',      '2025-03-22'),
  (7,  'Regina Ocampo',     'regina.ocampo@correo.mx',   'CDMX',        '2025-04-05'),
  (8,  'Santiago Nájera',   'santi.najera@correo.mx',    'Querétaro',   '2025-04-18'),
  (9,  'Valeria Sandoval',  'vale.sandoval@correo.mx',   'Guadalajara', '2025-05-02'),
  (10, 'Mauricio Alcántara', NULL,                       'Tijuana',     '2025-05-21'),
  (11, 'Ana Karen Peña',    'anakaren.p@correo.mx',      'León',        '2025-06-09'),
  (12, 'Diego Villalobos',  'diego.v@correo.mx',         'CDMX',        '2025-06-27');

INSERT INTO productos (id, nombre, categoria, precio, stock) VALUES
  (1,  'Teclado mecánico Aurora',     'Periféricos',  1899.00, 42),
  (2,  'Mouse inalámbrico Zafiro',    'Periféricos',   649.00, 130),
  (3,  'Monitor 27" QuadHD',          'Pantallas',   6499.00, 18),
  (4,  'Laptop Nébula 14',            'Cómputo',    23999.00,  7),
  (5,  'Audífonos Bruma ANC',         'Audio',       2799.00, 55),
  (6,  'Base enfriadora Tramontana',  'Accesorios',   499.00, 76),
  (7,  'Cámara web Nitidez 1080',     'Periféricos',  899.00, 64),
  (8,  'Disco SSD 1 TB Relámpago',    'Almacenamiento', 1749.00, 90),
  (9,  'Silla ergonómica Cumbre',     'Mobiliario',  5299.00, 12),
  (10, 'Hub USB-C siete puertos',     'Accesorios',   749.00, 88),
  (11, 'Micrófono Vereda USB',        'Audio',       1599.00, 31),
  (12, 'Tableta gráfica Trazo M',     'Periféricos',  2299.00, 23);

INSERT INTO pedidos (id, cliente_id, fecha, estado, total) VALUES
  (1001, 1,  '2025-06-02', 'entregado',  2548.00),
  (1002, 3,  '2025-06-05', 'entregado',  6499.00),
  (1003, 2,  '2025-06-11', 'cancelado',   649.00),
  (1004, 5,  '2025-06-14', 'entregado', 23999.00),
  (1005, 1,  '2025-06-20', 'enviado',    3298.00),
  (1006, 7,  '2025-06-23', 'entregado',  1248.00),
  (1007, 4,  '2025-07-01', 'entregado',  5299.00),
  (1008, 9,  '2025-07-04', 'pendiente',  1749.00),
  (1009, 3,  '2025-07-09', 'entregado',  4098.00),
  (1010, 11, '2025-07-15', 'enviado',     749.00),
  (1011, 6,  '2025-07-19', 'entregado',  2299.00),
  (1012, 12, '2025-07-25', 'cancelado',  6499.00),
  (1013, 8,  '2025-08-02', 'entregado',  1599.00),
  (1014, 1,  '2025-08-08', 'pendiente',   499.00),
  (1015, 9,  '2025-08-13', 'entregado',  8798.00);

INSERT INTO detalle_pedidos (id, pedido_id, producto_id, cantidad, precio_unitario) VALUES
  (1,  1001, 1,  1, 1899.00),
  (2,  1001, 2,  1,  649.00),
  (3,  1002, 3,  1, 6499.00),
  (4,  1003, 2,  1,  649.00),
  (5,  1004, 4,  1, 23999.00),
  (6,  1005, 5,  1, 2799.00),
  (7,  1005, 6,  1,  499.00),
  (8,  1006, 7,  1,  899.00),
  (9,  1006, 10, 0,  749.00),
  (10, 1007, 9,  1, 5299.00),
  (11, 1008, 8,  1, 1749.00),
  (12, 1009, 5,  1, 2799.00),
  (13, 1009, 11, 0, 1599.00),
  (14, 1010, 10, 1,  749.00),
  (15, 1011, 12, 1, 2299.00),
  (16, 1012, 3,  1, 6499.00),
  (17, 1013, 11, 1, 1599.00),
  (18, 1014, 6,  1,  499.00),
  (19, 1015, 3,  1, 6499.00),
  (20, 1015, 12, 1, 2299.00);
`
  }

};


const EJERCICIOS = [

  {
    id: "sel-01",
    titulo: "Tu primera consulta",
    tema: "Básico",

    concepto: {
      titulo: "SELECT: elegir qué columnas quieres ver",
      texto:
        "Una tabla puede tener veinte columnas y a ti interesarte dos. " +
        "<code>SELECT</code> dice <b>qué columnas</b> quieres, y " +
        "<code>FROM</code> dice <b>de qué tabla</b>. Nada más. Si quieres " +
        "todas las columnas existe el atajo <code>SELECT *</code>, pero en " +
        "el trabajo real casi siempre conviene pedir solo lo que vas a usar.",
      sintaxis: "SELECT columna1, columna2\nFROM tabla;",
      ejemplo: "SELECT nombre, precio\nFROM productos",
      queHace: "Trae dos columnas de los 12 productos: cómo se llaman y cuánto cuestan."
    },
    enunciado:
      "La tabla <code>clientes</code> guarda a toda la gente que ha comprado en TiendaMX. " +
      "Trae el <b>nombre</b> y la <b>ciudad</b> de todos los clientes.",
    pista:
      "La forma básica es <code>SELECT columna1, columna2 FROM tabla</code>. " +
      "Las columnas van separadas por coma, en el orden que las quieras ver.",
    dataset: "tiendamx",
    plantilla: "SELECT ",
    solucion: "SELECT nombre, ciudad FROM clientes",
    comparar: { orden: "libre", columnas: "posicion", decimales: 2 }
  },

  {
    id: "sel-02",
    titulo: "Filtrar con WHERE",
    tema: "Filtros",

    concepto: {
      titulo: "WHERE: quedarte solo con las filas que te importan",
      texto:
        "<code>SELECT</code> recorta columnas; <code>WHERE</code> recorta " +
        "<b>filas</b>. Va siempre después del FROM, y lleva una condición " +
        "que cada fila cumple o no cumple. Las que no la cumplen, no salen." +
        "<br><br>Ojo con las comillas: los textos van entre comillas simples " +
        "(<code>'entregado'</code>) y los números van pelones " +
        "(<code>500</code>). Es el error más común al empezar.",
      sintaxis: "SELECT columnas\nFROM tabla\nWHERE condición;",
      ejemplo: "SELECT nombre, ciudad\nFROM clientes\nWHERE ciudad = 'CDMX'",
      queHace: "De los 12 clientes deja solo los 3 que viven en CDMX."
    },
    enunciado:
      "El equipo de logística solo quiere ver los pedidos que ya se entregaron. " +
      "Trae el <b>id</b>, la <b>fecha</b> y el <b>total</b> de los pedidos cuyo " +
      "estado sea <code>'entregado'</code>.",
    pista:
      "Se filtra con <code>WHERE columna = 'valor'</code>. Los textos van entre " +
      "comillas simples; los números, sin comillas.",
    dataset: "tiendamx",
    plantilla: "SELECT id, fecha, total\nFROM pedidos\nWHERE ",
    solucion: "SELECT id, fecha, total FROM pedidos WHERE estado = 'entregado'",
    comparar: { orden: "libre", columnas: "posicion", decimales: 2 }
  },

  {
    id: "sel-03",
    titulo: "Ordenar el resultado",
    tema: "Orden",

    concepto: {
      titulo: "ORDER BY y LIMIT: ordenar y quedarte con los primeros",
      texto:
        "Sin <code>ORDER BY</code>, SQL <b>no garantiza</b> en qué orden te " +
        "devuelve las filas. Si el orden te importa, tienes que pedirlo." +
        "<br><br><code>DESC</code> ordena de mayor a menor y " +
        "<code>ASC</code> de menor a mayor (es lo que hace por defecto). " +
        "<code>LIMIT</code> corta el resultado, y va siempre al final." +
        "<br><br>Los dos juntos son la forma normal de pedir un top: primero " +
        "ordena, luego corta.",
      sintaxis: "SELECT columnas\nFROM tabla\nORDER BY columna DESC\nLIMIT n;",
      ejemplo: "SELECT nombre, stock\nFROM productos\nORDER BY stock ASC\nLIMIT 3",
      queHace: "Los 3 productos con menos existencias, del más escaso hacia arriba."
    },
    enunciado:
      "Dirección pide los cinco productos más caros. Trae el <b>nombre</b> y el " +
      "<b>precio</b> de los productos, del más caro al más barato, y quédate solo " +
      "con los primeros cinco.",
    pista:
      "<code>ORDER BY precio DESC</code> ordena de mayor a menor, y " +
      "<code>LIMIT 5</code> corta el resultado. El LIMIT va al final.",
    dataset: "tiendamx",
    plantilla: "SELECT nombre, precio\nFROM productos\n",
    solucion: "SELECT nombre, precio FROM productos ORDER BY precio DESC LIMIT 5",
    // Aqui el orden SI importa: el ejercicio pide ordenar, asi que se exige.
    comparar: { orden: "estricto", columnas: "posicion", decimales: 2 }
  },

  {
    id: "agr-01",
    titulo: "Contar por grupo",
    tema: "Agrupación",

    concepto: {
      titulo: "GROUP BY: convertir muchas filas en un resumen",
      texto:
        "Hasta ahora una fila del resultado era una fila de la tabla. Con " +
        "<code>GROUP BY</code> eso cambia: las filas que comparten un valor " +
        "se juntan en <b>un solo grupo</b>, y el resultado trae una fila por " +
        "grupo, no por registro." +
        "<br><br>Casi siempre viene acompañado de una función que resume cada " +
        "grupo. <code>COUNT(*)</code> cuenta cuántas filas cayeron dentro." +
        "<br><br>Regla práctica: lo que pones en el GROUP BY es lo que puedes " +
        "pedir en el SELECT sin resumirlo.",
      sintaxis: "SELECT columna, COUNT(*)\nFROM tabla\nGROUP BY columna;",
      ejemplo: "SELECT categoria, COUNT(*)\nFROM productos\nGROUP BY categoria",
      queHace: "Convierte 12 productos en 7 filas: cuántos productos hay por categoría."
    },
    enunciado:
      "Marketing quiere saber en qué ciudades está su gente. Cuenta " +
      "<b>cuántos clientes</b> hay por <b>ciudad</b>.",
    pista:
      "<code>GROUP BY ciudad</code> junta las filas de cada ciudad, y " +
      "<code>COUNT(*)</code> cuenta cuántas cayeron en cada grupo.",
    dataset: "tiendamx",
    plantilla: "SELECT ciudad, \nFROM clientes\n",
    solucion: "SELECT ciudad, COUNT(*) AS clientes FROM clientes GROUP BY ciudad",
    comparar: { orden: "libre", columnas: "posicion", decimales: 0 }
  },

  {
    id: "agr-02",
    titulo: "Sumar dinero",
    tema: "Agrupación",

    concepto: {
      titulo: "SUM, AVG, MIN, MAX: sacar una cifra de muchas filas",
      texto:
        "<code>COUNT</code> cuenta filas, pero también puedes operar sobre " +
        "los valores: <code>SUM</code> suma, <code>AVG</code> promedia, " +
        "<code>MIN</code> y <code>MAX</code> buscan el extremo." +
        "<br><br>Si no pones <code>GROUP BY</code>, la función trabaja sobre " +
        "<b>todas las filas juntas</b> y te devuelve <b>una sola fila</b>. " +
        "Eso es justo lo que quieres cuando buscas un total." +
        "<br><br>El <code>WHERE</code> se aplica <b>antes</b> de sumar, así " +
        "que filtra qué filas entran en la cuenta.",
      sintaxis: "SELECT SUM(columna)\nFROM tabla\nWHERE condición;",
      ejemplo: "SELECT AVG(precio)\nFROM productos\nWHERE categoria = 'Periféricos'",
      queHace: "Un solo número: el precio promedio de los periféricos."
    },
    enunciado:
      "Finanzas pide una sola cifra: <b>cuánto se facturó en total</b> en los " +
      "pedidos que sí llegaron a entregarse.",
    pista:
      "<code>SUM(total)</code> suma la columna. Recuerda filtrar antes con " +
      "<code>WHERE estado = 'entregado'</code>.",
    dataset: "tiendamx",
    plantilla: "SELECT \nFROM pedidos\nWHERE ",
    solucion: "SELECT SUM(total) AS facturado FROM pedidos WHERE estado = 'entregado'",
    comparar: { orden: "libre", columnas: "posicion", decimales: 2 }
  },

  {
    id: "join-01",
    titulo: "Unir dos tablas",
    tema: "JOINs",

    concepto: {
      titulo: "JOIN: pegar dos tablas por su punto en común",
      texto:
        "Las bases de datos no repiten información. La tabla " +
        "<code>pedidos</code> no guarda el nombre del cliente, guarda su " +
        "<code>cliente_id</code>. Si quieres ver el nombre, tienes que ir a " +
        "buscarlo a <code>clientes</code>: eso es un <code>JOIN</code>." +
        "<br><br>El <code>ON</code> dice <b>por dónde se pegan</b>: qué " +
        "columna de una equivale a cuál de la otra." +
        "<br><br>Cuando dos tablas tienen columnas con el mismo nombre (las " +
        "dos tienen <code>id</code>), hay que decir de cuál hablas: " +
        "<code>pedidos.id</code>. Por eso se les pone un apodo corto " +
        "(<code>pedidos p</code>) y luego se escribe <code>p.id</code>.",
      sintaxis: "SELECT a.col, b.col\nFROM tabla_a a\nJOIN tabla_b b ON a.clave = b.clave;",
      ejemplo: "SELECT d.pedido_id, pr.nombre, d.cantidad\nFROM detalle_pedidos d\nJOIN productos pr ON d.producto_id = pr.id",
      queHace: "Cambia el producto_id por el nombre real del producto en cada renglón del pedido."
    },
    enunciado:
      "Los pedidos guardan el <code>cliente_id</code>, no el nombre. Trae el " +
      "<b>id del pedido</b>, el <b>nombre del cliente</b> y el <b>total</b>, " +
      "solo de los pedidos <code>'entregado'</code>.",
    pista:
      "<code>FROM pedidos JOIN clientes ON pedidos.cliente_id = clientes.id</code>. " +
      "Si dos tablas tienen una columna con el mismo nombre, di de cuál hablas: " +
      "<code>pedidos.id</code>.",
    dataset: "tiendamx",
    plantilla: "SELECT p.id, c.nombre, p.total\nFROM pedidos p\n",
    solucion:
      "SELECT p.id, c.nombre, p.total FROM pedidos p " +
      "JOIN clientes c ON p.cliente_id = c.id WHERE p.estado = 'entregado'",
    comparar: { orden: "libre", columnas: "posicion", decimales: 2 }
  }

];
