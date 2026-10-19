# Psicoteca — MVP

Biblioteca web **gratuita**, sin registro, bases de datos ni APIs externas. Stack: Next.js App Router, TypeScript, Tailwind CSS y Lucide React.

## Requisitos
- Node.js 20.9 o superior (recomendado: Node.js 22 LTS)
- Conexión a internet **solo al instalar las dependencias** por primera vez

## Iniciar en Windows (PowerShell), macOS o Linux
1. Descomprimí `psicoteca-mvp.zip`.
2. Abrí la carpeta `psicoteca-mvp` en una terminal (o Visual Studio Code > Terminal > Nueva terminal).
3. Ejecutá:

```bash
npm install
npm run dev
```

4. Abrí **http://localhost:3000** en Chrome, Edge, Firefox o Safari.

> No se abre haciendo doble clic en `index.html`: es una app Next.js y requiere iniciar el servidor local.

## Verificar

```bash
npm run typecheck
npm run build
```

Para servir una compilación de producción: `npm run start` después de `npm run build`.

## Agregar conceptos

Editá `data/concepts.ts` y agregá un objeto dentro del arreglo `concepts` con la misma estructura de los existentes. Atributos requeridos: `slug` (único, para la URL), `title`, `category` (de `data/categories.ts`), `tags`, `synonyms`, `summary`, `essentials`, `deeper`, `references`, `related`. Los temas relacionados usan `slug` de otros conceptos existentes. Al guardar, Next.js actualiza la app en desarrollo.

Categorías: `data/categories.ts`. Los tipos para contenido están en `types/content.ts`. La búsqueda local sin acentos está en `lib/content.ts`.

## Nota editorial

Las 5 fichas son demostrativas y tienen aviso de revisión editorial. La bibliografía enlaza fuentes institucionales o identifica obras académicas. El contenido no reemplaza evaluación profesional, diagnóstico ni prescripción. No se incluyeron dosis ni instrucciones farmacológicas.

## Estado de verificación de esta entrega

El código se generó y revisó estructuralmente. El entorno de generación no tuvo acceso a `registry.npmjs.org`, por lo que **no fue posible instalar dependencias ni ejecutar `next build` / `tsc` aquí**. Ejecutá `npm install`, `npm run typecheck` y `npm run build` en tu máquina para completar esa validación.
