export const metadata = {
  title: "Política de Privacidad | YourTrainer",
  description: "Política de privacidad de YourTrainer. Conoce cómo protegemos y utilizamos tu información personal.",
}

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-16 prose prose-gray dark:prose-invert mx-auto">
      <h1>Política de Privacidad</h1>
      <p className="lead">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <h2>1. Introducción</h2>
      <p>
        En YourTrainer, nos tomamos muy en serio tu privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos tu información cuando usas nuestro servicio de coaching de fitness con IA a través de WhatsApp.
      </p>

      <h2>2. Información que Recopilamos</h2>

      <h3>2.1 Información que Proporcionas</h3>
      <ul>
        <li><strong>Información de cuenta:</strong> Número de teléfono de WhatsApp, nombre</li>
        <li><strong>Fotos y videos:</strong> Imágenes de tu físico y videos de ejercicios que compartes para análisis</li>
        <li><strong>Información de fitness:</strong> Objetivos de entrenamiento, historial de ejercicios, métricas físicas</li>
        <li><strong>Mensajes:</strong> Conversaciones con nuestro asistente IA en WhatsApp</li>
      </ul>

      <h3>2.2 Información Recopilada Automáticamente</h3>
      <ul>
        <li><strong>Datos de uso:</strong> Cómo interactúas con nuestro servicio, frecuencia de uso</li>
        <li><strong>Información técnica:</strong> Tipo de dispositivo, sistema operativo</li>
        <li><strong>Datos de pago:</strong> Información de transacciones (procesada de forma segura por nuestro proveedor de pagos)</li>
      </ul>

      <h2>3. Cómo Utilizamos Tu Información</h2>
      <p>
        Utilizamos la información recopilada para:
      </p>
      <ul>
        <li>Proporcionar análisis de composición corporal personalizados mediante IA</li>
        <li>Realizar análisis biomecánico de tus ejercicios</li>
        <li>Crear planes de entrenamiento personalizados</li>
        <li>Generar predicciones de progreso</li>
        <li>Mejorar nuestros modelos de IA y la calidad del servicio</li>
        <li>Procesar pagos y gestionar suscripciones</li>
        <li>Comunicarnos contigo sobre tu cuenta y servicio</li>
        <li>Cumplir con obligaciones legales</li>
      </ul>

      <h2>4. Compartir Información</h2>
      <p>
        <strong>No vendemos tu información personal.</strong> Podemos compartir tu información en las siguientes circunstancias:
      </p>
      <ul>
        <li><strong>Proveedores de servicios:</strong> Con empresas que nos ayudan a operar nuestro negocio (hosting, procesamiento de pagos, análisis)</li>
        <li><strong>Requisitos legales:</strong> Si la ley lo requiere o para proteger nuestros derechos</li>
        <li><strong>Transferencias comerciales:</strong> En caso de fusión, adquisición o venta de activos</li>
      </ul>

      <h2>5. Procesamiento de Imágenes y Videos</h2>
      <p>
        Las fotos y videos que compartes se procesan mediante nuestros modelos de IA para proporcionar análisis. Estas imágenes:
      </p>
      <ul>
        <li>Se almacenan de forma segura y encriptada</li>
        <li>Se utilizan para generar tus análisis personalizados</li>
        <li>Pueden usarse de forma anónima para mejorar nuestros modelos de IA</li>
        <li>Puedes solicitar su eliminación en cualquier momento</li>
      </ul>

      <h2>6. Seguridad de Datos</h2>
      <p>
        Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal, incluyendo:
      </p>
      <ul>
        <li>Encriptación de datos en tránsito y en reposo</li>
        <li>Controles de acceso estrictos</li>
        <li>Auditorías de seguridad regulares</li>
        <li>Capacitación en privacidad para nuestro equipo</li>
      </ul>

      <h2>7. Tus Derechos</h2>
      <p>
        Dependiendo de tu ubicación, puedes tener los siguientes derechos:
      </p>
      <ul>
        <li><strong>Acceso:</strong> Solicitar una copia de tu información personal</li>
        <li><strong>Corrección:</strong> Actualizar información inexacta</li>
        <li><strong>Eliminación:</strong> Solicitar la eliminación de tu información</li>
        <li><strong>Portabilidad:</strong> Recibir tu información en formato estructurado</li>
        <li><strong>Oposición:</strong> Oponerte a ciertos procesamientos de tu información</li>
        <li><strong>Limitación:</strong> Restringir el procesamiento de tu información</li>
      </ul>

      <h2>8. Retención de Datos</h2>
      <p>
        Conservamos tu información personal mientras tu cuenta esté activa o según sea necesario para proporcionarte servicios. Podemos retener cierta información después del cierre de cuenta según lo requiera la ley o para fines comerciales legítimos.
      </p>

      <h2>9. Privacidad de Menores</h2>
      <p>
        Nuestro servicio no está dirigido a menores de 18 años. No recopilamos intencionalmente información personal de menores. Si descubrimos que hemos recopilado información de un menor, la eliminaremos de inmediato.
      </p>

      <h2>10. Transferencias Internacionales</h2>
      <p>
        Tu información puede ser transferida y procesada en países distintos al tuyo. Tomamos medidas para garantizar que tu información reciba un nivel adecuado de protección dondequiera que se procese.
      </p>

      <h2>11. Cambios a Esta Política</h2>
      <p>
        Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cambios significativos publicando la nueva política en nuestro sitio web y actualizando la fecha de "Última actualización".
      </p>

      <h2>12. Contacto</h2>
      <p>
        Si tienes preguntas sobre esta Política de Privacidad o deseas ejercer tus derechos de privacidad, contáctanos en:
      </p>
      <ul>
        <li>Email: privacy@yourtrainer.ai</li>
        <li>WhatsApp: A través de nuestro servicio</li>
      </ul>
    </div>
  )
}
