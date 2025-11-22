# Google Consent Mode v2 - Implementación Conforme

## 📋 Resumen

Este documento explica cómo se implementó **Google Consent Mode v2** en OpenChat siguiendo las directrices oficiales de Google.

**Referencia oficial:** [Google Tag Platform - Consent Mode](https://developers.google.com/tag-platform/security/guides/consent?consentmode=advanced)

---

## ✅ Parámetros Válidos en Consent Mode v2

Según la documentación oficial de Google, **SOLO** estos 4 parámetros son válidos:

### 1. `ad_storage`
- **Controla:** Almacenamiento de cookies relacionadas con publicidad
- **Afecta:** Google Ads, remarketing, conversion tracking
- **Valores:** `'granted'` | `'denied'`

### 2. `ad_user_data`
- **Controla:** Envío de datos de usuario a Google para publicidad
- **Requerido desde:** Marzo 2024 (Consent Mode v2)
- **Afecta:** Targeting de anuncios, listas de audiencias
- **Valores:** `'granted'` | `'denied'`

### 3. `ad_personalization`
- **Controla:** Personalización de anuncios basada en comportamiento del usuario
- **Requerido desde:** Marzo 2024 (Consent Mode v2)
- **Afecta:** Anuncios personalizados en Google Ads
- **Valores:** `'granted'` | `'denied'`

### 4. `analytics_storage`
- **Controla:** Almacenamiento de cookies de analítica
- **Afecta:** Google Analytics 4 (GA4), Vercel Analytics vía GTM
- **Valores:** `'granted'` | `'denied'`

---

## ❌ Parámetros NO Válidos

Los siguientes parámetros **NO existen** en Consent Mode v2 y **NO deben usarse**:

- ❌ `functionality_storage` - No es parte de la especificación
- ❌ `personalization_storage` - No es parte de la especificación
- ❌ `security_storage` - No es parte de la especificación

**Nota importante:** Las cookies funcionales (tema, idioma, preferencias) son cookies first-party que no se gestionan a través de GTM. Estas se manejan directamente en el cliente y no requieren Consent Mode.

---

## 🔧 Implementación en OpenChat

### 1. Configuración Inicial (Default Consent)

En `/app/layout.tsx`, establecemos todos los parámetros en `denied` por defecto:

```javascript
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'wait_for_update': 500
});
```

**Características:**
- ✅ Se ejecuta **antes** del script de GTM (`strategy="beforeInteractive"`)
- ✅ Todos los parámetros comienzan en `denied`
- ✅ `wait_for_update: 500` - Espera 500ms para que el banner cargue

### 2. Configuraciones Adicionales Requeridas

#### URL Passthrough
Permite rastrear clics en anuncios incluso cuando `ad_storage` está denied:

```javascript
gtag('set', 'url_passthrough', true);
```

#### Ads Data Redaction
Redacta datos de anuncios cuando `ad_storage` está denied:

```javascript
gtag('set', 'ads_data_redaction', true);
```

### 3. Actualización de Consentimiento

Cuando el usuario acepta/rechaza cookies, actualizamos el estado:

```javascript
// En /lib/cookie-consent.ts
window.gtag("consent", "update", {
  analytics_storage: preferences.analytics ? "granted" : "denied",
  ad_storage: preferences.marketing ? "granted" : "denied",
  ad_user_data: preferences.marketing ? "granted" : "denied",
  ad_personalization: preferences.marketing ? "granted" : "denied",
});
```

**Mapeo de Categorías:**
- `necessary` → No se envía a GTM (siempre permitidas)
- `functional` → No se envía a GTM (cookies first-party, no controladas por GTM)
- `analytics` → `analytics_storage`
- `marketing` → `ad_storage`, `ad_user_data`, `ad_personalization`

---

## 📊 Flujo de Consentimiento

### Primera Visita (Sin Consentimiento)

```
1. Usuario visita el sitio
   ↓
2. GTM carga con consent 'default' = 'denied'
   ↓
3. Tags de GTM NO se ejecutan (bloqueados por Consent Mode)
   ↓
4. Banner aparece (500ms máximo de espera)
   ↓
5. Usuario acepta/rechaza
   ↓
6. gtag('consent', 'update') se ejecuta
   ↓
7. Tags permitidos se ejecutan automáticamente
```

### Visitas Posteriores (Con Consentimiento)

```
1. Usuario visita el sitio
   ↓
2. JavaScript lee localStorage
   ↓
3. gtag('consent', 'default') con valores guardados
   ↓
4. GTM carga con consent correcto desde el inicio
   ↓
5. Tags se ejecutan según el consentimiento guardado
```

---

## 🌍 Consideraciones Regionales (EEA)

### Opción 1: Global (Nuestra Implementación Actual)
Aplicar `denied` por defecto en **todos** los países:

```javascript
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  // ...
});
```

**Ventaja:** Cumplimiento GDPR garantizado
**Desventaja:** Puede afectar medición en regiones sin regulación

### Opción 2: Regional (Alternativa)
Aplicar `denied` solo en EEA/UK:

```javascript
// Para EEA/UK
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'region': ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE',
             'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT',
             'RO', 'SK', 'SI', 'ES', 'SE', 'GB']
});

// Para resto del mundo (opcional)
gtag('consent', 'default', {
  'ad_storage': 'granted',
  'analytics_storage': 'granted'
});
```

**Para implementar enfoque regional:** Modificar `/app/layout.tsx` con lógica de detección de región.

---

## ✅ Validación de Implementación

### 1. Verificar Default Consent

```javascript
// En DevTools Console
console.log(window.dataLayer);

// Buscar:
{
  0: "consent",
  1: "default",
  2: {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500
  }
}
```

### 2. Verificar Update Consent

```javascript
// Después de aceptar cookies
console.log(window.dataLayer);

// Buscar:
{
  0: "consent",
  1: "update",
  2: {
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
    analytics_storage: "granted"
  }
}
```

### 3. Usar Google Tag Assistant

1. Instalar [Tag Assistant Legacy](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Abrir el sitio
3. Verificar:
   - ✅ Consent Mode está activo
   - ✅ Default values = denied
   - ✅ Update values = granted/denied según elección

### 4. Verificar en GTM Preview Mode

1. En GTM Dashboard → Preview
2. Cargar el sitio
3. En la pestaña "Consent":
   - Ver estado inicial (denied)
   - Ver actualización tras banner (granted/denied)

---

## 🔍 Troubleshooting

### Problema: Tags no se ejecutan después de aceptar

**Causa:** El `gtag('consent', 'update')` no se está ejecutando

**Solución:**
```javascript
// En DevTools Console
localStorage.removeItem('cookie-consent-preferences')
// Recargar página y aceptar de nuevo
```

### Problema: Consent Mode no aparece en GTM

**Causa:** Script de consent debe cargarse ANTES de GTM

**Verificar:**
```javascript
// El script gtm-consent-init debe tener:
strategy="beforeInteractive"

// Y estar ANTES del script de GTM
```

### Problema: Cookies se colocan antes de consentimiento

**Causa:** Tags en GTM no tienen configurado Consent Requirements

**Solución en GTM:**
1. Abrir cada Tag
2. Advanced Settings → Consent Settings
3. Marcar "Require additional consent for tag to fire"
4. Seleccionar consent types requeridos:
   - Analytics tags: `analytics_storage`
   - Ads tags: `ad_storage`, `ad_user_data`, `ad_personalization`

---

## 📚 Recursos Oficiales

- [Consent Mode v2 Guide](https://developers.google.com/tag-platform/security/guides/consent?consentmode=advanced)
- [Consent Mode Implementation](https://support.google.com/tagmanager/answer/10718549)
- [Consent Mode Best Practices](https://developers.google.com/tag-platform/security/guides/consent-best-practices)
- [EEA Requirements](https://support.google.com/google-ads/answer/13389035)

---

## 📝 Cambios Respecto a Implementación Original

### Eliminado
- ❌ `functionality_storage` (no existe en Consent Mode v2)
- ❌ `personalization_storage` (no existe en Consent Mode v2)

### Añadido
- ✅ `url_passthrough: true`
- ✅ `ads_data_redaction: true`
- ✅ Documentación completa de parámetros válidos
- ✅ Comentarios explicativos en código

### Sin Cambios
- ✅ `wait_for_update: 500` (correcto)
- ✅ Default state = `denied` (correcto)
- ✅ Update on user choice (correcto)
- ✅ Orden de scripts (correcto)

---

**Última actualización:** Enero 2025
**Versión Consent Mode:** v2
**Cumplimiento:** GDPR, ePrivacy Directive, Google Consent Mode v2
