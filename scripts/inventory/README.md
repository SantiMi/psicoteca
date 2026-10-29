# Inventario local de Psicoteca

La primera etapa reúne entradas de clasificación y localizadores, no redacta ni publica fichas clínicas. El buscador principal conserva la experiencia simple existente. No hay conexión a Firebase en estos comandos.

## Fuentes y alcance

- **DSM-5-TR, ejemplar español aportado:** clasificación inicial de las páginas PDF 28–70 (xxvii–lxix impresas). Se extraen imágenes del PDF y se ejecuta OCR local de Windows. El resultado es un inventario de filas candidatas, todavía parcial y pendiente de conciliación visual; no es un conteo de trastornos distintos. Los códigos del ejemplar son CIE-10-MC. Se distinguen la página del índice y la página de destino del cuerpo. La sección III, las afecciones en estudio y los índices finales no están inventariados en este corte.
- **CIE-11 MMS 2024-01, español:** todas las filas de los capítulos 06, 07 y 17 de la exportación oficial. El capítulo 06 tiene ámbito `core`; sueño y salud sexual, `related`. La integridad de esta extracción está comprobada dentro de ese alcance. No es toda CIE-11, toda su Fundación ni todas las expresiones de poscoordinación. Las categorías codificadas incluyen padres, variantes y residuales; no equivalen a diagnósticos clínicos distintos.
- **Guía de referencia CIE-11 aportada:** sirve para interpretar organización y convenciones; no se usa como si contuviera todas las descripciones diagnósticas.
- **CDDR 2024:** fuente clínica complementaria localizada en https://www.who.int/publications/i/item/9789240077263 . Su contenido no se ha incorporado todavía a estas filas de clasificación.

## Archivos y estados

Los PDF, imágenes, OCR, ZIP oficial y datos generados permanecen fuera de Git. El código, los métodos y los controles se versionan. Separa siempre:

1. `extractionStatus`: estado de la extracción dentro del alcance declarado de la fuente.
2. `reviewStatus`: comprobación editorial de cada entrada; no significa validación clínica de una ficha.
3. `contentStatus`: falta de ficha, borrador, contenido revisado o publicado.

Una extracción completa no establece cobertura clínica ni autoriza publicación. Las nuevas entradas se generan `pending`/`missing`, sin una ficha asociada. No se calculan equivalencias DSM–CIE ni se reutiliza un código CIE-10-MC como CIE-11.

## Reproducir

Usar Python con `pypdf` y Pillow; el entorno de Codex ya los incluye. Para OCR se requiere Windows PowerShell clásico y el reconocedor de español de Windows. Los ejemplos usan rutas locales elegidas por quien ejecuta el proceso.

```powershell
python scripts/inventory/dsm-extract-images.py 'RUTA/DSM V-TR.pdf' 'RUTA/local/dsm-images' --start 28 --end 71
powershell.exe -NoProfile -NonInteractive -File scripts/inventory/windows-ocr.ps1 -InputDirectory 'RUTA/local/dsm-images' -OutputDirectory 'RUTA/local/dsm-ocr' -Language es-ES
python scripts/inventory/dsm-parse-ocr.py 'RUTA/local'
python scripts/inventory/cie-inventory.py --input 'RUTA/local/SimpleTabulation-ICD-11-MMS-es.zip' --output 'RUTA/local/cie-2024-01.json'
node scripts/inventory/validate-inventory.cjs 'RUTA/local/dsm-5-tr.json'
node scripts/inventory/validate-inventory.cjs 'RUTA/local/cie-2024-01.json'
node scripts/inventory/assemble-inventory.cjs 'RUTA/local/dsm-5-tr.json' 'RUTA/local/cie-2024-01.json' --output tmp/inventory/combined.json
node scripts/inventory/coverage-report.cjs tmp/inventory/combined.json
```

El directorio local del parser DSM debe contener `dsm-source.json` y la subcarpeta `dsm-ocr`. El ensamblado rechaza IDs duplicados y ejecuta el validador antes de reemplazar la salida. Conserva los registros de extracción y corrección (`runs`) y crea un CSV UTF-8 con observaciones y códigos OCR por comprobar para inspección humana. Ese CSV es una exportación editorial, no una tabla oficial de correspondencias. Las rutas absolutas de los PDF no se guardan en las entradas ni se envían al cliente.

## Vista de revisión

`/cobertura` permanece deshabilitada por defecto y no aparece en el buscador. Para la revisión en este equipo, después de compilar:

```powershell
$env:PSICOTECA_INVENTORY_REVIEW = 'true'
npm run start -- --hostname 127.0.0.1 --port 3101
```

La vista lee el archivo local ignorado `tmp/inventory/combined.json`. Sin esa variable retorna 404 antes de leer el archivo. Esta configuración está destinada al servidor local, no constituye un sistema de autenticación y no debe habilitarse en un despliegue público. No se modifican las variables de Vercel.

## Siguiente etapa editorial

1. Conciliar encabezados, filas y errores OCR del DSM contra las imágenes y registrar correcciones trazables.
2. Definir qué entradas requieren ficha propia y cuáles son variantes o especificadores que se explican dentro de otra ficha.
3. Completar primero ansiedad con explicaciones originales, localizadores y diferenciales documentados.
4. Revisar las condiciones aplicables antes de crear correspondencias entre clasificaciones o adaptar material oficial.
5. Incorporar únicamente fichas revisadas al catálogo de búsqueda y preparar su publicación por lotes separados.

La licencia y atribución de la exportación OMS se describen en `cie-inventory.md`. Ningún comando sube los PDF, escribe en Firestore ni activa el catálogo público.
