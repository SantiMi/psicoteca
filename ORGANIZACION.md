# Organización por fuentes y piloto de ansiedad

Esta rama agrega Clasificaciones como quinta categoría y las rutas /clasificaciones, /clasificaciones/[source] y /familias/ansiedad. Los índices se basan en los PDF aportados; CIE-11 muestra una selección de secciones de su guía de mayo de 2024. No incorpora el texto completo de las obras ni códigos o equivalencias automáticas.

El catálogo usa trastorno-de-panico como ID canónico; /ficha/panico redirige a ese ID. Los IDs existentes de los otros temas no cambian. En el modo local se mantienen las demostraciones educativas existentes; las nuevas escrituras de Firestore son privadas y no alimentan el sitio mientras FIREBASE_CONTENT_ENABLED=false.

## Preparación administrativa

`npm run prepare:anxiety` genera tmp/anxiety-import.json con 13 documentos. Es una preparación local; no autentica ni escribe en Firebase:

- Dos registros de fuentes.
- Una familia editorial.
- Dos ubicaciones en las fuentes; no son códigos diagnósticos.
- Cuatro resúmenes catalog y cuatro cuerpos concepts.

Todos incluyen visibility=draft, reviewStatus=pending y el lote anxiety-organization-2026-10-23-v1. El contenido educativo deriva de los archivos previos del repositorio; las síntesis DSM y CIE-11 y su comparación siguen pendientes. La guía de referencia CIE-11 no se utiliza como sustituto de una fuente clínica completa.

El 23/10/2026 los 13 documentos se crearon en psicoteca-9f417/(default) mediante el MCP oficial. Se comprobaron las reglas deny-all y la ausencia de destinos antes de crear. Cada escritura llevó currentDocument.exists=false y cada documento se leyó después para comparar todos sus campos. No se modificaron documentos existentes, reglas ni variables de Vercel. Las creaciones fueron secuenciales, no una transacción de lote.

## Validación

- `npm test`: integridad de fuentes, destinos y fichas canónicas.
- `npm run typecheck` y `npm run build`.
- Recorrido del navegador: biblioteca → fuente → familia → ficha, con verificación adicional del filtro Clasificaciones y del enlace antiguo de pánico.

El contenido diagnóstico por sistema requiere revisión antes de completarse. Esta rama no habilita FIREBASE_CONTENT_ENABLED ni publica los borradores.
