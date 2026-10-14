# Auditoría de cortes y solapes en móvil · 390 px

Medida el 14/10/2026 sobre **947 ejercicios de 30 mecánicas** (todo `_lab/`), cada uno en dos estados: inicial y con la respuesta correcta colocada. **198 tienen algún fallo real** (21 %).

## Resumen por mecánica

| mecánica | con fallo | de | texto cortado | sale de pantalla | textos que se pisan | autorrecorte (sin verificar) |
|---|---|---|---|---|---|---|
| clasificar | 105 | 110 | 105 | 104 | 94 | 0 |
| cloze | 54 | 80 | 15 | 11 | 27 | 45 |
| armagrafica | 11 | 12 | 3 | 3 | 11 | 11 |
| detective | 8 | 39 | 0 | 0 | 8 | 0 |
| clic-dato | 7 | 46 | 7 | 7 | 0 | 0 |
| encuesta | 3 | 14 | 3 | 3 | 0 | 0 |
| conmutador | 3 | 21 | 0 | 0 | 3 | 0 |
| dinamica | 2 | 6 | 2 | 2 | 0 | 0 |
| conexiones | 2 | 4 | 0 | 0 | 2 | 0 |
| estimar | 1 | 60 | 0 | 0 | 1 | 0 |
| antesdespues | 1 | 5 | 0 | 0 | 1 | 0 |
| taller | 1 | 5 | 1 | 1 | 0 | 0 |

Sin fallos detectados: opcion, explicacion, miniaturas, magnitud, emparejar, clic-celda, clic-celdas, filtros, pintar, arrastre, balance, y el resto de mecánicas no listadas.

## Causas (confirmadas viendo la pantalla)

1. **`clasificar`: las piezas colocadas en una caja salen en una línea y se cortan** («Son 4 directores, si…»). Afecta a 105 de 110 ejercicios, o sea casi todos. Es el fallo de la captura de Raúl. Debe partirse en varias líneas.
2. **`cloze`: el hueco de la fórmula pinta la CLAVE de la pieza, no su texto.** `mecanicas.tsx`, hueco: `{val || (h?.et ?? '...')}` con `val = puesto[h.v]` = `z.v`. La paleta sí pinta `z.et`. Debe buscar `h.piezas.find(z => z.v === val)?.et`. En SQL/Excel se nota poco porque la clave y el texto coinciden.
3. **Hojas (`XaHoja`): las filas tienen altura fija y el texto de celda que se parte en 2 o más líneas se pisa con la fila siguiente y se corta abajo.** Visto en `detective` (`es09-detective-01`) y en el `cloze` de Raúl (`st01-cloze-01`).
4. **`clic-dato`: las etiquetas del eje X se montan** («ClienteCliente 1») y la última se corta por la derecha; con 12 barras no caben a 390 px.
5. **`opcion`: el panel de feedback tapa las opciones** (captura de Raúl). Esto no lo detectó la medición automática, porque depende del scroll del contenedor `u-aula-zona`.

## Sin verificar a ojo (no dar por confirmado)

- `armagrafica` (11 de 12): el detector marca solape título/ejes; en `xl08-armagrafica-01` con «Pastel» elegido el gráfico sale vacío (solo ejes). Puede ser un fallo real del dibujo del pastel.
- `cloze`, autorrecorte (45): el texto del hueco vacío queda recortado dentro del botón `xa-flt-hueco`. Puede ser por diseño (hueco que se ve vacío); confirmar.
- `encuesta`, `dinamica`, `conexiones`, `conmutador`, `estimar`, `antesdespues`, `taller`: pocos casos cada una; confirmar uno por mecánica.

## Límites de esta medición

- Una copia del sitio pintando `MECANICAS[...]` dentro del contenedor `.xa.u-aula.u-aula-web`, en Chromium a 390 px. Reproduce las capturas de Raúl (`clasificar` y `cloze`), pero **no es el aula completa**: sin cabecera real, pie ni panel de veredicto.
- Solo 390 px. Falta 360 y 414, y modo horizontal.
- Los recortes verticales dentro de `u-aula-zona` se descartaron (esa zona hace scroll); eso es lo que tapa el panel de feedback y hay que revisarlo aparte.
- Los datos salen de los JSON de `_lab/` traducidos con `_cargar_alpha.py`, no de la base.

## Ejercicios con fallo, por mecánica

**clasificar** (105): es01-clasificar-01, es01-clasificar-02, es04-clasificar-02, es04-clasificar-03, es05-clasificar-01, es06-clasificar-01, es06-clasificar-02, es07-clasificar-01, es08-clasificar-01, es08-clasificar-02, es08-clasificar-03, es10-clasificar-01, sq00-clasificar-01, sq00-clasificar-02, sq00-clasificar-03, sq00-clasificar-04, sq00-clasificar-05, sq02-clasificar-01, sq02-clasificar-02, sq02-clasificar-03, sq04-clasificar-01, sq04-clasificar-02, sq05-clasificar-01, sq05-clasificar-02, sq06-clasificar-01, sq07-clasificar-01, sq07-clasificar-02, sq08-clasificar-01, sq09-clasificar-01, sq09-clasificar-02, sq09-clasificar-03, sq10-clasificar-01, sq10-clasificar-02, sq10-clasificar-03, sq10-clasificar-04, sq10-clasificar-05, st01-clasificar-01, st01-clasificar-02, st01-clasificar-03, st01-clasificar-04, st01-taller-02-movil, st02-clasificar-01, st02-clasificar-02, st03-clasificar-01, st03-clasificar-02, st03-clasificar-03, st03-clasificar-04, st03-clasificar-05, st03-clasificar-06, st03-clasificar-07, st03-clasificar-08, st04-clasificar-01, st04-clasificar-02, st04-clasificar-03, st04-clasificar-04, st04-clasificar-05, st04-clasificar-06, st04-clasificar-07, st04-clasificar-08, st05-clasificar-01, st05-clasificar-02, st05-clasificar-03, st05-clasificar-04, st05-clasificar-05, st05-clasificar-06, st06-clasificar-01, st06-clasificar-02, st06-clasificar-03, st06-clasificar-04, st07-clasificar-01, st07-clasificar-02, st07-clasificar-03, st07-clasificar-04, st07-clasificar-05, st08-clasificar-01, st08-clasificar-02, st08-clasificar-03, st08-clasificar-04, st08-clasificar-05, st08-clasificar-06, st08-clasificar-07, st09-clasificar-01, st09-clasificar-02, xl00-clasificar-02, xl00-clasificar-03, xl00-clasificar-04, xl00-clasificar-05, xl01-clasificar-02, xl01-clasificar-03, xl01-clasificar-04, xl01-clasificar-05, xl01-clasificar-06, xl01-clasificar-07, xl01-clasificar-08, xl01-clasificar-09, xl01-clasificar-10, xl02-clasificar-01, xl02-clasificar-02, xl02-clasificar-03, xl04-clasificar-01, xl04-clasificar-02, xl04-clasificar-03, xl06-clasificar-01, xl06-clasificar-02, xl06-clasificar-03

**cloze** (54): sq02-cloze-02, sq02-cloze-03, sq03-cloze-05, sq04-cloze-03, sq05-cloze-02, sq06-cloze-03, sq07-cloze-01, sq07-cloze-02, sq07-cloze-03, sq07-cloze-04, sq07-cloze-05, sq08-cloze-01, sq09-cloze-01, sq09-cloze-02, sq09-cloze-03, sq09-cloze-04, sq09-cloze-05, sq09-cloze-06, sq09-cloze-07, sq10-cloze-01, sq10-cloze-03, st01-cloze-01, st01-cloze-02, xl00-cloze-02, xl00-cloze-03, xl00-cloze-04, xl03-cloze-01, xl03-cloze-02, xl03-cloze-03, xl03-cloze-04, xl03-cloze-05, xl03-cloze-06, xl04-cloze-01, xl04-cloze-02, xl04-cloze-03, xl04-cloze-04, xl05-cloze-01, xl05-cloze-02, xl05-cloze-03, xl05-cloze-04, xl05-cloze-05, xl05-cloze-06, xl05-cloze-07, xl05-cloze-08, xl05-cloze-09, xl05-cloze-11, xl05-cloze-12, xl06-cloze-01, xl06-cloze-02, xl06-cloze-03, xl06-cloze-04, xl09-cloze-01, xl09-cloze-03, xl09-cloze-04

**armagrafica** (11): st02-armagrafica-01, st02-armagrafica-02, xl08-armagrafica-01, xl08-armagrafica-02, xl08-armagrafica-03, xl08-armagrafica-04, xl08-armagrafica-05, xl08-armagrafica-06, xl08-armagrafica-07, xl08-armagrafica-08, xl08-armagrafica-09

**detective** (8): es08-detective-01, es09-detective-01, es11-detective-01, es11-detective-02, sq03-detective-01, sq03-detective-02, sq08-detective-01, sq10-detective-03

**clic-dato** (7): es01-clic-dato-01, es01-clic-dato-02, es01-clic-dato-03, es06-clic-dato-01, es07-clic-dato-02, es08-clic-dato-01, es11-clic-dato-01

**encuesta** (3): es07-encuesta-01, es09-encuesta-01, es10-encuesta-01

**conmutador** (3): es09-conmutador-01, st05-conmutador-02, xl01-conmutador-05

**dinamica** (2): xl07-dinamica-04, xl07-dinamica-05

**conexiones** (2): st03-conexiones-01, st04-conexiones-01

**estimar** (1): es06-estimar-05

**antesdespues** (1): alpha-antesdespues

**taller** (1): st01-taller-02
