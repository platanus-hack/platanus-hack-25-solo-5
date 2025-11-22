export const metadata = {
  title: "Política de Cookies | YourTrainer",
  description: "Conoce cómo YourTrainer utiliza cookies y tecnologías similares para mejorar tu experiencia.",
}

export default function CookiesPage() {
  return (
    <div className="container max-w-4xl py-16 prose prose-gray dark:prose-invert mx-auto">
      <h1>Política de Cookies</h1>
      <p className="lead">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <h2>1. ¿Qué son las Cookies?</h2>
      <p>
        Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente y para proporcionar información a los propietarios del sitio.
      </p>

      <h2>2. Cómo Utilizamos las Cookies</h2>
      <p>
        YourTrainer utiliza cookies y tecnologías similares para:
      </p>
      <ul>
        <li>Mantener tu sesión activa cuando regresas a nuestro sitio</li>
        <li>Recordar tus preferencias (como tema claro/oscuro)</li>
        <li>Analizar cómo usas nuestro sitio web para mejorarlo</li>
        <li>Proporcionar funcionalidades de seguridad</li>
        <li>Medir la efectividad de nuestras campañas de marketing</li>
      </ul>

      <h2>3. Tipos de Cookies que Utilizamos</h2>

      <h3>3.1 Cookies Estrictamente Necesarias</h3>
      <p>
        Estas cookies son esenciales para que puedas navegar por nuestro sitio web y utilizar sus funciones. Sin estas cookies, los servicios que has solicitado no pueden proporcionarse.
      </p>
      <p><strong>Ejemplos:</strong></p>
      <ul>
        <li>Cookies de autenticación de sesión</li>
        <li>Cookies de seguridad</li>
        <li>Cookies de preferencias de accesibilidad</li>
      </ul>

      <h3>3.2 Cookies de Rendimiento y Análisis</h3>
      <p>
        Estas cookies recopilan información sobre cómo usas nuestro sitio web, como qué páginas visitas con más frecuencia. Esta información se utiliza para mejorar el funcionamiento del sitio.
      </p>
      <p><strong>Ejemplos:</strong></p>
      <ul>
        <li>Google Analytics</li>
        <li>Métricas de rendimiento del sitio</li>
        <li>Análisis de comportamiento del usuario</li>
      </ul>

      <h3>3.3 Cookies de Funcionalidad</h3>
      <p>
        Estas cookies permiten que nuestro sitio web recuerde las elecciones que haces y proporcione funciones mejoradas y más personales.
      </p>
      <p><strong>Ejemplos:</strong></p>
      <ul>
        <li>Preferencia de idioma</li>
        <li>Configuración de tema (claro/oscuro)</li>
        <li>Configuraciones de interfaz de usuario</li>
      </ul>

      <h3>3.4 Cookies de Marketing</h3>
      <p>
        Estas cookies se utilizan para rastrear visitantes en sitios web. La intención es mostrar anuncios que sean relevantes y atractivos para el usuario individual.
      </p>
      <p><strong>Ejemplos:</strong></p>
      <ul>
        <li>Píxeles de seguimiento de conversión</li>
        <li>Cookies de remarketing</li>
        <li>Análisis de campañas publicitarias</li>
      </ul>

      <h2>4. Cookies de Terceros</h2>
      <p>
        Además de nuestras propias cookies, también utilizamos cookies de terceros para:
      </p>
      <ul>
        <li><strong>Google Analytics:</strong> Para análisis de sitio web</li>
        <li><strong>WhatsApp:</strong> Para integración de servicios de mensajería</li>
        <li><strong>Stripe:</strong> Para procesamiento de pagos</li>
        <li><strong>Vercel:</strong> Para alojamiento y rendimiento</li>
      </ul>

      <h2>5. Duración de las Cookies</h2>
      <p>
        Utilizamos cookies de sesión y cookies persistentes:
      </p>
      <ul>
        <li><strong>Cookies de sesión:</strong> Se eliminan automáticamente cuando cierras tu navegador</li>
        <li><strong>Cookies persistentes:</strong> Permanecen en tu dispositivo durante un período determinado o hasta que las elimines manualmente</li>
      </ul>

      <h2>6. Control de Cookies</h2>
      <p>
        Puedes controlar y/o eliminar cookies según desees. Puedes eliminar todas las cookies que ya están en tu dispositivo y configurar la mayoría de los navegadores para evitar que se coloquen.
      </p>

      <h3>Gestión de Cookies en Navegadores</h3>
      <ul>
        <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios</li>
        <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio</li>
        <li><strong>Safari:</strong> Preferencias → Privacidad → Gestionar datos del sitio web</li>
        <li><strong>Edge:</strong> Configuración → Cookies y permisos del sitio → Cookies</li>
      </ul>

      <p>
        <strong>Nota:</strong> Si eliges bloquear o eliminar cookies, algunas partes de nuestro sitio web pueden no funcionar correctamente.
      </p>

      <h2>7. Tecnologías Similares</h2>
      <p>
        Además de cookies, también utilizamos:
      </p>
      <ul>
        <li><strong>Local Storage:</strong> Para almacenar datos localmente en tu navegador</li>
        <li><strong>Session Storage:</strong> Para datos temporales durante tu sesión de navegación</li>
        <li><strong>Web Beacons:</strong> Pequeñas imágenes invisibles utilizadas para rastrear interacciones</li>
      </ul>

      <h2>8. Actualizaciones de Esta Política</h2>
      <p>
        Podemos actualizar esta Política de Cookies ocasionalmente para reflejar cambios en las cookies que utilizamos o por razones operativas, legales o regulatorias.
      </p>

      <h2>9. Más Información</h2>
      <p>
        Para más información sobre cómo utilizamos, almacenamos y protegemos tus datos personales, consulta nuestra Política de Privacidad.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Si tienes preguntas sobre nuestro uso de cookies, contáctanos en:
      </p>
      <ul>
        <li>Email: privacy@yourtrainer.ai</li>
        <li>WhatsApp: A través de nuestro servicio</li>
      </ul>
    </div>
  )
}
