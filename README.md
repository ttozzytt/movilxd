# Oscar Calle · Mi espacio (PWA)

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub. Por ejemplo: `oscar-mi-espacio`.
2. Deja el repositorio como **Public**.
3. En el repositorio, pulsa **Add file → Upload files**.
4. Sube el CONTENIDO de esta carpeta: `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js`, `.nojekyll` y las carpetas `icons` y `vendor`.
5. Pulsa **Commit changes**.
6. Abre **Settings → Pages**.
7. En **Build and deployment**, selecciona **Deploy from a branch**.
8. En **Branch**, elige `main` y carpeta `/ (root)`, y pulsa **Save**.
9. Espera a que GitHub Pages publique y abre el enlace que aparece en esa misma pantalla. Normalmente tendrá la forma `https://TU-USUARIO.github.io/oscar-mi-espacio/`.

## Archivos

- `index.html`: pantallas de la aplicación.
- `styles.css`: diseño adaptable.
- `app.js`: navegación, filtros, búsquedas y validaciones.
- `manifest.webmanifest`: configuración de instalación PWA.
- `sw.js`: caché offline para la primera visita y siguientes cargas.
- `icons/`: iconos de instalación.
- `vendor/`: jQuery local.

## Importante

Sube los archivos y carpetas que están DENTRO de este paquete, no el archivo ZIP. No cambies los nombres ni la estructura. El formulario valida los campos en el navegador; no envía datos a un servidor.
