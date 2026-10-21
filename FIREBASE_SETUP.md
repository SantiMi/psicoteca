# Firebase para Psicoteca
## Estado
El código usa archivos locales por defecto. La lectura de Firestore solo se activa al configurar FIREBASE_CONTENT_ENABLED=true. No subas credenciales a GitHub.
## Configuración en Vercel (Environment Variables)
- FIREBASE_PROJECT_ID: identificador del proyecto.
- FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY: credenciales de una cuenta de servicio con los permisos mínimos; cargarlas directamente en Vercel, nunca en chat.
- FIREBASE_CONTENT_ENABLED: true, **solo después** de importar un catálogo revisado y probar la aplicación.
En entornos con Application Default Credentials se pueden omitir las dos variables de la cuenta de servicio.
## Colecciones
- catalog/{slug}: title, category, family, summary, sortKey (nombre normalizado seguido de #slug), prefixes (prefijos normalizados del nombre y sinónimos), visibility ('published' o 'draft').
- concepts/{slug}: essentials (lista de párrafos), deep, references ([{label,url}]).
- relations/{relationId}: sourceId, targetId, targetTitle, targetCategory, targetFamily, kind, description, visibility.
- sources/{sourceId}: title, edition, publisher, url, rights, reviewedAt.
## Reglas de Firestore
Toda lectura y escritura desde cliente bloqueada: las consultas se hacen por Admin SDK, desde Next.js, previa comprobación de visibility. La carga se hará desde una herramienta administrativa independiente, nunca desde el sitio público.
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
  }
}
```
Nota: las reglas de seguridad de Firestore no se aplican al Admin SDK; proteger credenciales e IAM es esencial.
## Índices
Crear índices compuestos según lo solicite Firestore: catalog(visibility, sortKey), catalog(visibility, category, sortKey), catalog(visibility, prefixes array-contains, sortKey), catalog(visibility, category, prefixes array-contains, sortKey), relations(sourceId).
## Limitaciones
La búsqueda inicial por prefijos de nombre/sinónimos no es búsqueda semántica ni texto completo. El modo local anterior admite subcadenas. Evitar mostrar totales ficticios; usar paginación de 12 resultados. Sin claves no se puede probar Firebase real.
