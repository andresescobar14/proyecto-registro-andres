# Nexo · Registro de estudiantes

Demo frontend por pasos con diseño responsive, navegación con teclado, errores por campo, validación de edad exacta y seguridad de contraseña. No crea cuentas ni almacena o envía datos. No necesita CDN ni dependencias de ejecución.

## Desarrollo

Se usa exclusivamente pnpm. Requiere Node.js 22 o posterior.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm test
```

Abre http://localhost:3103/. Se puede publicar directamente como sitio estático en GitHub Pages o Vercel. El servidor incluido es solo para desarrollo. Los archivos practica.html y practica2.html se conservan como ejercicios originales.

## Organización

- index.html: estructura semántica y campos.
- styles.css: estilos locales, capas y adaptación mobile-first.
- js/validation.js: reglas puras de validación y cálculo de edad.
- js/app.js: navegación, accesibilidad y estados de la interfaz.
- tests/validation.test.js: casos de cumpleaños, fechas inválidas y contraseñas.
