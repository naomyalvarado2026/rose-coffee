# Conocimiento del Proyecto: Rose Coffee

Este documento centraliza el conocimiento técnico, arquitectónico y gastronómico del proyecto **Rose Coffee** para asegurar que el desarrollo y las futuras iteraciones sean coherentes, eficientes y rápidas.

---

## 1. Módulo Gastronómico & Catálogo de Panadería 3:4

Todas las hogazas artesanales de masa madre se gestionan en [`src/data/breadsData.ts`](file:///G:/CODE/Rose%20Coffee/src/data/breadsData.ts) y sus imágenes en orientación 3:4 se sirven desde `public/fotos/panes/`:

- **Pan 01 - Hogaza Clásica de Masa Madre**: Fermentación 24h en frío, trigo orgánico de piedra & centeno 10%, hidratación 78%. Maridaje: *Espresso Zaruma Tradicional*.
- **Pan 02 - Hogaza Multigranos & Semillas**: Fermentación 28h, cubierta con sésamo, linaza y girasol, hidratación 82%. Maridaje: *Flat White Loja Bourbon*.
- **Pan 03 - Batard de Centeno & Trigo Integral**: Fermentación 30h, centeno 30%, miga densa y moscabada, hidratación 80%. Maridaje: *V60 Bourbon Honey*.
- **Pan 04 - Baguette Tradicional Salvaje**: Fermentación 20h, pre-fermento poolish, crocante extremo, hidratación 75%. Maridaje: *Latte Helado Rose Special*.
- **Pan 05 - Pan de Campo Cacao & Espresso**: Fermentación 24h, edición firma infusionada con espresso Zaruma y cacao amargo 70%. Maridaje: *Cold Brew Nitro*.
- **Pan 06 - Brioche de Masa Madre con Mantequilla**: Fermentación 18h, enriquecido con mantequilla manabita y yemas campesinas. Maridaje: *Cappuccino Canela & Vainilla*.
- **Pan 07 - Hogaza de Aceitunas & Romero**: Fermentación 24h, aceitunas kalamata y romero fresco, hidratación 80%. Maridaje: *Espresso Doble Especial*.
- **Pan 08 - Hogaza Corona de Espelta & Miel**: Fermentación 26h, harina ancestral de espelta 50% y miel pura. Maridaje: *Americano Zaruma V60*.

---

## 2. Módulo Arquitectónico 3D del Local (SketchUp)

Renders 3D conceptuales ubicados en `public/fotos/local-3d/` y presentados mediante [`Store3DBentoGrid.tsx`](file:///G:/CODE/Rose%20Coffee/src/components/public/Store3DBentoGrid.tsx):

- **Render 1 (`photo_2026-07-22_00-34-14.jpg`)**: *Barra Principal & Área de Baristas* (Zona de Extracción y Vitrina).
- **Render 2 (`photo_2026-07-22_00-34-10.jpg`)**: *Salón Principal & Co-Working* (Ambiente Interior y Confort).
- **Render 3 (`photo_2026-07-22_00-34-16.jpg`)**: *Taller Abierto de Masa Madre* (Área de Panadería Transparente).
- **Render 4 (`photo_2026-07-22_00-33-24.jpg`)**: *Fachada Externa & Entrada* (Bienvenida al Local).

---

## 3. Componentes de UI & Experiencia Magic UI

1. **[`VerticalBreadShowcase.tsx`](file:///G:/CODE/Rose%20Coffee/src/components/public/VerticalBreadShowcase.tsx)**:
   - Muestra la Galería Vertical a la izquierda (contenedor 3:4 `aspect-[3/4]`) y la Ficha Técnica Descriptiva a la derecha.
   - **Regla de UX Crítica**: Utiliza `container.scrollTo({ left: ... })` aislado localmente. **NUNCA usar `scrollIntoView()`** para evitar saltos indeseados de la ventana global (`window`).

2. **[`Floating3DBreadGallery.tsx`](file:///G:/CODE/Rose%20Coffee/src/components/public/Floating3DBreadGallery.tsx)**:
   - Galería flotante 3D en la sección *Nuestra Historia* de [`About.tsx`](file:///G:/CODE/Rose%20Coffee/src/pages/public/About.tsx).
   - Animación de levitación continua, perspectiva 3D al pasar el mouse (3D Tilt & Glow) y visor modal a pantalla completa.

3. **[`ImageGallerySection.tsx`](file:///G:/CODE/Rose%20Coffee/src/components/public/ImageGallerySection.tsx)**:
   - Galería adaptativa *"Del Trigo a la Mesa"*.
   - Utiliza `object-contain` sobre fondo difuminado ambiental (`blur-2xl`) para que **ninguna foto vertical u horizontal se corte**.
   - Marco iluminado con **Magic UI BorderBeam** y selector inferior con **MagicCard**.

4. **Componentes Magic UI**:
   - [`BorderBeam.tsx`](file:///G:/CODE/Rose%20Coffee/src/components/ui/magic/BorderBeam.tsx)
   - [`MagicCard.tsx`](file:///G:/CODE/Rose%20Coffee/src/components/ui/magic/MagicCard.tsx)
   - [`ShimmerButton.tsx`](file:///G:/CODE/Rose%20Coffee/src/components/ui/magic/ShimmerButton.tsx)

---

## 4. Comandos de Build y Despliegue en GitHub Pages

- **Verificación de Tipos**: `npx tsc --noEmit`
- **Build de Producción**: `npm run build`
- **Despliegue a GitHub Pages**: `npm run deploy` (ejecuta `predeploy` para compilar con la base `/rose-coffee/` y sube la carpeta `dist/` a la rama `gh-pages` con `npx gh-pages -d dist`).
