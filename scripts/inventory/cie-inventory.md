# CIE-11 MMS: inventario de clasificación

Este paso es de inventario, no de redacción clínica ni de correspondencia DSM/CIE.

## Fuente verificada

- Navegador oficial: https://icd.who.int/browse/2024-01/mms/es
- Enlace «Información → Archivo de hoja de cálculo»: https://icdcdn.who.int/static/releasefiles/2024-01/SimpleTabulation-ICD-11-MMS-es.zip
- Descarga comprobada: 28 de octubre de 2026.
- SHA-256 de la copia verificada: `ffbd78890e599c40f953bf49e0ae3ec942204a84ee0c2bc5be4069365d3eed8d`.
- El ZIP oficial contiene TXT, XLSX y readme. La cabecera TXT indica `Version:2024 Jan 21 - 22:30 UTC`.
- El TXT completo tiene 36.044 filas. La preparación selecciona todos los registros de los capítulos 06, 07 y 17.

## Alcance y cifras

| Capítulo | Ámbito en Psicoteca | Capítulos/bloques | Categorías codificadas | De ellas, residuales | Categorías hoja |
| --- | --- | ---: | ---: | ---: | ---: |
| 06 | Núcleo: trastornos mentales, del comportamiento y del neurodesarrollo | 1 + 25 | 858 | 200 | 720 |
| 07 | Relacionado: sueño y vigilia | 1 + 6 | 79 | 21 | 73 |
| 17 | Relacionado: condiciones de salud sexual | 1 + 3 | 68 | 21 | 57 |
| Total | Tres capítulos seleccionados | 3 + 34 | 1.005 | 242 | 850 |

Total de registros seleccionados: **1.042**. Son entradas de clasificación, no 1.042 ni 1.005 trastornos clínicos distintos. Existen categorías padre, mayor especificidad y categorías residuales. Los capítulos 07 y 17 conservan su ubicación propia y no se etiquetan automáticamente como trastornos mentales.

El alcance no incluye otros capítulos de CIE-11, toda la Fundación, ni todas las expresiones posibles por poscoordinación. No se declara cobertura clínica: todas las explicaciones siguen faltantes y toda revisión editorial sigue pendiente.

## Reproducción

Guardar el ZIP fuera del repositorio y ejecutar:

```sh
python scripts/inventory/cie-inventory.py --input /ruta/SimpleTabulation-ICD-11-MMS-es.zip --output /ruta/local/cie-2024-01.json
```

La preparación no consulta la red ni utiliza credenciales. Verifica SHA-256, cabecera de versión, campos, conteos, códigos únicos, URI únicos y jerarquía sin padres ausentes o saltos de nivel. Obtiene la jerarquía de los prefijos de sangría del TXT oficial; solo retira esos prefijos del título mostrado. Preserva el texto español del título y el URI de linearización de cada entrada. Las categorías residuales no tienen URI de Fundación en esta exportación; sí tienen URI de linearización, que se conserva. Los URI de la hoja no incluyen la versión en la cadena; la versión se fija en el registro de fuente.

Salida: `sources`, `entries` y `summary`. Los IDs propios son estables dentro de la versión, derivados del URI oficial y la edición; nunca se calculan a partir del nombre. Los campos editoriales de Psicoteca (ámbito, revisión, estado de contenido, notas y enlace futuro a ficha) se distinguen de los datos OMS. No se crean mapeos, resúmenes diagnósticos ni fichas publicadas.

## Condiciones verificadas de reutilización

Documento oficial consultado: https://icd.who.int/en/docs/icd11-license.pdf . La licencia de la clasificación es CC BY-ND 3.0 IGO. Las secciones 1.2.2 y 1.2.3 aclaran condiciones de integración en software: conservar atribución y los códigos, títulos y URI. La sección 1.2.5 permite campos adicionales identificados como ajenos a la OMS. La sección 1.2.4 trata las correspondencias/crosswalks y traducciones como actividades sujetas a un acuerdo separado; esta preparación no hace ninguna de ellas. No se usa el logotipo ni se presenta Psicoteca como producto respaldado por la OMS.

Cita de la fuente: International Classification of Diseases, Eleventh Revision (ICD-11), World Health Organization (WHO) 2019. https://icd.who.int/browse11. Licensed under the Creative Commons Attribution-NoDerivatives 3.0 IGO licence (CC BY-ND 3.0 IGO).

Esta nota registra el contenido de las condiciones consultadas; no sustituye una decisión de publicación ni asesoría legal.
