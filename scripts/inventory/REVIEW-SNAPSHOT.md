# Primera extracción: 28 de octubre de 2026

Historia comprobada: fuentes locales/oficiales → extracción de clasificación → validación → inventario combinado → vista local y CSV de revisión.

## Resultado mecánico

| Fuente | Alcance | Entradas | Estado de extracción |
| --- | --- | ---: | --- |
| DSM-5-TR, ejemplar español aportado | Clasificación inicial, PDF 28–70, 43 páginas; 22 encabezados de capítulo | 1.179 filas candidatas | Parcial y pendiente de conciliación |
| CIE-11 MMS 2024-01, español | Capítulo 06; capítulos 07 y 17 como áreas relacionadas | 1.042 entradas | Completa únicamente en este alcance |
| Total combinado | Dos fuentes; ninguna equivalencia inferida | 2.221 entradas | Sin cobertura clínica declarada |

CIE contiene 37 capítulos/bloques y 1.005 categorías codificadas; incluye 242 residuales y 850 categorías hoja. La exportación completa consultada tenía 36.044 filas. Se verificaron el hash, versión, conteos, IDs, códigos, URI y jerarquía. No se inventariaron otros capítulos, toda la Fundación ni expresiones de poscoordinación.

DSM conserva 139 códigos dudosos o dependientes de especificación como `rawCode` con `code=null`, y una continuación larga descartada queda registrada: 140 observaciones para conciliar. Además hay 71 filas cuyo tipo requiere clasificación editorial. Estas cifras se superponen con otros estados y no deben sumarse como si fueran diagnósticos distintos. Todos los nombres y jerarquías requieren comprobación; tampoco se extrajeron la sección III ni todos los especificadores incluidos en instrucciones.

Las correcciones de transcripción de F41.0 y F40.00 se cotejaron con la imagen de la página PDF 34 y quedaron registradas con SHA, página, valor anterior y nuevo. No representan validación clínica. La página de destino del cuerpo se conserva por separado de la página romana del índice.

## Estado editorial

Todas las nuevas entradas tienen `reviewStatus=pending`, `contentStatus=missing` y `topicId=null`. Las cinco síntesis clínicas previas siguen siendo contenido independiente; este corte todavía no las enlaza al inventario ni genera nuevas explicaciones diagnósticas o farmacológicas. No se escribió Firestore ni se modificaron reglas, variables de Vercel o el catálogo público.

Los datos, las imágenes, los PDF, el ZIP y el OCR permanecen locales y fuera de Git. El código, el método y los controles sí forman parte del borrador del proyecto. El inventario se reconstruye con los comandos de este directorio.

## Comprobación

- Dos inventarios de origen y combinado aceptados por el validador; DSM produce la advertencia esperada de extracción parcial.
- 18 pruebas aprobadas: 9 existentes, 7 del esquema/cobertura y 2 de ensamblado/procedencia/CSV.
- TypeScript y compilación de producción correctos.
- `/cobertura` con revisión deshabilitada: HTTP 404, sin exponer registros.
- Revisión habilitada solo en el servidor local: HTTP 200; títulos, cifras y estados presentes; sin OCR crudo ni rutas absolutas del PDF en la respuesta.
- `/api/lookup?q=tag`: HTTP 200 con una explicación del catálogo previo.
- Navegador: código 6B00 resuelve la categoría CIE; filtro DSM y búsqueda sin acento `panico` muestran trastorno y especificador con sus páginas. Sin errores de consola.

La siguiente etapa es conciliar las observaciones DSM y completar una familia con fichas originales revisadas. Cargar entradas de clasificación no sustituye ese trabajo.
