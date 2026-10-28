# Psicoteca

Biblioteca educativa de consulta rápida sobre salud mental. Next.js App Router, TypeScript y Tailwind.

## Inicio local

Con Node.js 20.9 o superior:

```sh
npm ci
npm run dev
```

Abrir http://localhost:3000. Para la copia de producción local: `npm run build` y `npm run start`.

## Consulta

La portada presenta un buscador, sin catálogo desplegado. Reconoce nombres y preguntas acotadas sobre los temas disponibles, por ejemplo «qué es el TAG», «medicación para TAG», «efectos adversos de sertralina» o «diferencias entre pánico y ansiedad generalizada». Las consultas amplias ofrecen temas para elegir. Las consultas sin cobertura lo indican.

`data/search-intent.ts` resuelve la intención sobre el catálogo conocido. `app/api/lookup/route.ts` devuelve respuestas breves, opciones o comparaciones; no utiliza un modelo generativo ni infiere diagnósticos de síntomas. Cada explicación permite abrir la ficha y consultar las fuentes. Las fichas muestran lo esencial y reservan la profundización y bibliografía a apartados desplegables.

La síntesis clínica disponible cubre pánico, ansiedad generalizada, ansiedad social, fobia específica y depresión; el comparador farmacológico incluye sertralina, escitalopram, fluoxetina y paroxetina. Existe contenido introductorio adicional en `data/catalog.ts`. La biblioteca es piloto: no es un buscador de todo el DSM/CIE ni extrae automáticamente contenido nuevo de los PDF.

## Datos y publicación

Por defecto se utiliza el catálogo local de revisión. Con `FIREBASE_CONTENT_ENABLED=true`, la lectura de Firestore exige `visibility == published`. Las síntesis clínicas locales no se añaden a los documentos publicados. La importación y los índices de fuentes se definen en los scripts de preparación y los módulos de `data/`; las credenciales se configuran fuera del repositorio. No versionar archivos `.env` ni cuentas de servicio.

El contenido requiere revisión especializada. Es educativo, sin dosis ni indicaciones personales de tratamiento. Las fichas enlazan NIMH, OMS, NICE y MedlinePlus según corresponda.

## Verificación

```sh
npm test
npm run typecheck
npm run build
```

Las pruebas cubren integridad de fuentes y relaciones, selección de comparaciones y resolución de las consultas principales. La comprobación visual debe incluir portada vacía, respuesta breve, consulta ambigua, ausencia de cobertura, diferencial y navegación a fuentes y medicamentos.
