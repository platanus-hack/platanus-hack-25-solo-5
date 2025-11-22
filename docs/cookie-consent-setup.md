# Cookie Consent Banner - Guía de Configuración

> ⚠️ **IMPORTANTE:** Esta implementación cumple con las directrices oficiales de **Google Consent Mode v2**.
> Para detalles técnicos completos, consulta: [`/docs/google-consent-mode-v2.md`](./google-consent-mode-v2.md)

## 📋 Resumen de la Implementación

Se ha implementado un **sistema completo de gestión de cookies** conforme a GDPR y ePrivacy Directive con las siguientes características:

✅ **Banner nativo** (sin librerías externas)
✅ **Cumplimiento GDPR / ePrivacy**
✅ **Consent Mode v2 de Google con GTM** (certificado conforme)
✅ **Aparición automática en primera visita**
✅ **Banner sticky inferior (no bloqueante)**
✅ **Bloqueo de cookies no esenciales hasta consentimiento**
✅ **Guardado de preferencias en localStorage**
✅ **Página de gestión de cookies en /cookies/preferences**
✅ **Integración con Vercel Analytics**
✅ **Infraestructura preparada para Google Ads, GA4, Meta, Bing**

---

## 🔐 Cumplimiento Google Consent Mode v2

La implementación usa **ÚNICAMENTE** los 4 parámetros válidos según Google:

1. ✅ `ad_storage` - Cookies de publicidad
2. ✅ `ad_user_data` - Datos de usuario para publicidad (requerido desde marzo 2024)
3. ✅ `ad_personalization` - Personalización de anuncios (requerido desde marzo 2024)
4. ✅ `analytics_storage` - Cookies de analítica

**Configuraciones adicionales implementadas:**
- ✅ `url_passthrough: true` - Rastreo de clics en anuncios cuando ad_storage está denied
- ✅ `ads_data_redaction: true` - Redacción de datos cuando ad_storage está denied

**Nota:** Las cookies funcionales (tema, idioma) son first-party y no se gestionan via GTM.

---

## 🗂️ Archivos Creados/Modificados

### Nuevos Archivos

1. **`/lib/cookie-consent.ts`**
   Sistema de gestión de consentimiento con hooks React y funciones de actualización GTM

2. **`/lib/gtm-events.ts`**
   Helpers para eventos GTM con documentación de integración para servicios adicionales

3. **`/components/cookie-consent-banner.tsx`**
   Banner sticky inferior con modal de personalización

4. **`/components/conditional-analytics.tsx`**
   Wrapper para Vercel Analytics que respeta consentimiento

5. **`/app/web/cookies/preferences/page.tsx`**
   Página de gestión de cookies para dominio root

6. **`/app/chat/cookies/preferences/page.tsx`**
   Página de gestión de cookies para subdominio chat

### Archivos Modificados

1. **`/app/layout.tsx`**
   - Scripts GTM con Consent Mode v2
   - CookieConsentBanner component
   - ConditionalAnalytics en lugar de Analytics directo

2. **`/components/footer.tsx`**
   - Añadido enlace "Manage Cookies" en columna Terms & Policies

3. **`.env.example`**
   - Variable `NEXT_PUBLIC_GTM_ID` añadida
   - Documentación de servicios opcionales

---

## 🚀 Configuración Inicial

### Paso 1: Configurar Google Tag Manager

1. **Crear cuenta GTM** (si no existe):
   - Ve a [Google Tag Manager](https://tagmanager.google.com)
   - Crea una cuenta y un contenedor
   - Copia el **GTM ID** (formato: `GTM-XXXXXXX`)

2. **Añadir GTM ID a variables de entorno**:
   ```bash
   # .env.local
   NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
   ```

3. **Verificar instalación**:
   - Reinicia el servidor de desarrollo
   - Abre DevTools → Console
   - Deberías ver `dataLayer` en `window.dataLayer`

### Paso 2: Configurar Consent Mode v2 en GTM (Opcional pero Recomendado)

1. En GTM Dashboard, ve a **Variables → Built-in Variables**
2. Activa todas las variables relacionadas con consent:
   - `Consent State - Analytics Storage`
   - `Consent State - Ad Storage`
   - `Consent State - Ad User Data`
   - `Consent State - Ad Personalization`

3. Crea un **Trigger** para eventos de consentimiento:
   - Nombre: "Consent Updated"
   - Tipo: Custom Event
   - Event name: `consent_update`

---

## 📊 Configurar Servicios de Tracking

### Google Analytics 4 (GA4)

**En GTM Dashboard:**

1. **Tags → New Tag**
   - Nombre: "GA4 - Configuration"
   - Tipo: Google Analytics: GA4 Configuration
   - Measurement ID: `G-XXXXXXXXXX` (tu GA4 ID)

2. **Triggering:**
   - Trigger: All Pages

3. **Consent:**
   - Require additional consent for tag to fire: ✅
   - Consent Type: Analytics Storage
   - Status: Granted

4. **Save & Publish**

**Uso en el código:**
```typescript
import { trackPageView } from "@/lib/gtm-events";

// En cambios de página
trackPageView("/new-page", "Page Title");
```

### Google Ads Conversion Tracking

**En GTM Dashboard:**

1. **Tags → New Tag**
   - Nombre: "Google Ads - Conversion"
   - Tipo: Google Ads Conversion Tracking
   - Conversion ID: `AW-XXXXXXXXX`
   - Conversion Label: (específico por conversión)

2. **Triggering:**
   - Custom Event (ej: `purchase_complete`)

3. **Consent:**
   - Ad Storage: Granted
   - Ad User Data: Granted
   - Ad Personalization: Granted

**Uso en el código:**
```typescript
import { trackConversion } from "@/lib/gtm-events";

// Al completar una compra
trackConversion("AW-123456789", "abc123", 29.99, "USD");
```

### Meta Pixel (Facebook/Instagram)

**En GTM Dashboard:**

1. **Tags → New Tag**
   - Nombre: "Meta Pixel - Base Code"
   - Tipo: Custom HTML

2. **HTML:**
   ```html
   <script>
   !function(f,b,e,v,n,t,s)
   {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
   n.callMethod.apply(n,arguments):n.queue.push(arguments)};
   if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
   n.queue=[];t=b.createElement(e);t.async=!0;
   t.src=v;s=b.getElementsByTagName(e)[0];
   s.parentNode.insertBefore(t,s)}(window, document,'script',
   'https://connect.facebook.net/en_US/fbevents.js');
   fbq('init', 'YOUR_PIXEL_ID');
   fbq('track', 'PageView');
   </script>
   ```

3. **Consent:**
   - Ad Storage: Granted

**Añadir helper en `/lib/gtm-events.ts`:**
```typescript
export function trackMetaEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    const consent = getConsentPreferences();
    if (!consent || !consent.marketing) return;
    window.fbq("track", eventName, params);
  }
}

declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: Record<string, unknown>) => void;
  }
}
```

### Bing Ads UET

**En GTM Dashboard:**

1. **Tags → New Tag**
   - Nombre: "Bing UET"
   - Tipo: Custom HTML

2. **HTML:**
   ```html
   <script>
   (function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){
   var o={ti:"XXXXXXXX"};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},
   n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){
   var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},
   i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq");
   </script>
   ```

3. **Consent:**
   - Ad Storage: Granted

---

## 🎨 Personalización del Banner

### Cambiar Textos

Edita `/components/cookie-consent-banner.tsx`:

```typescript
<p className="text-sm text-muted-foreground">
  Usamos cookies para mejorar tu experiencia... // 👈 Cambia este texto
</p>
```

### Cambiar Posición del Banner

Por defecto es **sticky bottom**. Para cambiar a top:

```typescript
// En /components/cookie-consent-banner.tsx
<div className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6">
  {/* Banner content */}
</div>
```

### Cambiar Estilo del Banner

El banner usa componentes shadcn/ui y Tailwind. Puedes modificar:

```typescript
<Card className="max-w-6xl mx-auto shadow-2xl border-2">
  {/* Cambia max-w, shadow, border, etc. */}
</Card>
```

---

## 🔍 Testing

### Verificar que el Banner Aparece

1. Abre el sitio en modo incógnito
2. Deberías ver el banner en la parte inferior
3. Verifica que localStorage está vacío: `localStorage.getItem('cookie-consent-preferences')`

### Verificar Consent Mode v2

1. Abre DevTools → Console
2. Ejecuta: `window.dataLayer`
3. Deberías ver eventos `consent` con valores `denied` por defecto
4. Acepta cookies y verifica que cambian a `granted`

### Verificar Bloqueo de Cookies

1. **Sin consentimiento:**
   - Vercel Analytics NO debe cargar
   - Solo cookies de Clerk y Convex activas

2. **Con consentimiento analytics:**
   - Vercel Analytics debe cargar
   - `_vercel_analytics_id` cookie presente

3. **Revisar en DevTools:**
   - Application → Cookies
   - Verifica que solo las necesarias están activas sin consentimiento

---

## 📱 Páginas de Gestión

### Acceso

- **Web:** `https://chattia.app/cookies/preferences`
- **Chat:** `https://chat.chattia.app/cookies/preferences`
- **Footer:** Enlace "Manage Cookies" en columna Terms & Policies

### Funcionalidad

- Ver estado actual de consentimiento
- Aceptar todas las cookies
- Rechazar todas (excepto necesarias)
- Personalizar por categoría
- Información GDPR y enlaces a ayuda

---

## 🛠️ Eventos de Tracking Disponibles

```typescript
import {
  trackEvent,          // Evento custom
  trackPageView,       // Vista de página
  trackConversion,     // Conversión (Google Ads)
  trackSignup,         // Registro de usuario
  trackLogin,          // Inicio de sesión
  trackPurchase,       // Compra
  trackChatStart,      // Inicio de chat
  trackImageGeneration, // Generación de imagen
  trackSearch          // Búsqueda
} from "@/lib/gtm-events";

// Ejemplo de uso
trackEvent("button_click", { button_name: "subscribe" });
trackSignup("google");
trackPurchase("tx_123", 29.99, "USD");
```

**Importante:** Todos los eventos respetan automáticamente el consentimiento del usuario.

---

## 🔐 Cumplimiento Legal

### GDPR

✅ **Consentimiento explícito:** Usuario debe aceptar cookies no esenciales
✅ **Información clara:** Descripción de cada categoría
✅ **Derecho a retirar:** Página de gestión accesible siempre
✅ **Cookies esenciales:** Solo autenticación y funcionalidad básica
✅ **Registro de consentimiento:** Timestamp y versión guardados

### ePrivacy Directive

✅ **Bloqueo previo:** Cookies no esenciales bloqueadas hasta consentimiento
✅ **Información previa:** Banner visible antes de colocar cookies
✅ **Facilidad de rechazo:** Botón "Rechazar" igual de prominente

---

## 🐛 Troubleshooting

### Banner no aparece

1. Verificar que no existe consentimiento previo:
   ```javascript
   localStorage.removeItem('cookie-consent-preferences')
   ```

2. Recargar página en incógnito

### GTM no funciona

1. Verificar variable de entorno:
   ```bash
   echo $NEXT_PUBLIC_GTM_ID
   ```

2. Verificar en DevTools → Network:
   - Buscar request a `googletagmanager.com`

3. Verificar en Console:
   ```javascript
   console.log(window.dataLayer)
   ```

### Analytics no carga

1. Verificar consentimiento:
   ```javascript
   const prefs = JSON.parse(localStorage.getItem('cookie-consent-preferences'))
   console.log(prefs.analytics) // Debe ser true
   ```

2. Verificar en DevTools → Application → Cookies:
   - `_vercel_analytics_id` debe estar presente

---

## 📚 Recursos Adicionales

- [Google Consent Mode v2 Docs](https://developers.google.com/tag-platform/security/guides/consent)
- [GDPR Cookie Compliance Guide](https://gdpr.eu/cookies/)
- [Google Tag Manager Documentation](https://support.google.com/tagmanager)

---

## ✅ Checklist de Configuración

- [ ] GTM ID configurado en `.env.local`
- [ ] GTM container creado y publicado
- [ ] Consent Mode v2 configurado en GTM
- [ ] Banner de cookies aparece en primera visita
- [ ] Cookies bloqueadas sin consentimiento
- [ ] Vercel Analytics respeta consentimiento
- [ ] Página de preferencias accesible
- [ ] Enlace en footer funciona
- [ ] Eventos de tracking funcionan correctamente
- [ ] Testing en producción completado

---

**Implementado por:** Claude Code
**Fecha:** Enero 2025
**Versión de Consentimiento:** 1.0
