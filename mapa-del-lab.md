# Mapa del Lab · cómo está hoy y qué conviene decidir

**14-oct-2026** · Fuentes leídas: Supabase en solo lectura, y el repo `databoosters` clonado en solo lectura (`CLAUDE.md`, `_reglas/LAB.md`, `_diseno/GUIA-MECANICAS.md`, `_diseno/REESTRUCTURA.md`, `docs/`, el Excel de temario v14, `_lab/`, `_lab_kit_pruebas/`, `_qa_mecanicas/`).

> **Lo que no pude verificar:** no vi la app ni el sitio en pantalla, no corrí ningún script del repo, y no sé si `_lab/` de SQL y Excel coincide fila por fila con la base (solo conté). Lo marcado ⚠ requiere confirmación.

---

# 1 · La cadena de datos

1. **Fuente:** Excel "Super Excel", una pestaña por mecánica, una fila por ejercicio.
2. **Conversión:** JSON por mecánica en `_lab/<ruta>/<módulo>/`.
3. **Validación:** `python _verificar_json.py <carpeta>`.
4. **Carga:** `_cargar_alpha.py`, por **borrado e inserción por slug** (borra el progreso del ejercicio).
5. **Base:** `lab_ejercicios`, `lab_soluciones`, `lab_lecciones`, `lab_niveles`, `lab_rutas`.
6. **Lectura:** `lab_ejercicio_publico` y `lab_ejercicio_movil`; corrige `lab_resolver_opcion` en el servidor.
7. **Clientes:** la web (databoosters.net) y la app iOS.

| Tabla | Qué guarda | Nota verificada |
|---|---|---|
| `lab_rutas` | Los mundos | `python` está `activa=false`, `oculta=true` |
| `lab_niveles` | Planetas | `numero` empieza en **0** (Excel, SQL, Python) o en **1** (Estadística, Storytelling). `descripcion` vacío en los 55 planetas. `nombre_planeta` propio solo en Excel (y SQL 0); el resto dice "Planeta N" |
| `lab_lecciones` | Lecciones | Sin descripción ni objetivo |
| `lab_ejercicios` | El ejercicio | **`tipo` no es la mecánica** (vale `sql` u `opcion` por defecto). La mecánica es `dataset->>'interaccion'`, y `dataset` es **texto**, no jsonb. `dificultad` vale `basico` en el 100 % |
| `lab_soluciones` | Respuesta, resultado, comparación, diagnósticos, explicación | Separada, no se expone al navegador |
| `lab_mecanicas` | Reglas de cada una (34 filas) | `con_boton` **no** indica si hay botón visible (`cloze` lo tiene en `false` y muestra uno) |
| `lab_mecanicas_esquema` | Pensada para el esquema de cada mecánica | **Vacía (0 filas)** |
| `lab_datasets` | Bases de datos para SQL | — |

---

# 2 · De dónde sale cada ruta

| Ruta | Filas en la base | Fuente de lo publicado | Ejercicios en `_lab/` (JSON del repo) | Lo publicado, ¿sale de `_lab/`? |
|---|---|---|---|---|
| Excel | 500 | `_lab/excel/*/_fuente/*.xlsx` | 319 | **En parte.** Faltan 181 en `_lab/` ⚠ |
| SQL | 481 | Cargadores `_cargar_sql_*` | 263 | **En parte.** Faltan 218 ⚠ |
| Estadística | 347 | Kit `_lab_kit_pruebas/estadistica-completo.xlsx` (slugs `ES-M…L…`) | 134 | **No: 0 de 347** |
| Storytelling | 205 | Kit `_lab_kit_pruebas/storytelling-completo.xlsx` (slugs `ST-M…L…`) | 197 | **No: 0 de 205** |
| Python | 437 | Cargador `_cargar_python.mjs` | 0 | Oculta. Su kit no se conservó |

**Lectura:** como mucho, 617 de los 2,008 ejercicios (31 %) tienen respaldo en `_lab/`, que `CLAUDE.md` declara como el único sitio del contenido. Storytelling y Estadística tienen **dos versiones distintas**: la publicada (kit) y la de `_lab/`. Eso es exactamente lo que `REESTRUCTURA.md` dice que no se quiere: *"ni trabajando dos versiones"* y *"una verdad, un sitio"*.

**Cómo llegó ahí** (`docs/orden/2026-09-30-reconstruccion-lab.md`): el 28-sep otra sesión vació y recargó Estadística y Storytelling con su propio contenido. El 30-sep, con OK de Raúl (*"lo que hicimos aquí es lo bueno, cárgalo"*), se restauró el del kit.

---

# 3 · ¿Qué ruta tiene mejor estructura? Excel, y se mide

| | Excel | SQL | Estadística | Storytelling |
|---|---|---|---|---|
| `concepto` (lo que se enseña antes del reto) | **500 / 500** | 0 | 0 | 0 |
| `tema` | **500 / 500** | 0 | 0 | 0 |
| `titulo_corto` | **500 / 500** | 39 | 0 | 0 |
| Planetas con nombre propio | Sí | Solo el 0 | No | No |
| Pista genérica ("Revisa el contexto con calma.") | 0 | 0 | 119 (34 %) | 74 (36 %) |
| `cloze` con mensajes de error | 100 % | 100 % | **0 de 9** | **0 de 9** |
| El slug dice | planeta | planeta | planeta **y lección** | planeta **y lección** |
| Excel de origen junto al JSON (`_lab/<ruta>/<módulo>/_fuente/`) | Sí, 11 de 11 módulos | Sí, 11 de 11 | Sí, 11 de 11 | Sí, 9 de 9 |
| ¿Lo publicado sale de ese JSON? | **En parte** (319 de 500) | **En parte** (263 de 481) | **No** (0 de 347) | **No** (0 de 205) |

**Tu intuición era correcta, con un matiz.** Las cuatro rutas tienen en el repo la misma estructura de carpetas (módulo, JSON por mecánica y Excel de origen). Lo que distingue a Excel es que **lo publicado sale de ahí** y que sus ejercicios llevan concepto, tema y título corto. En Estadística y Storytelling lo publicado salió por otro camino (el kit) y quedó sin esos campos.

**Lo que Estadística y Storytelling sí tienen mejor:** el slug dice planeta y lección (el 100 % coincide con la estructura real), y su orden es verificable.

---

# 4 · Mecánicas: plan contra base (Storytelling)

El Excel de temario v14 planea 234 ejercicios para Storytelling. Su propia **regla de calidad nº 6** dice: *"Una mecánica no se degrada a otra más fácil de construir. Si el componente no existe, el ejercicio queda PENDIENTE; no se sustituye en silencio."*

| Código | Mecánica del plan | `interaccion` | Plan | Base hoy |
|---|---|---|---|---|
| M17 | Manipular la gráfica | `taller` | **20** | **0** |
| M24 | Antes / después | `antesdespues` | **10** | **0** |
| M13 | Encuesta de predicción | `encuesta` | **10** | **0** |
| M10 | Pintar regiones | `pintar` | **8** | **0** |
| M09 | Arrastrar marcador | (no existe) | 7 | 0 |
| M00-A, M28, M14 | Animada, ramificar, diagrama | — | 6 | 1 |
| M01 | Opción múltiple (juicio) | `opcion` | 41 | **63** |
| M23 | Miniaturas | `miniaturas` | 11 | **20** |
| M02 | Tap sobre el dato | `clic-dato` | 28 | 17 |
| M00, M12, M06, M07, M08, M25… | Resto (explicación, conmutador, cajas, orden, cloze, parejas…) | — | 93 | 104 |
| | **Total** | | **234** | **205** |

**En una frase:** el plan pide **55 ejercicios** de transformar, apostar, pintar y arrastrar (M17, M24, M13, M10, M09) y la base tiene **cero** de ellos. En su lugar hay 22 `opcion` y 9 `miniaturas` de más.

**Módulo 1, ejercicio por ejercicio:** el plan tiene 22 y la base 22, pero no son los mismos. Falta `M17` "toca cualquier cosa que te estorbe", y el plan pedía **un** cloze "Mi audiencia es ▢ y quiero que ▢" que en la base se partió en dos (`03a` y `03b`, el de tu captura).

**Un matiz importante:** `taller` y `antesdespues` **sí existen en el código** (`RelTaller`, 31 mecánicas documentadas en `GUIA-MECANICAS.md`). No es que la mecánica no exista: es que el contenido publicado no la usa. `_lab/storytelling` sí la usa (4 `taller`, 3 `antesdespues`, 16 `revisar`, 7 `ramificar`).

---

# 5 · Dónde vive el contrato (y dónde encaja el mío)

El repo ya tiene **una guía única**, generada por `python _contrato.py` y no editada a mano (`_diseno/GUIA-MECANICAS.md`, 31 mecánicas, con secciones de hoja, gráfica y sus cinco reglas). Además: `docs/CONTRATO-MECANICAS-MOVIL.md` (el string de respuesta de cada mecánica), `docs/contrato-datos.md` (funciones y vistas), y el paquete `docs/para_diseno/`.

Mi `contrato-visuales.md` (v0.3) **no debe mantenerse como un documento aparte**: sería una segunda fuente de verdad. Propongo repartir lo que aporta:

| De mi contrato | Dónde debería vivir |
|---|---|
| Familias visuales V1–V14, estados, catálogos cerrados | `_diseno/PIEZAS.md` y `docs/para_diseno/` |
| Reglas de contenido R1–R8 | Hoja "Reglas de calidad" del Excel (ya tiene 15; R2 se parece a las reglas 8 y 10, R3 a la 5) y chequeos en `_verificar_json.py` |
| Modo de respuesta (botón o tocar) | `ANEXO_MECANICAS.md` §5 (ya trata el botón deshabilitado) |
| Hallazgos de datos (§6) | Un informe de QA, no un contrato |
| Esquema por mecánica en una tabla | **`lab_mecanicas_esquema`**, hoy vacía |

**Diferencia de capa a tener presente:** la guía documenta el JSON de **autoría** (`eje_min`, `pie_inicial`); la base guarda el `dataset` **compilado** (`ejeMin`, `pieTrasGesto`). Mi contrato documentó el segundo. Los dos son válidos, pero hay que decir en cada documento de cuál habla.

---

# 6 · Hallazgos consolidados

| # | Hallazgo | Estado |
|---|---|---|
| 1 | **Causa raíz del texto empaquetado:** `convertir_storytelling.py` lee el clic-dato separando por comas (`linea.split(',')`, línea 366), y por eso una etiqueta con coma se parte (confirmado). Los empaquetados de `emparejar` y de las líneas de `explicacion` usan `\|` y `:` y apuntan al mismo tipo de parseo, pero **no leí esa parte del conversor** ⚠. En Estadística aparece el mismo patrón y no leí su conversor | Corregí 21 ejercicios **en la base**. **El kit no cambió**: una recarga desde él los revertiría |
| 2 | El orden en pantalla agrupa por tipo de mecánica en 34 de 36 lecciones de Storytelling | Sin decidir si es intencional |
| 3 | `explicacion`: 3 tarjetas con `lineas` empaquetadas (`ST-M1L2-01`, `ST-M1L3-01`, `ST-M3L2-01`) | Sin corregir |
| 4 | Pista genérica en 74 de 205 (Storytelling). En 33 ejercicios que sí se corrigen (`ordenar`, `clasificar`, `emparejar`) no ayuda | Sin corregir |
| 5 | `titulo_corto` vacío en Storytelling y Estadística; 11 títulos son el enunciado cortado | Sin corregir |
| 6 | `cloze` sin diagnósticos en Storytelling y Estadística (18) | Sin corregir |
| 7 | Barrido de QA del 12-oct: 196 con `BASE_DICE_INCORRECTO`. El del 13-oct da 998 de 1,033 buenos | ⚠ Probablemente corregido; volver a correr tras mis cambios |
| 8 | `lab_mecanicas_esquema` vacía; `lab_soluciones_bak_437` y `_437b` en el esquema público sin RLS | Sin tocar (hoy ningún rol público puede leerlas) |
| 9 | La regla 6 del Excel (no degradar mecánicas) no se cumple en Storytelling: 55 ejercicios planeados faltan | Ver §4 |

---

# 7 · Lo que cambié en la base, con transparencia

21 ejercicios (respaldo en el esquema privado `respaldo`, con instrucciones para revertir en `contrato-visuales.md` §6.1): 10 `emparejar` desempaquetados, 11 de gráfica con valores o etiquetas reparados.

**Dos reglas de tu `CLAUDE.md` que debo reconocer:**
- *"No se toca la base sin que Raúl lo confirme"*: lo hice a tu petición explícita en esta conversación.
- *"Preguntar antes de inventar"*: en 5 ejercicios puse **contenido inventado por mí** (distractores y mensajes en `ST-M6L1-02`, `ST-M6L1-03`, `ES-M9L1-04`; el valor 60 en `ST-M4L1-04`; los meses en `ES-M10L4-02`; el intercambio en `ST-M2L3-03`). Tú me pediste decidir, pero conviene que los revises, y puedo revertir cualquiera.
- **Riesgo de conflicto con otra sesión:** como no cambié el kit, otra sesión que recargue Storytelling o Estadística pisaría estas correcciones.

---

# 8 · Propuesta de retrabajo, en orden

| Fase | Qué | Por qué en este orden |
|---|---|---|
| **0 · Decidir** | Qué versión de Storytelling manda: la publicada (kit) o la de `_lab/` | Sin esto, cualquier corrección se hace sobre una versión que quizá se descarte |
| **1 · Una sola fuente** | Llevar Storytelling y Estadística a la cadena de Excel: JSON en `_lab/`, `_fuente/*.xlsx` al lado, validador. Corregir o retirar el parseo por comas del conversor | Es lo que hace a Excel mejor estructurado |
| **2 · Campos comunes** | En toda ruta: objetivo por lección, `concepto`, `tema`, `titulo_corto`, orden pedagógico explícito, pista real. Poblar `lab_mecanicas_esquema` | Es la estructura que ya tiene Excel |
| **3 · Piloto** | Storytelling módulo 1: comparar plan v14 (22), `_lab` (25) y base (22), decidir y aplicar | Es donde están las incoherencias de tu captura |
| **4 · Candados** | Pasar mis chequeos a `_verificar_json.py`: valores no numéricos, parejas empaquetadas, una sola opción tocable, `opcion` > 40 % de una lección | Para que no vuelva a pasar |

---

# 9 · Preguntas para Raúl (no las decido yo)

1. **¿Qué versión de Storytelling es la buena hoy?** La del kit (en la base, 205) o la de `_lab/storytelling` (197, con `taller`, `antesdespues`, `ramificar` y `revisar`). Y lo mismo para Estadística.
2. **¿El orden por tipo de mecánica dentro de una lección es intencional?**
3. **¿Mis 5 contenidos inventados se quedan, se ajustan o se revierten?**
4. **¿Dejo de mantener `contrato-visuales.md` y reparto su contenido según §5?**
5. **¿Se arregla también el kit y el conversor** (para que mis 21 correcciones sobrevivan a una recarga), o se descarta el kit?

## Decisión de Raúl, 14/10/2026 · una sola versión por ejercicio

- **Un ejercicio, una versión.** Nada de variantes móviles (`variante_de` / `solo_movil`): duplican contenido y el «Siguiente» de la web llegaba a la variante, que la web no pinta. La única que existía (`st01-taller-02-movil`) se borró, con respaldo en `respaldo.lab_variante_st01_20261014`.
- **Dedo o mouse lo resuelve la mecánica**, en su componente, no el contenido.
- **`taller` y `antesdespues`** (hoy `movil = false` en `lab_mecanicas`) se harán funcionar en la app de iOS. Cuando estén listas, en el mismo cambio: `movil = true` en `lab_mecanicas` y su entrada en `docs/CONTRATO-MECANICAS-MOVIL.md`. No se marcan antes.
- **`excluye_movil`** solo como último recurso, para un ejercicio concreto.
- Pendiente para el sitio: el «Siguiente» de la web debería saltarse cualquier ejercicio `solo_movil`.

## Respaldos en la base · decisión de Raúl, 14/10/2026

- **Uno por módulo.** Antes de recargar un módulo: `respaldo.<tabla>_<ruta><modulo>_<aaaammdd>`, por ejemplo `lab_ejercicios_m2_20261014`.
- **Cada respaldo lleva su nota** (`comment on table`): qué guarda y cuándo se borra.
- **Se borra cuando Raúl valida el módulo en el sitio.** No se acumulan.
- Para ver lo que hay y por qué: `select c.relname, obj_description(c.oid) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'respaldo' and c.relkind = 'r';`
- Las `_bak_437` a `_bak_444` son de otras sesiones y no llevan nota. No se tocan sin preguntar.
