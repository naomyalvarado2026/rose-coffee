# 🚀 Rose Coffee — Plataforma Digital Premium

Rose Coffee es una experiencia digital premium diseñada para una marca de café de especialidad y panadería artesanal de masa madre. Esta plataforma incluye un sitio web comercial elegante, una tienda en línea completa con carrito de compras, modelos interactivos 3D en Realidad Aumentada (AR) para visualización de productos, y un potente panel de administración para la gestión de productos, pedidos, inventario, analíticas y edición en tiempo real de los contenidos del sitio.

---

## 🎨 Características Clave

- **Branding y Experiencia Premium:** Diseño moderno basado exclusivamente en la superfamilia tipográfica **Inter** (pesos 300 a 900) con animaciones fluidas (`framer-motion`), diseño responsivo y estética cálida.
- **Tienda en Línea & E-commerce:**
  - Carrito de compras reactivo.
  - Checkout integrado con soporte para dos métodos de pago:
    - Tarjeta de crédito/débito simulada.
    - Transferencia bancaria directa con opción de subir comprobante de pago.
  - Registro de compras y descargas seguras para recursos digitales en la sección "Mis Compras".
- **Panel Administrativo (Centro de Operaciones):**
  - **Dashboard Principal:** Resumen financiero, últimos pedidos y estado del inventario.
  - **Editor Web Dinámico:** Permite modificar títulos, subtítulos, contenidos y subir imágenes de portada para páginas de Inicio, Nosotros, Tienda y Contacto sin necesidad de modificar el código fuente.
  - **Gestor de Productos y Variantes:** Control completo sobre nombres, precios, fotos (vía Cloudinary), stock y variantes de producto.
  - **Gestor de Pedidos:** Aprobación y seguimiento de pagos por transferencia (revisión de comprobante cargado por el cliente), preparación y entrega de pedidos.
  - **Gestor de AR (Realidad Aumentada):** Vinculación de modelos 3D (`.glb`) con productos del catálogo para permitir a los clientes escanear un código QR o presionar un botón y ver el producto en su espacio real.
  - **Módulos Adicionales:** Clientes, Inventario, Producción, Analíticas avanzadas y Configuración del negocio.
- **Canal de Contacto Certificado:** Configurado y enlazado directamente con el número telefónico oficial **+593980372113**.

---

## 🛠️ Tecnologías y Servicios

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Framer Motion.
- **Base de Datos & Backend:** Supabase (PostgreSQL, Realtime, Autenticación y Storage de archivos).
- **Gestión de Medios:** Cloudinary (para subida y optimización de imágenes en el panel administrativo).
- **Visualización 3D:** Google Model Viewer.
- **Despliegue:** GitHub Pages (con soporte para SPA) y compatible con Vercel.

---

## 🚀 Despliegue en GitHub Pages (¡Ya configurado!)

La aplicación ya se encuentra subida y configurada para actualizarse fácilmente.
La URL pública de producción es:
👉 **[https://naomyalvarado2026.github.io/rose-coffee/](https://naomyalvarado2026.github.io/rose-coffee/)**

### Cómo publicar nuevos cambios:

Cada vez que realices cambios en el código local y desees verlos reflejados en el enlace público de producción, simplemente ejecuta en la terminal del proyecto:

```bash
npm run deploy
```

Este comando ejecutará automáticamente:
1. Compilación optimizada del código fuente con la base URL correspondiente (`/rose-coffee/`).
2. Sube y publica la carpeta compilada (`dist`) en la rama `gh-pages` de tu repositorio de GitHub de forma totalmente automatizada.

*Nota: Hemos configurado un mecanismo de redirección en `public/404.html` e `index.html` para que las rutas SPA como `/nosotros`, `/tienda`, etc., no devuelvan un error 404 al recargar la página directamente en GitHub Pages.*

---

## 📐 Cómo desplegar en Vercel (Opcional)

Si en el futuro deseas migrar el hosting a **Vercel** para beneficiarte de sus despliegues automáticos a partir de ramas Git y sus capacidades avanzadas, puedes hacerlo en unos sencillos pasos:

1. Ve a [Vercel](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New" > "Project"**.
3. Selecciona tu repositorio **`rose-coffee`**.
4. En la configuración del proyecto, agrega las variables de entorno necesarias que tienes configuradas localmente en tu archivo `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_UPLOAD_PRESET`
5. Haz clic en **Deploy**.

*Nota: La aplicación ya cuenta con compatibilidad integrada para base URL dinámica, por lo que detectará automáticamente que está servida desde la raíz en Vercel y funcionará de inmediato.*

---

## 💻 Desarrollo Local

Para ejecutar y probar la aplicación en tu entorno de desarrollo local:

1. Instala las dependencias del proyecto:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
3. Abre [http://localhost:5173](http://localhost:5173) en tu navegador.
