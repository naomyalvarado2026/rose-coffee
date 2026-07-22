# Reglas y Arquitectura del Proyecto Rose Coffee (.agents/AGENTS.md)

## 1. Memoria y Conocimiento del Proyecto
- **Fuente Principal de Conocimiento**: Antes de realizar búsquedas extensas o consultas de memoria pesadas, revisa siempre el documento [`docs/PROJECT_KNOWLEDGE.md`](file:///G:/CODE/Rose%20Coffee/docs/PROJECT_KNOWLEDGE.md).
- **Consistencia Gastronómica**: Las imágenes de panes en orientación 3:4 deben servirse desde `public/fotos/panes/` y sus metadatos desde `src/data/breadsData.ts`.
- **Renders 3D del Local**: Los renders 3D de SketchUp residen en `public/fotos/local-3d/` y se presentan mediante `Store3DBentoGrid.tsx`.

## 2. Pautas de UX e Interfaz
- **Prohibido `scrollIntoView()`**: En carruseles o galerías con autoplay, nunca usar `element.scrollIntoView()`. Utilizar únicamente el scroll local aislado dentro del contenedor (`container.scrollTo(...)`) para mantener la ventana principal inmóvil.
- **Encuadre de Imágenes**: Para galerías mixtas (fotos verticales y horizontales), usar `object-contain` con fondo ambiental difuminado (`blur-2xl`) para evitar recortes accidentales de caras o personas.
- **Estética Magic UI**: Integrar `BorderBeam`, `MagicCard` y `ShimmerButton` para interacciones premium con la paleta de colores del proyecto (`#C5A059` / `#6b3a0e` / `#faf2e7`).

## 3. Comandos de Verificación y Deploy
- **Verificación de Tipos**: `npx tsc --noEmit`
- **Despliegue GitHub Pages**: `npm run deploy`
