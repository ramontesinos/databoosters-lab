# Auditoría de contenido · Storytelling · Módulo 1 "Audita"

**Contexto y audiencia** · 4 lecciones · 22 ejercicios · 14-oct-2026

> **Estado:** informe de revisión. **No se cambió nada en la base** por este informe. Primero se decide qué se hace (§6) y después se aplica con respaldo.

## Cómo se revisó

Se leyeron los 22 ejercicios completos: título, enunciado, pista, opciones o datos visuales, respuesta correcta, retroalimentación (`explica` y `diagnosticos`) y mecánica. Cada uno se evaluó con seis preguntas:

| # | Pregunta |
|---|---|
| 1 | **Contexto:** ¿el alumno ve en pantalla todo lo que necesita para contestar? |
| 2 | **Respuesta:** ¿hay una sola respuesta correcta y es defendible? |
| 3 | **Distractores:** ¿son plausibles y fallan por una razón que la lección enseña? |
| 4 | **Texto:** ¿el enunciado, el título y la pista se entienden y no se contradicen? |
| 5 | **Mecánica:** ¿es la que mejor ejemplifica la idea? |
| 6 | **Secuencia:** ¿encaja con lo que se enseñó antes y después? |

**Límites de esta revisión:** no vi la app ni cómo se ve cada pantalla, solo los datos. El criterio pedagógico es mío y conviene que lo valide quien conozca el curso a fondo. Los conceptos del módulo (quién/qué/cómo, la Gran Idea, el storyboard) están alineados con el enfoque de Cole Nussbaumer Knaflic que el propio curso cita.

---

# 1 · Veredicto en una página

| Veredicto | Ejercicios | Qué significa |
|---|---|---|
| ✅ **Sólido** | 2 | Se queda casi igual |
| 🔧 **Ajustar** | 11 | La idea y la mecánica sirven; falla el texto, el contexto, el orden o un dato |
| ♻️ **Rehacer** | 9 | Hay que cambiar el planteamiento o la mecánica |

**Lo que está bien.** La secuencia de conceptos del módulo es correcta (conocer el contexto, formular la idea, ordenar la historia). Los ejercicios de `opcion` de este módulo traen un mensaje de error específico por distractor, y los textos de `insight` están bien escritos. El problema no es de fondo: **es de forma**. Falta contexto en pantalla, los distractores son demasiado obvios, y hay datos y textos que se contradicen.

**Se usa demasiado la selección simple.** En el módulo 1, `opcion` y `explicacion` suman 13 de 22 ejercicios (**59 %**), de los más altos de todo Storytelling. Con la propuesta de §3 baja a 8 de 21 (**38 %**) y se incorporan `taller`, `antesdespues`, `armagrafica`, `escenario` y más `clasificar`.

## Los siete patrones que se repiten

No son errores sueltos. Aparecen en todo Storytelling, y el módulo 1 los muestra todos:

| # | Patrón | Alcance medido |
|---|---|---|
| P1 | **El orden en pantalla agrupa por tipo de mecánica** (primero explicación, luego opción, luego lo demás) en lugar de seguir una secuencia pedagógica | **34 de 36 lecciones** de Storytelling |
| P2 | **Tarjetas de lectura con el texto empaquetado** en una sola línea con `\|:` y sin término | `ST-M1L2-01`, `ST-M1L3-01`, `ST-M3L2-01` |
| P3 | **`contexto` vacío**: el escenario no está en pantalla | Casi todos los ejercicios |
| P4 | **Pista genérica** ("Revisa el contexto con calma.") | **74 de 205 (36 %)**: el 100 % de `ordenar` (14), `clasificar` (14) y `emparejar` (5), más las lecturas |
| P5 | **Título que no informa.** 11 son el enunciado cortado a media frase o idéntico (medido); en este módulo la mayoría es solo la última línea del enunciado ("¿Qué haces?"). `titulo_corto` está vacío | `titulo_corto` vacío en 205 de 205 (Excel lo tiene lleno en sus 500, p. ej. "Clasifica letras y números") |
| P6 | **`cloze` sin mensajes de error**; los de SQL, Python y Excel sí los traen en el 100 % | Los 9 de Storytelling (y los 9 de Estadística) |
| P7 | **Distractores absurdos** y respuesta correcta más larga o más específica | Varios, ver §3 |

**Sobre P1:** los `slug` (`ST-M1L2-03a`) conservan la secuencia del autor, y tampoco siempre es mejor (en la lección 3 el orden actual, que deja el `cloze` al final, es razonable). Por eso en §3 propongo un **orden explícito por lección**, no volver al del `slug`.

---

# 2 · Temario de Storytelling (reconstruido)

La base no guarda objetivos ni descripciones por lección (`lab_niveles.descripcion` y `concepto` están vacíos). El temario es solo la lista de planetas y lecciones. Lo siguiente es lo que hay, más el peso de lectura y opción de cada planeta.

| Planeta | Tema | Lecciones | Ejercicios | `opcion`+`explicacion` |
|---|---|---|---|---|
| 1 · Audita | Contexto y audiencia | Tu primera gráfica arreglada · Quién, qué y cómo · La Gran Idea · Storyboard | 22 | **59 %** |
| 2 · Visualia | Elegir el visual correcto | Texto, tabla o gráfica · Un número con contexto · Línea, barras y dispersión · Pequeños múltiplos · Slope chart · Proporciones y escala · Lo que hay que evitar · Tablas con mapa de calor | 49 | 29 % |
| 3 · Silencia | Eliminar el ruido visual | Quitar lo que sobra · Carga cognitiva y Gestalt · Alineación y espacio en blanco | 22 | 50 % |
| 4 · Farolito | Dirigir la atención | Atributos preatentivos · Color con propósito · Color y daltonismo · Tamaño, posición y anotaciones · Sombrear quién lidera · Anotar el espacio | 26 | 50 % |
| 5 · Trazón | Pensar como diseñador | Texto que ayuda · Affordances y accesibilidad · Estética y aceptación | 15 | **60 %** |
| 6 · Diagnostín | Analizar visuales modelo | Diagnosticar una gráfica · Reconstruir paso a paso | 13 | 38 % |
| 7 · Cuentito | Storytelling con datos | Inicio, medio y fin · Tensión y resolución · Revelar progresivamente · Repetir con propósito | 26 | 42 % |
| 8 · Tablerito | Dashboards y presentar | Un dashboard que se lee en 5 segundos · Gráficas para móvil y redes · Presentar en vivo · Ética | 21 | 57 % |
| 9 · Palomita | Checklist final | Un caso de principio a fin · Autoevaluación | 11 | 55 % |

**Observación de secuencia:** los planetas 3 y 4 (quitar ruido, dirigir la atención) son los que más necesitan visuales que se transforman (`taller`, `antesdespues`), y hoy casi no los usan. Es el siguiente módulo con más potencial después de este.

**Recomendación:** agregar un objetivo de una frase por lección (qué sabe hacer el alumno al terminar). Hoy el contenido no lo declara y esta revisión tuvo que inferirlo.

---

# 3 · Módulo 1, lección por lección

Las tablas siguen el **orden actual en pantalla**.

## Lección 1 · Tu primera gráfica arreglada (5 ejercicios)

*Objetivo inferido:* el alumno experimenta que quitar ruido y destacar un dato hace visible la historia, sin saber todavía las reglas.

| # | Ejercicio | Mecánica | Veredicto | Problema | Propuesta |
|---|---|---|---|---|---|
| 1 | `ST-M1L1-03` Lo que tocaste tiene nombre | explicación | 🔧 | Dice "lo que **quitaste**" y el alumno no quitó nada. Nombra "borde" y "leyenda", que ningún ejercicio toca | Pasarla **después** del `taller`; sus líneas deben coincidir con los mandos reales |
| 2 | `ST-M1L1-04` A dónde vas a llegar | explicación | 🔧 | Dice "25 lecciones" (hay **36**) y "como el que ves aquí" no muestra nada | "9 planetas"; mostrar un ejemplo real o quitar la frase |
| 3 | `ST-M1L1-05` ¿Qué cambió en la gráfica? | opción | ♻️ | No muestra ninguna gráfica (`opcion` no puede). La respuesta es la más larga y repite el enunciado, así que se contesta sola | Sustituir por `antesdespues` |
| 4 | `ST-M1L1-02` Toca la barra que cuenta la historia | clic-dato | 🔧 | Hay un solo trimestre: "cayó" no se puede demostrar, y el mensaje "Norte se mantuvo" no tiene datos que lo respalden | Dos trimestres (T2 y T3) con Sur de 120 a 75 |
| 5 | `ST-M1L1-01` ¿Qué gráfica te dice más rápido qué región cayó? | miniaturas | ♻️ | Solo 2 opciones (adivinar vale 50 %). El pastel tiene "6 rebanadas" y la gráfica tiene 4 regiones. Llega después de revelar la respuesta | `armagrafica` con 3 o 4 tipos sobre los mismos datos |
| — | **(falta)** quitar el ruido | — | ➕ | La lección promete "arreglar una gráfica" y **ningún ejercicio lo hace** | Nuevo `taller` |

**Lección propuesta (6):** 1 `clic-dato` sobre la gráfica ruidosa → 2 `taller` (quitar 3D, color por barra y rejilla; mando trampa: quitar el eje) → 3 `explicacion` (ponerle nombre a lo quitado) → 4 `armagrafica` → 5 `antesdespues` (quién subió y quién bajó) → 6 `explicacion` (adelanto del reporte final).

## Lección 2 · Quién, qué y cómo (7 ejercicios)

*Objetivo inferido:* antes de tocar un dato, definir quién lo ve, qué acción se espera y con qué herramienta se cuenta.

| # | Ejercicio | Mecánica | Veredicto | Problema | Propuesta |
|---|---|---|---|---|---|
| 1 | `ST-M1L2-01` Antes de tocar un dato | explicación | 🔧 | **Quién/Qué/Cómo vienen empaquetados en una sola línea** (`…\|:Qué —…\|:Cómo —…`), sin término. El enunciado repite el texto de la tarjeta | Separar en 3 líneas con su término y definición |
| 2 | `ST-M1L2-05` La frase que confunde informar con pedir | opción | ✅ | Buenos distractores con mensaje específico | Mantener |
| 3 | `ST-M1L2-06` ¿Qué le muestras primero? (3 minutos) | opción | 🔧 | La respuesta es "el número clave", pero las lecciones 3 y 4 enseñan a empezar por **la conclusión** (la Gran Idea). No existe esa opción | Respuesta: "La conclusión en una frase, con su número clave". El número solo, como distractor |
| 4 | `ST-M1L2-03a` Mi audiencia es ___ | cloze | ♻️ | **Sin escenario**: no hay forma de saber quién es la audiencia real. La correcta es la única con detalle ("que aprueba el presupuesto") | Fusionar con 03b y agregar `contexto` |
| 5 | `ST-M1L2-03b` Y quiero que ___ (tu captura) | cloze | ♻️ | **Falta la primera mitad** de la frase. Dos distractores absurdos ("admire la gráfica", "lea los números uno por uno"). La pista regala la respuesta | Idem |
| 6 | `ST-M1L2-02` Reparte cada frase en quién, qué o cómo | clasificar | 🔧 | Dice "un brief real", pero las piezas traen **dos audiencias y dos acciones distintas** (director de finanzas que aprueba Q4; equipo norte; decidir si cerrar una sucursal), así que parece mezclar dos briefs. Pista genérica | "Seis frases de dos briefs distintos". Pista real |
| 7 | `ST-M1L2-04` El mismo dato, dos audiencias | conmutador | ♻️ | Las dos vistas son **solo texto** (título y nota): no se ve cómo cambia el reporte | Que cada vista muestre su gráfica: dirección ve un número y un titular, operaciones ve el desglose por turno |

**Lección propuesta (6):** explicación → clasificar → **cloze de 2 huecos** → informar vs. pedir → qué muestras primero → conmutador con gráficas.

**Ejemplo del `cloze` fusionado** (resuelve la captura):

> **Contexto:** Mañana mandas el reporte de ventas de Q3 a 40 personas. Solo una decide si se aprueba el presupuesto de Q4: la directora de finanzas.
>
> **Frase:** *Mi audiencia es* **[ ? ]**. *Y quiero que* **[ ? ]**.

| Hueco | ✅ Correcta | ❌ Distractores plausibles |
|---|---|---|
| 1 · quién | la directora de finanzas, que aprueba el presupuesto | las 40 personas de la lista · yo mismo, para revisar mis cálculos |
| 2 · qué acción | decida si aprueba el presupuesto de Q4 | entienda mejor cómo nos fue en Q3 · esté al tanto de las ventas del trimestre |

Cada distractor con su mensaje: *"«Entender mejor» no es una acción: nadie puede comprobar si ocurrió"*, *"Estar al tanto informa, pero no pide nada"*.

## Lección 3 · La Gran Idea (5 ejercicios)

*Objetivo inferido:* formular la conclusión en una sola frase con punto de vista, con lo que está en juego y completa.

| # | Ejercicio | Mecánica | Veredicto | Problema | Propuesta |
|---|---|---|---|---|---|
| 1 | `ST-M1L3-01` La Gran Idea | explicación | 🔧 | Líneas empaquetadas (P2). El texto es una definición cortada, sin sujeto ("Una sola frase, con punto de vista…") | "La Gran Idea es tu conclusión en una sola frase. Tiene tres partes:" y 3 líneas |
| 2 | `ST-M1L3-03` ¿Cuál es una Gran Idea? | opción | ♻️ | Pregunta dos cosas ("cuál… y cuáles son solo el tema") con un solo toque. Dos de tres opciones son obviamente solo tema | `clasificar`: 6 frases en "Solo es un tema" / "Es una Gran Idea" |
| 3 | `ST-M1L3-04` ¿Qué le falta a "Las ventas de Q3"? | opción | 🔧 | Repite lo de #2 (tema contra idea) y su respuesta está en la tarjeta anterior | Fusionar con #2: la clasificación ya lo cubre |
| 4 | `ST-M1L3-05` Tu Gran Idea quedó en dos oraciones | opción | ✅ | Título "¿Qué haces?" no informa | Mantener; título "Una Gran Idea de dos oraciones" |
| 5 | `ST-M1L3-02` Arma la Gran Idea: la causa real | cloze | ♻️ | **"Este caso" no existe**: no hay datos. La "causa real" es imposible de deducir y los distractores (el clima, el equipo) se descartan por sentido común | `cloze` con `hoja` de datos, para que la causa **se deduzca** |

**Lección propuesta (4):** explicación → clasificar (tema o idea) → "dos oraciones" → cloze con hoja.

**Ejemplo de la hoja** (ventas de Q2 a Q3 que suman −12 %):

| Sucursal | Horas de atención por semana | Ventas Q2 | Ventas Q3 |
|---|---|---|---|
| Norte | 60 → **40** | 150 | **115** |
| Sur | 60 | 100 | 106 |
| Centro | 70 → **45** | 160 | **125** |
| Occidente | 50 | 90 | 94 |

Con esos datos la respuesta "dos sucursales clave redujeron su horario" **se lee en la tabla**. Los distractores pasan a ser "las cuatro sucursales vendieron menos por igual" (falso según los datos) y "el clima estuvo más lluvioso" (sin respaldo en los datos).

## Lección 4 · Storyboard (5 ejercicios)

*Objetivo inferido:* ordenar la historia con tarjetas antes de abrir la herramienta, dejando fuera lo que no sostiene la Gran Idea.

| # | Ejercicio | Mecánica | Veredicto | Problema | Propuesta |
|---|---|---|---|---|---|
| 1 | `ST-M1L4-01` Post-its antes que la herramienta | explicación | 🔧 | El enunciado está en imperativo ("Ordena la historia…") pero es una lectura sin respuesta. Sin líneas | Redactarlo en declarativo |
| 2 | `ST-M1L4-02` El post-it que no aporta | opción | ♻️ | Dice **"5 post-its" y muestra 4**. La Gran Idea del caso nunca se enuncia. La anécdota es obviamente ajena | `clasificar` ("Entra" / "Se queda fuera") con 6 post-its y la Gran Idea en `contexto` |
| 3 | `ST-M1L4-04` ¿Papel o PowerPoint? | opción | 🔧 | La respuesta ya se dio en la tarjeta anterior (mover una tarjeta cuesta un segundo): mide memoria, no criterio | `escenario`: "El director pide empezar por la conclusión y ya tienes 12 diapositivas", con el coste de cada camino |
| 4 | `ST-M1L4-03` Flujo de la presentación de Q3 | ordenar | 🔧 | **El orden no es único**: "comparación" y "causa" pueden ir en cualquier orden con buenos argumentos. Los `sub` regalan la primera y la última. Pista genérica | Integrar la comparación en el dato clave: 5 piezas con un solo orden defendible. Pista real |
| 5 | `ST-M1L4-05` Flujo del lanzamiento | ordenar | ♻️ | La **pista está escrita dentro del título y del enunciado**. El orden "mes 1, mes 3" después de la causa es arbitrario | 5 piezas: idea, dato, causa (mes 2), "cómo evolucionó de mes 1 a mes 3", acción |

**Lección propuesta (5):** explicación → clasificar (post-its) → escenario (coste de reordenar) → ordenar → ordenar.

---

# 4 · El módulo 1 antes y después

| | Hoy | Propuesto |
|---|---|---|
| Ejercicios | 22 | 21 |
| `opcion` | 8 | 3 |
| `opcion` + `explicacion` | 13 (59 %) | 8 (38 %) |
| Mecánicas distintas | 8 | 11 |
| Ejercicios con un visual de datos (gráfica u hoja) | 2 | 6 |
| `clasificar` | 1 | 3 |
| `taller`, `antesdespues`, `armagrafica`, `escenario` | 0, 0, 0, 0 | 1, 1, 1, 1 |

---

# 5 · Qué depende de qué

| Cambio | Mecánica | ¿Existe hoy? | ¿Se puede hacer solo con datos? |
|---|---|---|---|
| Separar las líneas empaquetadas (3 tarjetas) | `explicacion` | Sí | **Sí** |
| `cloze` de 2 huecos con contexto y mensajes de error | `cloze` | Sí (hay ejemplos de 2 huecos en SQL) | **Sí**, si el renderizador pinta `contexto` ⚠️ |
| `cloze` con `hoja` | `cloze` | Sí | **Sí** |
| Clasificar (tema o idea; post-its) | `clasificar` | Sí (14 en Storytelling) | **Sí** |
| Escenario con costes | `escenario` | Sí (1 en Storytelling) | **Sí** |
| Ordenar con orden único | `ordenar` | Sí | **Sí** |
| Títulos cortos, pistas reales, orden explícito | — | — | **Sí** |
| Quitar ruido (`taller`) y quién subió o bajó (`antesdespues`) | `taller`, `antesdespues` | Sí, pero **solo web** | Sí en web. **Móvil requiere widget o variante** |
| Conmutador con gráficas reales | `conmutador` | Sí | **No**: las vistas hoy no llevan datos de gráfica; requiere renderizador |
| Gráfica ruidosa (3D, color por barra, rejilla) | `clic-dato` | Sí | ⚠️ Esas banderas existen en el esquema pero **ningún ejercicio las usa**: confirmar que se respetan |
| Resaltar una barra | — | **No** (`resaltar`) | **No**: requiere renderizador |

---

# 6 · Decisiones que necesito

Con mi recomendación para cada una:

| # | Decisión | Recomendación |
|---|---|---|
| 1 | ¿Se aprueba la propuesta del módulo 1 (22 a 21 ejercicios)? Se puede aprobar por lección | **Sí, lección por lección**, empezando por la 2: es la que explica tu captura |
| 2 | ¿Se aplica ahora lo que solo requiere datos, y lo visual queda como especificación para cuando haya app? | **Sí.** Lo visual (`taller`, `antesdespues`, conmutador con gráficas) se prepara pero no se publica hasta verlo en pantalla |
| 3 | ¿El orden por tipo de mecánica era **intencional** (de lo más simple a lo más interactivo)? | Si fue intencional, conviene reformularlo: un orden pedagógico explícito por lección. Lo defino para el módulo 1 |
| 4 | `ST-M1L2-06`: ¿la respuesta debe ser "la conclusión con su número clave"? | **Sí**, para ser coherente con las lecciones 3 y 4 |
| 5 | ¿Valido los datos de ejemplo que inventé (4 sucursales, trimestres de la lección 1)? | **Revísalos tú**: son ficticios pero deben sonar a tu negocio |
| 6 | ¿Fusiono `03a` con `03b`, y `L3-03` con `L3-04`? | **Sí**: ahorra pantallas y quita redundancia |
| 7 | ¿Escribo ya pistas reales y títulos cortos para los 22 del módulo? | **Sí.** Para los otros 33 ejercicios con pista genérica en Storytelling, después |

**Si se aprueba, el plan de aplicación es:** respaldo en el esquema privado `respaldo` → cambios lección por lección → verificación con las mismas consultas de esta revisión → registro en el contrato de visuales.
