# ☕ Rose Coffee — Plataforma Web Premium E-Commerce & WebAR

> **Plataforma digital interactiva y sistema administrativo** para Rose Coffee (Cafetería de Especialidad & Panadería de Masa Madre), Milagro, Ecuador.  
> Desarrollado con ❤️ para una experiencia gastronómica digital de primer nivel.

---

## 📖 ¿Qué es este proyecto?

**Rose Coffee** es una experiencia digital premium que combina un sitio web público de alta conversión con un completo panel de administración protegido por roles (RBAC). La plataforma está diseñada para impulsar las ventas directas mediante WhatsApp y pasarelas de pago, educar a los usuarios en el origen de los granos (tueste local de Loja y Zaruma), fidelizar clientes mediante el club de puntos **Rose Club**, y asombrar a los comensales mediante visualizadores interactivos en **Realidad Aumentada (AR) 3D** de panes artesanales de masa madre y combos de café.

---

## 🛠️ Stack Tecnológico

### Lenguajes & Bases de Datos
| Tecnología | Uso |
|---|---|
| **TypeScript** | Lenguaje de tipado estricto (`npx tsc --noEmit`) para robustez en frontend y tipos de datos. |
| **SQL** | Esquemas relacionales y políticas de seguridad RLS en PostgreSQL (Supabase). |
| **HTML5 / CSS3** | Estructura semántica con variables CSS modernas y gradientes Tailwinds v4. |

### Framework & Core Libraries
| Tecnología | Versión | Propósito |
|---|---|---|
| **React** | 19.2 | Biblioteca de componentes de interfaz y Hooks reactivos. |
| **Vite** | 8.0 | Bundler ultrarrápido y HMR instantáneo para desarrollo. |
| **React Router DOM** | 7.17 | Enrutamiento SPA con rutas públicas y protegidas por permisos. |
| **Tailwind CSS** | 4.3 | Framework de utilidades CSS con soporte nativo para variables. |
| **Framer Motion** | 12.40 | Animaciones de orbes, transiciones suaves y micro-interacciones. |
| **Zustand** | 5.0 | Gestión de estado global ligera para autenticación y carrito de compras. |
| **Sonner** | 2.0 | Notificaciones tipo toast interactivas. |

### Visualización & AR
| Tecnología | Propósito |
|---|---|
| **model-viewer** (Google) | Renderizado 3D interactivo y compatibilidad cruzada de WebXR (Android/iOS) sin complementos adicionales. |
| **qrcode.react** | Generador de códigos QR vectoriales (SVG) de descarga instantánea para vasos y menús físicos. |
| **Recharts** | Panel analítico interactivo de ventas e ingresos mensuales en el Dashboard. |

---

## ☁️ Backend & Infraestructura

### Base de Datos Relacional (Supabase)
* **Tablas Core**: `products`, `orders`, `order_items`, `profiles`, `page_contents`, `loyalty_points`, `loyalty_transactions`, `subscriptions`.
* **Seguridad de Datos**: Seguridad de Nivel de Fila (RLS) habilitada en todas las tablas sensibles para restringir lecturas y escrituras exclusivamente a usuarios autorizados o administradores.

### CDN & Media Hosting
* **Cloudinary**: Alojamiento dinámico de fotos de perfil, comprobantes de pago de usuarios y miniaturas de variantes.
* **Supabase Storage**: Buckets seguros para la descarga y el servicio directo de modelos 3D `.glb`.

---

## 🎨 Identidad Visual & Diseño Premium

### Paleta de Colores Warm & Cozy
La estética está inspirada en los tonos cálidos del café y el trigo, garantizando altos contrastes y legibilidad WCAG AA:
* `--color-base` (`#faf2e7`): Fondo base cálido y limpio de la aplicación.
* `--color-cream` (`#fdf6ee`): Crema suave para fondos de tarjetas y bloques interactivos.
* `--color-primary` (`#021a54`): Azul profundo de alta distinción.
* `--color-coffee` (`#6b3a0e`): Café tostado medio para acentos primarios de marca.
* `--color-coffee-dark` (`#4d2607`): Café tostado oscuro para botones y estados hover activos.
* `--color-gold` (`#c8922a`): Dorado tostado para insignias de fidelidad y elementos destacados.
* `--color-emerald` (`#10b981`): Verde natural de alta conversión para accesos directos de WhatsApp.

### Tipografía Consistente
* **Inter**: Super-familia tipográfica sans-serif de ancho variable (`--font-sans`) empleada de forma uniforme en títulos, cuerpo de texto, botones, tablas y formularios para una experiencia visual de alta cohesión.

---

## 🗂️ Estructura y Módulos de la Aplicación

### Experiencia Pública (Conversión y Educación)
1. **Inicio (`/`)**: Hero de pantalla dividida con efecto de vapor animado y orbes flotantes, timeline interactivo *"Del grano a tu taza"*, biografía de origen Loja/Zaruma, sección **Rose Club**, **Suscripciones de Café**, testimonios destacados y localizador físico.
2. **Tienda (`/tienda`)**: Buscador con autocompletado, pestañas de filtrado rápido ("AR 3D", "Nuevos", "Más vendidos") y tarjetas de productos premium que enlazan a las páginas de detalle individual.
3. **Detalle del Producto (`/producto/:id`)**: Ficha técnica artesanal enriquecida (con selector dinámico de tamaño, peso, molienda y resolvedor de iconos SVG/emojis adaptativo), galería de fotos variante y visualización en Realidad Aumentada (AR) 3D overlay interactiva.
4. **Carrito (`/cart`)**: Checkout fluido en pasos con opción de pago dual (tarjeta y transferencia con subida de comprobante) y generación de enlace rápido de despacho por WhatsApp a la línea oficial **+593980372113**.
5. **Nosotros (`/nosotros`)**: Rediseño premium estructurado con orbes difuminados de ambiente (`bg-gold/5`, `bg-coffee/5`), bloques de Misión y Visión con efecto `.glass-card` con bordes suaves de café (`border-coffee/10`) y elevación micro-animada, sección histórica interactiva con galerías de fotos del equipo, y tarjetas de biografía premium de los fundadores (Esteban y Naomy) con etiquetas doradas de rol.
6. **Contacto (`/contacto`)**: Página de contacto rediseñada estéticamente. Integra un banner superior (hero) con imagen cálida rústica de fondo y degradado radial, tarjetas de canales (Dirección, Atención, Email) en tono crema (`bg-cream`) con bordes de baja opacidad y micro-animaciones, un mapa de ubicación interactivo empotrado con bordes ultra-redondeados (`rounded-[32px]`) y sombra elegante, un formulario de mensajes estilo `.glass-card` con campos de entrada táctiles con foco dinámico café tostado (`focus:border-coffee focus:ring-coffee/20`), y un bloque callout premium destacado en verde esmeralda para pedidos rápidos inmediatos a través de la línea de WhatsApp certificada **+593980372113**.

### Módulos Administrativos (Gestión y Operatividad)
* 📊 **Dashboard General (`/admin`)**: Indicadores clave de rendimiento (ventas totales, promedio de tickets, alertas de stock mínimo, producto estrella) y gráficos interactivos mensuales.
* 📦 **Gestor de Tienda / Stock (`/admin/productos`)**: Formulario avanzado de productos con campo `stock_min` (mínimo de seguridad). Cuenta con pills de color (🟢 Stock OK, 🟡 Stock Bajo, 🔴 Agotado) y un banner superior que enumera alertas de stock crítico.
* 📋 **Tablero Kanban de Pedidos (`/admin/pedidos`)**: Gestión interactiva de estados de compras (`pending_payment`, `paid`, `ready_for_pickup`, `completed`, `cancelled`), visualizador de comprobantes de transferencia y bloc de notas internas del personal.
* 👥 **CRM de Clientes (`/admin/clientes`)**: Registro histórico de compras de usuarios, ticket promedio y gestión del saldo de puntos del programa de fidelización.
* 📄 **Editor Dinámico de Páginas (`/admin/paginas`)**: Control total sobre los textos, imágenes de fondo y banners de la página de Inicio (`home`), Nosotros (`about`) e inclusive el Banner Principal de la Tienda (`store`).

---

## ⚡ Optimizaciones y SEO Integrado

### Motor SEO Dinámico (`SEOHead.tsx`)
Inyección controlada de metadatos en caliente en el ciclo de vida de React:
* Actualiza de forma dinámica el título de la pestaña del navegador.
* Añade o sobreescribe las etiquetas `<meta name="description">` y `<meta name="keywords">`.
* Soporta el protocolo Open Graph (`og:title`, `og:description`, `og:image`, `og:url`) para previsualizaciones premium al compartir enlaces en redes sociales o WhatsApp.

### JSON-LD Structured Data (`index.html`)
Declaración semántica integrada para indexación inteligente en motores de búsqueda (Google, Bing) describiendo las métricas del local físico:
* Tipo: `Bakery` y `Cafe` local.
* Dirección física: *E25 y Av. 17 de Septiembre, Milagro, Ecuador*.
* Horario de atención: *Lunes a Sábado de 08:00 AM a 08:00 PM*.
* Teléfono de contacto oficial: *+593980372113*.

---

## 📜 Scripts de Ejecución y Diagnóstico

```bash
npm run dev       # Inicia el servidor de desarrollo local de Vite
npm run build     # Genera el paquete de distribución optimizado para producción
npx tsc --noEmit  # Verifica la integridad de tipos en TypeScript
```

---

> **Rose Coffee — Cafetería de Especialidad & Masa Madre**  
> E25 y Av. 17 de Septiembre, Milagro, Ecuador  
> Teléfono WhatsApp: **+593 98 037 2113**  
