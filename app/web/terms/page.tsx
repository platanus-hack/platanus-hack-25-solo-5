export const metadata = {
  title: "Términos de Servicio | YourTrainer",
  description: "Términos y condiciones de uso de YourTrainer, tu coach de fitness con IA en WhatsApp.",
}

export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-16 prose prose-gray dark:prose-invert mx-auto">
      <h1>Términos de Servicio</h1>
      <p className="lead">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <h2>1. Aceptación de los Términos</h2>
      <p>
        Al acceder y utilizar YourTrainer, aceptas estar sujeto a estos Términos de Servicio y todas las leyes y regulaciones aplicables. Si no estás de acuerdo con alguno de estos términos, no debes usar nuestro servicio.
      </p>

      <h2>2. Descripción del Servicio</h2>
      <p>
        YourTrainer es un servicio de coaching de fitness potenciado por inteligencia artificial que proporciona:
      </p>
      <ul>
        <li>Análisis de composición corporal basado en fotografías</li>
        <li>Análisis biomecánico de ejercicios mediante videos</li>
        <li>Planes de entrenamiento personalizados</li>
        <li>Predicciones de progreso físico</li>
        <li>Orientación nutricional general</li>
      </ul>

      <h2>3. Descargo de Responsabilidad Médica</h2>
      <p>
        <strong>IMPORTANTE:</strong> YourTrainer NO es un sustituto de consejo médico profesional, diagnóstico o tratamiento. Siempre consulta con un profesional de la salud calificado antes de comenzar cualquier programa de ejercicios o cambiar tu dieta, especialmente si tienes condiciones médicas preexistentes o lesiones.
      </p>
      <p>
        No somos responsables de ninguna lesión, problema de salud o daño que pueda resultar del uso de nuestro servicio o de seguir nuestras recomendaciones.
      </p>

      <h2>4. Precisión de la Información</h2>
      <p>
        Los análisis corporales y biomecánicos proporcionados por YourTrainer son estimaciones basadas en IA y no deben considerarse mediciones médicas precisas. Se proporcionan únicamente con fines informativos y de seguimiento de progreso.
      </p>

      <h2>5. Uso Aceptable</h2>
      <p>
        Al usar YourTrainer, aceptas:
      </p>
      <ul>
        <li>Proporcionar información precisa y veraz</li>
        <li>Usar el servicio solo para fines personales y legales</li>
        <li>No compartir tu acceso con otras personas</li>
        <li>No intentar manipular, hackear o interferir con el servicio</li>
        <li>Respetar los derechos de propiedad intelectual de YourTrainer</li>
      </ul>

      <h2>6. Suscripciones y Pagos</h2>
      <p>
        YourTrainer ofrece suscripciones mensuales, trimestrales y anuales. Los pagos se procesan de forma segura a través de nuestro proveedor de pagos. Todas las suscripciones se renuevan automáticamente a menos que canceles antes de la fecha de renovación.
      </p>
      <p>
        Ofrecemos una garantía de reembolso de 7 días. Puedes cancelar tu suscripción en cualquier momento sin penalizaciones.
      </p>

      <h2>7. Privacidad y Datos</h2>
      <p>
        El uso de nuestro servicio también está sujeto a nuestra Política de Privacidad. Al usar YourTrainer, consientes la recopilación y uso de tu información según se describe en nuestra Política de Privacidad.
      </p>

      <h2>8. Modificaciones del Servicio</h2>
      <p>
        Nos reservamos el derecho de modificar, suspender o descontinuar cualquier parte del servicio en cualquier momento, con o sin previo aviso. No seremos responsables ante ti ni ante terceros por ninguna modificación, suspensión o descontinuación del servicio.
      </p>

      <h2>9. Limitación de Responsabilidad</h2>
      <p>
        YourTrainer se proporciona "tal cual" y "según disponibilidad". No garantizamos que el servicio será ininterrumpido, oportuno, seguro o libre de errores. En la máxima medida permitida por la ley, no seremos responsables de daños indirectos, incidentales, especiales, consecuentes o punitivos.
      </p>

      <h2>10. Ley Aplicable</h2>
      <p>
        Estos Términos se regirán e interpretarán de acuerdo con las leyes de Estados Unidos, sin dar efecto a ningún principio de conflicto de leyes.
      </p>

      <h2>11. Contacto</h2>
      <p>
        Si tienes preguntas sobre estos Términos de Servicio, contáctanos en support@yourtrainer.ai
      </p>
    </div>
  )
}
