import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';

const sections = [
  {
    key: 'gettingStarted',
    title: 'Primeros pasos',
    content: (
      <div className="space-y-3 text-sm text-olive-700">
        <p><strong>Registro:</strong> Ve a <em>/register</em> e introduce tu nombre, apellidos, correo y contraseña (mínimo 10 caracteres con mayúscula, minúscula y número). Recibirás un correo de verificación; haz clic en el enlace para activar la cuenta.</p>
        <p><strong>Crear una comunidad:</strong> Accede a <em>Comunidades → Nueva comunidad</em>. Introduce el nombre, dirección, ciudad, código postal y opcionalmente el CIF. Luego añade las unidades (viviendas, locales, garajes, trasteros) con su coeficiente de participación.</p>
        <p><strong>Invitar vecinos:</strong> Desde <em>Invitar vecino</em>, selecciona la comunidad y la unidad, introduce los datos del vecino y envía la invitación. El vecino recibirá un correo para activar su cuenta.</p>
      </div>
    ),
  },
  {
    key: 'units',
    title: 'Gestión de unidades y vecinos',
    content: (
      <div className="space-y-3 text-sm text-olive-700">
        <p><strong>Añadir unidades:</strong> Dentro de la ficha de la comunidad, haz clic en <em>+ Añadir unidad</em>. Introduce el tipo (vivienda, local, garaje, trastero), identificador, planta, puerta y coeficiente de participación.</p>
        <p><strong>Editar o eliminar unidades:</strong> Desde la tabla de unidades, haz clic en ✕ para eliminar una unidad. Solo se puede eliminar si no tiene propietario activo.</p>
        <p><strong>Co-administradores:</strong> En la parte inferior de la ficha de comunidad puedes añadir otros administradores introduciendo su correo electrónico.</p>
        <p><strong>Importar unidades desde CSV:</strong> Usa la opción <em>Importar unidades</em> en la ficha de la comunidad para subir un CSV con el formato <code>label,floor,door,ownerName,ownerEmail,ownerPhone</code>.</p>
      </div>
    ),
  },
  {
    key: 'invoices',
    title: 'Facturas y pagos',
    content: (
      <div className="space-y-3 text-sm text-olive-700">
        <p><strong>Crear factura individual:</strong> Desde <em>Facturas → Nueva factura</em> selecciona el tipo "Individual", introduce el concepto, la fecha de vencimiento y el importe para cada unidad.</p>
        <p><strong>Crear una derrama:</strong> Selecciona el tipo "Derrama" e introduce el importe total. El sistema lo distribuirá automáticamente según el coeficiente de participación de cada unidad.</p>
        <p><strong>Derrama rápida para todas las unidades:</strong> Usa el botón <em>+ Nueva derrama</em> en la lista de facturas. Introduce el concepto, la fecha de vencimiento y el importe por unidad.</p>
        <p><strong>Registrar un pago:</strong> Entra en el detalle de una factura y haz clic en <em>Registrar pago</em> para cada unidad que haya pagado. Indica la cantidad, la fecha y una referencia opcional.</p>
        <p><strong>Morosos:</strong> Accede a <em>Morosos</em> desde la ficha de la comunidad para ver todas las facturas vencidas sin pagar, agrupadas por propietario.</p>
        <p><strong>Cuotas ordinarias:</strong> Configura facturas periódicas (mensuales, trimestrales o anuales) desde <em>Cuotas ordinarias</em>. El sistema las genera automáticamente en la fecha indicada.</p>
      </div>
    ),
  },
  {
    key: 'meetings',
    title: 'Juntas de propietarios',
    content: (
      <div className="space-y-3 text-sm text-olive-700">
        <p><strong>Convocar una junta:</strong> Desde <em>Juntas → Convocar junta</em>, introduce el título, tipo (ordinaria o extraordinaria), fecha y hora, lugar y orden del día. Los vecinos convocados verán la junta en su panel.</p>
        <p><strong>Confirmar asistencia:</strong> Los vecinos pueden confirmar, declinar o delegar su voto desde el detalle de la junta.</p>
        <p><strong>QR de asistencia:</strong> Como administrador, genera un código QR desde el detalle de la junta. Los vecinos lo escanean para registrar su asistencia automáticamente.</p>
        <p><strong>Actas:</strong> Tras celebrar la junta, redacta el acta en el campo correspondiente y publícala para que los vecinos puedan consultarla. También puedes adjuntar una URL a un PDF externo.</p>
        <p><strong>Votaciones:</strong> Crea votaciones dentro de cada junta con pregunta, opciones (a favor / en contra / abstención) y fecha límite opcional.</p>
      </div>
    ),
  },
  {
    key: 'announcements',
    title: 'Anuncios y mensajes',
    content: (
      <div className="space-y-3 text-sm text-olive-700">
        <p><strong>Publicar un anuncio:</strong> Desde <em>Anuncios → Nuevo anuncio</em>, escribe el título y el contenido. Activa la opción de notificación por correo para avisar a todos los vecinos de la comunidad.</p>
        <p><strong>Fijar anuncios:</strong> Marca la opción <em>Fijar arriba</em> para que el anuncio aparezca siempre en primer lugar en el tablón.</p>
        <p><strong>Notificaciones push:</strong> Los vecinos pueden activar las notificaciones push desde su perfil para recibir alertas instantáneas en el navegador.</p>
        <p><strong>Mensajes directos:</strong> Usa el panel de <em>Mensajes</em> para mantener conversaciones privadas entre el administrador y cada vecino.</p>
      </div>
    ),
  },
  {
    key: 'areas',
    title: 'Zonas comunes',
    content: (
      <div className="space-y-3 text-sm text-olive-700">
        <p><strong>Configurar áreas:</strong> Desde <em>Zonas comunes</em> crea las áreas disponibles (piscina, sala de reuniones, etc.) con su nombre, aforo, horario de apertura y cierre, duración de cada franja y número máximo de reservas por vecino al día.</p>
        <p><strong>Gestionar reservas:</strong> Tanto los vecinos como el administrador pueden ver qué franjas están libres u ocupadas y realizar reservas.</p>
        <p><strong>Lista de espera:</strong> Si una franja está ocupada, el vecino puede unirse a la lista de espera. Cuando se cancele la reserva, será notificado.</p>
        <p><strong>Cancelar reservas:</strong> El propietario de la reserva o el administrador pueden cancelarla desde la vista de la zona.</p>
      </div>
    ),
  },
  {
    key: 'documents',
    title: 'Documentos',
    content: (
      <div className="space-y-3 text-sm text-olive-700">
        <p><strong>Subir documentos:</strong> Desde <em>Documentos</em> añade documentos con nombre, URL (Google Drive, Dropbox, etc.), descripción y categoría.</p>
        <p><strong>Visibilidad:</strong> Puedes marcar un documento como visible para los vecinos o dejarlo solo para administradores.</p>
        <p><strong>Categorías:</strong> Actas, reglamentos, presupuestos, contratos, certificados y otros.</p>
        <p><strong>Acceso de vecinos:</strong> Los vecinos ven los documentos públicos de su comunidad desde <em>Documentos</em> en su panel.</p>
      </div>
    ),
  },
  {
    key: 'meters',
    title: 'Contadores',
    content: (
      <div className="space-y-3 text-sm text-olive-700">
        <p><strong>Registrar lecturas:</strong> Desde <em>Contadores</em> añade lecturas de agua, luz, gas u otros por unidad. Introduce el valor leído y la fecha.</p>
        <p><strong>Consumo:</strong> El sistema calcula automáticamente el consumo entre lecturas consecutivas de la misma unidad y tipo.</p>
        <p><strong>Historial:</strong> Filtra por tipo de contador o por unidad para consultar el historial de lecturas.</p>
      </div>
    ),
  },
  {
    key: 'billing',
    title: 'Suscripción y facturación',
    content: (
      <div className="space-y-3 text-sm text-olive-700">
        <p><strong>Plan gratuito:</strong> El plan gratuito incluye la funcionalidad básica de gestión de comunidades, facturas y vecinos.</p>
        <p><strong>Plan PRO:</strong> El plan PRO desbloquea comunidades ilimitadas, archivo de documentos, exportación de informes PDF, historial de contadores, votaciones telemáticas, calendario unificado y soporte prioritario.</p>
        <p><strong>Suscribirse:</strong> Desde <em>Facturación</em> haz clic en <em>Suscribirse a PRO</em>. Aceptamos tarjeta, Google Pay y Apple Pay.</p>
        <p><strong>Gestionar suscripción:</strong> Desde el mismo panel puedes actualizar el método de pago o cancelar la suscripción.</p>
      </div>
    ),
  },
  {
    key: 'security',
    title: 'Seguridad',
    content: (
      <div className="space-y-3 text-sm text-olive-700">
        <p><strong>Verificación en dos pasos (2FA):</strong> Desde <em>Mi perfil → Verificación en dos pasos</em>, activa el 2FA escaneando el código QR con una app como Google Authenticator o Authy e introduciendo el código de confirmación.</p>
        <p><strong>Cambiar contraseña:</strong> En <em>Mi perfil → Cambiar contraseña</em> introduce la contraseña actual y la nueva (mínimo 8 caracteres).</p>
        <p><strong>Notificaciones push:</strong> En <em>Mi perfil</em> puedes activar o desactivar las notificaciones push del navegador.</p>
        <p><strong>Cerrar sesión:</strong> Usa el botón <em>Cerrar sesión</em> en la barra superior para salir de forma segura. Los tokens de sesión expiran automáticamente.</p>
      </div>
    ),
  },
];

function HelpSection({ title, content }) {
  return (
    <details className="group rounded-xl border border-olive-200 bg-white">
      <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-display text-lg font-medium text-olive-900 select-none list-none">
        {title}
        <span className="shrink-0 text-olive-400 transition-transform group-open:rotate-180" aria-hidden="true">
          ▾
        </span>
      </summary>
      <div className="border-t border-olive-100 px-5 py-4">
        {content}
      </div>
    </details>
  );
}

export function HelpPage() {
  const { t } = useTranslation();

  return (
    <Layout>
      <p className="text-xs uppercase tracking-wider text-olive-600">{t('help.eyebrow')}</p>
      <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('help.title')}</h1>
      <p className="mt-2 text-olive-600">{t('help.subtitle')}</p>

      <div className="mt-8 space-y-3">
        {sections.map((section) => (
          <HelpSection key={section.key} title={section.title} content={section.content} />
        ))}
      </div>
    </Layout>
  );
}
