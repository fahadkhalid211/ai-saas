import type { EvalSet } from '../../lib/rag/eval/harness';

/**
 * Spanish golden set: the knowledge base a Spanish business would upload (an invented dental clinic in Valencia, in Spanish)
 * and questions written the way Spanish visitors ask them. It exists because the embedding model decides how well retrieval
 * works in a language: an English-only model does well on the English set (eval/rag/golden.ts) and badly on this one.
 *
 *   npm run rag:eval -- --set es            measure the current pipeline on this set
 *   EMBEDDING_MODEL=Xenova/multilingual-e5-small npm run rag:eval -- --set es --save es-e5
 *
 * Same question kinds and rules as golden.ts: the answer must be in the corpus below, questions are natural, and every
 * `contains` text appears word for word in its document. All names, prices and figures are invented.
 */

const precios = `# Tarifas

## Revisión y limpieza
La primera revisión es gratuita. La limpieza dental cuesta 45 €. Una radiografía panorámica cuesta 30 €.

## Tratamientos habituales
Una obturación (empaste) cuesta 60 € por pieza. El blanqueamiento dental cuesta 280 €. Un implante con corona cuesta 1.450 €. La ortodoncia invisible cuesta desde 2.400 € el tratamiento completo.

## Formas de pago
Aceptamos tarjeta, transferencia y efectivo. Ofrecemos financiación hasta 12 meses sin intereses para tratamientos de más de 500 €.`;

const horarios = `# Horario de la clínica

## Horario habitual
De lunes a jueves de 9:00 a 20:00. Viernes de 9:00 a 15:00. Sábados cerrado salvo urgencias. Domingos cerrado.

## Verano
En agosto la clínica abre solo por las mañanas, de 9:00 a 14:00.`;

const ubicacion = `# Cómo llegar y contacto

## Dirección
La clínica está en la Calle Colón 25, 46004 Valencia, junto a la estación Xàtiva del metro y a una parada de la línea 5 de autobús.

## Aparcamiento
El parking público de la Plaza del Ayuntamiento queda a unos cinco minutos andando.

## Contacto
Teléfono: 960 123 456. WhatsApp: 600 123 456. Respondemos los mensajes de WhatsApp en horario de apertura.`;

const primeraVisita = `# Primera visita

En la primera visita hacemos una revisión completa, una radiografía si hace falta y un plan de tratamiento por escrito con presupuesto. La visita dura unos 40 minutos.

## Qué traer
Trae tu DNI y, si las tienes, radiografías anteriores. Si tomas medicación, apúntala en el formulario de salud que te damos al llegar.`;

const cancelaciones = `# Cancelaciones y cambios de cita

Puedes cancelar o cambiar tu cita sin coste hasta 24 horas antes. Si no avisas y no vienes, cobramos 20 € por la cita perdida a partir de la segunda vez.

Para cambiar una cita escribe por WhatsApp o llama por teléfono en horario de apertura.`;

const urgencias = `# Urgencias dentales

Atendemos las urgencias (dolor fuerte, un golpe o un diente roto) el mismo día si llamas antes de las 18:00. Fuera de horario, llama al 960 123 457 y te atenderá el dentista de guardia.

Las urgencias de los sábados se atienden solo con cita previa por teléfono.`;

const seguros = `# Seguros y mutuas

Trabajamos con Sanitas, Adeslas y DKV. No trabajamos con la sanidad pública ni con tarjeta sanitaria de la Seguridad Social.

Si tu seguro no está en la lista, te damos la factura y un informe para que solicites el reembolso a tu aseguradora.`;

const ortodoncia = `# Ortodoncia

Ofrecemos brackets metálicos, brackets estéticos de cerámica y alineadores transparentes. Antes de empezar hacemos un estudio previo de 90 minutos con fotografías y escáner.

El tratamiento dura entre 12 y 24 meses, con una revisión cada seis semanas. Los retenedores se entregan al terminar.`;

const privacidad = `# Protección de datos

Tus datos se tratan conforme al RGPD y a la LOPDGDD. El responsable es Clínica Dental Colón S. L. Conservamos tu historial clínico cinco años desde el último tratamiento.

Puedes ejercer tus derechos de acceso, rectificación y supresión escribiendo a privacidad@clinicacolon.example.`;

const ninos = `# Odontopediatría

Atendemos a niños desde los 3 años. La primera visita infantil es gratuita y dura unos 20 minutos.

La odontopediatra, la Dra. Ruiz, atiende los martes y los jueves por la tarde.`;

const blanqueamiento = `# Blanqueamiento dental

El blanqueamiento se hace en una sola sesión de 60 minutos en la clínica. Puede causar una sensibilidad leve durante 24 o 48 horas.

No se recomienda durante el embarazo ni en la lactancia. Antes de empezar hacemos una limpieza para un resultado más uniforme.`;

const implantes = `# Implantes dentales

Un implante con corona cuesta 1.450 €. Antes de colocarlo hacemos un estudio 3D que cuesta 60 € y que se descuenta del precio si sigues adelante con el tratamiento.

La cirugía se hace con anestesia local y la corona definitiva se coloca entre tres y cuatro meses después.`;

export const GOLDEN_ES: EvalSet = {
  name: 'clinica-dental-es',
  description: 'Base de conocimiento de una clínica dental ficticia, en español, con preguntas de todos los tipos.',
  corpus: [
    { id: 'precios', title: 'Tarifas', text: precios },
    { id: 'horarios', title: 'Horario de la clínica', text: horarios },
    { id: 'ubicacion', title: 'Cómo llegar y contacto', text: ubicacion },
    { id: 'primera', title: 'Primera visita', text: primeraVisita },
    { id: 'cancelaciones', title: 'Cancelaciones y cambios de cita', text: cancelaciones },
    { id: 'urgencias', title: 'Urgencias dentales', text: urgencias },
    { id: 'seguros', title: 'Seguros y mutuas', text: seguros },
    { id: 'ortodoncia', title: 'Ortodoncia', text: ortodoncia },
    { id: 'privacidad', title: 'Protección de datos', text: privacidad },
    { id: 'ninos', title: 'Odontopediatría', text: ninos },
    { id: 'blanqueamiento', title: 'Blanqueamiento dental', text: blanqueamiento },
    { id: 'implantes', title: 'Implantes dentales', text: implantes },
  ],
  cases: [
    // ---- factual
    { id: 'f01', type: 'factual', query: '¿Cuánto cuesta una limpieza dental?', relevant: [{ doc: 'precios', contains: 'La limpieza dental cuesta 45 €' }] },
    { id: 'f02', type: 'factual', query: '¿Cuál es el horario de la clínica?', relevant: [{ doc: 'horarios', contains: 'De lunes a jueves de 9:00 a 20:00' }] },
    { id: 'f03', type: 'factual', query: '¿Dónde está la clínica?', relevant: [{ doc: 'ubicacion', contains: 'Calle Colón 25' }] },
    { id: 'f04', type: 'factual', query: '¿Qué seguros aceptáis?', relevant: [{ doc: 'seguros', contains: 'Sanitas, Adeslas y DKV' }] },
    { id: 'f05', type: 'factual', query: '¿Cuánto dura la primera visita?', relevant: [{ doc: 'primera', contains: 'dura unos 40 minutos' }] },
    { id: 'f06', type: 'factual', query: '¿Atendéis urgencias?', relevant: [{ doc: 'urgencias', contains: 'el mismo día si llamas antes de las 18:00' }] },
    { id: 'f07', type: 'factual', query: '¿Cuánto cuesta un implante?', relevant: [{ doc: 'implantes', contains: 'Un implante con corona cuesta 1.450 €' }] },
    { id: 'f08', type: 'factual', query: '¿Hasta cuándo puedo cancelar una cita sin coste?', relevant: [{ doc: 'cancelaciones', contains: 'sin coste hasta 24 horas antes' }] },
    { id: 'f09', type: 'factual', query: '¿A partir de qué edad atendéis a niños?', relevant: [{ doc: 'ninos', contains: 'desde los 3 años' }] },
    { id: 'f10', type: 'factual', query: '¿Cuánto dura el tratamiento de ortodoncia?', relevant: [{ doc: 'ortodoncia', contains: 'entre 12 y 24 meses' }] },
    { id: 'f11', type: 'factual', query: '¿Cuál es el teléfono de la clínica?', relevant: [{ doc: 'ubicacion', contains: 'Teléfono: 960 123 456' }] },
    { id: 'f12', type: 'factual', query: '¿Tenéis WhatsApp?', relevant: [{ doc: 'ubicacion', contains: 'WhatsApp: 600 123 456' }] },

    // ---- paraphrase
    { id: 'p01', type: 'paraphrase', query: '¿Qué pasa si no puedo ir a mi cita y no aviso?', relevant: [{ doc: 'cancelaciones', contains: 'cobramos 20 €' }] },
    { id: 'p02', type: 'paraphrase', query: 'Me duele mucho una muela, ¿podéis verme hoy?', relevant: [{ doc: 'urgencias', contains: 'el mismo día si llamas antes de las 18:00' }] },
    { id: 'p03', type: 'paraphrase', query: '¿Puedo pagar un tratamiento a plazos?', relevant: [{ doc: 'precios', contains: 'financiación hasta 12 meses sin intereses' }] },
    { id: 'p04', type: 'paraphrase', query: '¿Qué tengo que llevar a la primera cita?', relevant: [{ doc: 'primera', contains: 'Trae tu DNI' }] },
    { id: 'p05', type: 'paraphrase', query: '¿Cómo puedo pedir que borréis mis datos?', relevant: [{ doc: 'privacidad', contains: 'privacidad@clinicacolon.example' }] },
    { id: 'p06', type: 'paraphrase', query: '¿Cómo llego a la clínica en transporte público?', relevant: [{ doc: 'ubicacion', contains: 'estación Xàtiva del metro' }] },

    // ---- synonym
    { id: 's01', type: 'synonym', query: '¿Cuánto cuesta tapar una caries?', relevant: [{ doc: 'precios', contains: 'Una obturación (empaste) cuesta 60 €' }] },
    { id: 's02', type: 'synonym', query: '¿Ponéis aparatos para los dientes torcidos?', relevant: [{ doc: 'ortodoncia', contains: 'brackets metálicos' }] },
    { id: 's03', type: 'synonym', query: '¿Podéis aclarar el color de mis dientes?', relevant: [{ doc: 'blanqueamiento', contains: 'una sola sesión de 60 minutos' }] },
    { id: 's04', type: 'synonym', query: '¿Aceptáis la tarjeta sanitaria?', relevant: [{ doc: 'seguros', contains: 'No trabajamos con la sanidad pública' }] },
    { id: 's05', type: 'synonym', query: '¿Abrís los fines de semana?', relevant: [{ doc: 'horarios', contains: 'Sábados cerrado salvo urgencias' }] },

    // ---- typo
    { id: 't01', type: 'typo', query: 'cuanto cuesta la limpiesa dental', relevant: [{ doc: 'precios', contains: 'La limpieza dental cuesta 45 €' }] },
    { id: 't02', type: 'typo', query: 'horairo de agosto?', relevant: [{ doc: 'horarios', contains: 'En agosto la clínica abre solo por las mañanas' }] },
    { id: 't03', type: 'typo', query: 'ortodoncia invisibe precio', relevant: [{ doc: 'precios', contains: 'La ortodoncia invisible cuesta desde 2.400 €' }] },

    // ---- numeric
    { id: 'n01', type: 'numeric', query: '¿Cuánto cuesta el blanqueamiento?', relevant: [{ doc: 'precios', contains: 'El blanqueamiento dental cuesta 280 €' }] },
    { id: 'n02', type: 'numeric', query: '¿Cuánto cuesta una radiografía panorámica?', relevant: [{ doc: 'precios', contains: 'Una radiografía panorámica cuesta 30 €' }] },
    { id: 'n03', type: 'numeric', query: '¿Cuánto cuesta el estudio 3D antes de un implante?', relevant: [{ doc: 'implantes', contains: 'un estudio 3D que cuesta 60 €' }] },
    { id: 'n04', type: 'numeric', query: '¿A qué hora cerráis los viernes?', relevant: [{ doc: 'horarios', contains: 'Viernes de 9:00 a 15:00' }] },

    // ---- multi
    {
      id: 'm01',
      type: 'multi',
      query: 'Quiero un blanqueamiento y una limpieza: ¿cuánto cuestan y cuánto tiempo lleva el blanqueamiento?',
      relevant: [
        { doc: 'precios', contains: 'El blanqueamiento dental cuesta 280 €' },
        { doc: 'blanqueamiento', contains: 'una sola sesión de 60 minutos' },
      ],
    },
    {
      id: 'm02',
      type: 'multi',
      query: 'Tengo seguro de Adeslas y quiero ortodoncia: ¿me lo cubren y cuánto dura?',
      relevant: [
        { doc: 'seguros', contains: 'Sanitas, Adeslas y DKV' },
        { doc: 'ortodoncia', contains: 'entre 12 y 24 meses' },
      ],
    },

    // ---- followup
    {
      id: 'fu01',
      type: 'followup',
      query: '¿Y hay que hacer alguna prueba antes?',
      history: [
        { role: 'user', content: '¿Cuánto cuesta un implante?' },
        { role: 'assistant', content: 'Un implante con corona cuesta 1.450 €.' },
      ],
      relevant: [{ doc: 'implantes', contains: 'un estudio 3D que cuesta 60 €' }],
    },
    {
      id: 'fu02',
      type: 'followup',
      query: '¿Y qué días atiende?',
      history: [
        { role: 'user', content: '¿Tenéis odontopediatra para mi hijo?' },
        { role: 'assistant', content: 'Sí, atendemos a niños desde los 3 años con la Dra. Ruiz.' },
      ],
      relevant: [{ doc: 'ninos', contains: 'los martes y los jueves por la tarde' }],
    },

    // ---- overview
    { id: 'o01', type: 'overview', query: '¿Qué tratamientos ofrecéis y a qué precio?', relevant: [{ doc: 'precios' }] },
    { id: 'o02', type: 'overview', query: 'Cuéntame cómo es la primera visita y qué incluye', relevant: [{ doc: 'primera' }] },

    // ---- unanswerable
    { id: 'u01', type: 'unanswerable', query: '¿Hacéis cirugía con sedación general?', relevant: [] },
    { id: 'u02', type: 'unanswerable', query: '¿Cuánto cuesta una endodoncia?', relevant: [] },
    { id: 'u03', type: 'unanswerable', query: '¿Cuántos dentistas trabajan en la clínica?', relevant: [] },
    { id: 'u04', type: 'unanswerable', query: '¿Aceptáis pagos con criptomonedas?', relevant: [] },
    { id: 'u05', type: 'unanswerable', query: '¿Cuál es el CIF de la clínica?', relevant: [] },
    { id: 'u06', type: 'unanswerable', query: '¿Tenéis otra clínica en Madrid?', relevant: [] },
    { id: 'u07', type: 'unanswerable', query: '¿Ponéis ortodoncia a niños de 8 años?', relevant: [] },

    // ---- añadidas el 2026-11-03 para que las comparaciones sean menos ruidosas
    { id: 'f13', type: 'factual', query: '¿Tengo que rellenar algún formulario de salud?', relevant: [{ doc: 'primera', contains: 'apúntala en el formulario de salud' }] },
    { id: 'f14', type: 'factual', query: '¿Cuánto cuesta la primera visita de un niño?', relevant: [{ doc: 'ninos', contains: 'La primera visita infantil es gratuita' }] },
    { id: 'f15', type: 'factual', query: '¿Quién es el responsable del tratamiento de mis datos?', relevant: [{ doc: 'privacidad', contains: 'El responsable es Clínica Dental Colón S. L.' }] },
    { id: 'f16', type: 'factual', query: '¿Cuánto tiempo guardáis mi historial clínico?', relevant: [{ doc: 'privacidad', contains: 'cinco años desde el último tratamiento' }] },
    { id: 'f17', type: 'factual', query: '¿Cada cuánto hay revisiones durante la ortodoncia?', relevant: [{ doc: 'ortodoncia', contains: 'una revisión cada seis semanas' }] },
    { id: 'f18', type: 'factual', query: '¿A qué número llamo en una urgencia fuera de horario?', relevant: [{ doc: 'urgencias', contains: 'llama al 960 123 457' }] },
    { id: 'f19', type: 'factual', query: '¿Cuánto cuesta un empaste?', relevant: [{ doc: 'precios', contains: 'Una obturación (empaste) cuesta 60 € por pieza' }] },
    { id: 'f20', type: 'factual', query: '¿Respondéis a los mensajes de WhatsApp por la noche?', relevant: [{ doc: 'ubicacion', contains: 'Respondemos los mensajes de WhatsApp en horario de apertura' }] },
    { id: 'p07', type: 'paraphrase', query: 'Mi aseguradora no está en vuestra lista, ¿puedo pedir que me devuelvan el dinero?', relevant: [{ doc: 'seguros', contains: 'te damos la factura y un informe' }] },
    { id: 'p08', type: 'paraphrase', query: '¿Hay sitio para dejar el coche cerca de la clínica?', relevant: [{ doc: 'ubicacion', contains: 'parking público de la Plaza del Ayuntamiento' }] },
    { id: 'p09', type: 'paraphrase', query: '¿Se pasa mal después del blanqueamiento?', relevant: [{ doc: 'blanqueamiento', contains: 'sensibilidad leve durante 24 o 48 horas' }] },
    { id: 'p10', type: 'paraphrase', query: 'Estoy embarazada, ¿me puedo aclarar los dientes?', relevant: [{ doc: 'blanqueamiento', contains: 'No se recomienda durante el embarazo' }] },
    { id: 'p11', type: 'paraphrase', query: '¿Me dormís para poner un implante?', relevant: [{ doc: 'implantes', contains: 'anestesia local' }] },
    { id: 'p12', type: 'paraphrase', query: '¿Cuánto hay que esperar para que me pongan la corona definitiva?', relevant: [{ doc: 'implantes', contains: 'entre tres y cuatro meses después' }] },
    { id: 's06', type: 'synonym', query: '¿Con qué compañías médicas tenéis convenio?', relevant: [{ doc: 'seguros', contains: 'Sanitas, Adeslas y DKV' }] },
    { id: 's07', type: 'synonym', query: '¿Os puedo mandar un mensaje para mover mi cita?', relevant: [{ doc: 'cancelaciones', contains: 'escribe por WhatsApp' }] },
    { id: 's08', type: 'synonym', query: '¿Me dan algo para mantener los dientes rectos cuando termine?', relevant: [{ doc: 'ortodoncia', contains: 'Los retenedores se entregan al terminar' }] },
    { id: 's09', type: 'synonym', query: '¿De qué formas puedo abonar el tratamiento?', relevant: [{ doc: 'precios', contains: 'Aceptamos tarjeta, transferencia y efectivo' }] },
    { id: 't04', type: 'typo', query: 'implnate dental precio', relevant: [{ doc: 'implantes', contains: 'Un implante con corona cuesta 1.450 €' }] },
    { id: 't05', type: 'typo', query: 'urgencia dental fuera de horairo', relevant: [{ doc: 'urgencias', contains: 'Fuera de horario' }] },
    { id: 'n05', type: 'numeric', query: '¿A cuántos meses se puede financiar un tratamiento?', relevant: [{ doc: 'precios', contains: 'financiación hasta 12 meses' }] },
    { id: 'n06', type: 'numeric', query: '¿Desde qué importe se puede financiar?', relevant: [{ doc: 'precios', contains: 'más de 500 €' }] },
    {
      id: 'm03',
      type: 'multi',
      query: 'Tengo Sanitas y me ha dolido una muela el sábado: ¿qué hago?',
      relevant: [
        { doc: 'seguros', contains: 'Sanitas, Adeslas y DKV' },
        { doc: 'urgencias', contains: 'Las urgencias de los sábados se atienden solo con cita previa' },
      ],
    },
    {
      id: 'm04',
      type: 'multi',
      query: '¿Cuánto cuesta la primera visita y cuánto dura?',
      relevant: [
        { doc: 'precios', contains: 'La primera revisión es gratuita' },
        { doc: 'primera', contains: 'dura unos 40 minutos' },
      ],
    },
    {
      id: 'fu03',
      type: 'followup',
      query: '¿Y duele?',
      history: [
        { role: 'user', content: '¿Cuánto cuesta el blanqueamiento?' },
        { role: 'assistant', content: 'El blanqueamiento dental cuesta 280 €.' },
      ],
      relevant: [{ doc: 'blanqueamiento', contains: 'sensibilidad leve durante 24 o 48 horas' }],
    },
    {
      id: 'fu04',
      type: 'followup',
      query: '¿Y cada cuánto tengo que ir a revisión?',
      history: [
        { role: 'user', content: 'Quiero ponerme ortodoncia invisible' },
        { role: 'assistant', content: 'Ofrecemos alineadores transparentes con un estudio previo de 90 minutos.' },
      ],
      relevant: [{ doc: 'ortodoncia', contains: 'una revisión cada seis semanas' }],
    },
    { id: 'u08', type: 'unanswerable', query: '¿Qué marca de implantes utilizáis?', relevant: [] },
    { id: 'u09', type: 'unanswerable', query: '¿Ofrecéis sedación para niños con mucho miedo?', relevant: [] },
    { id: 'u10', type: 'unanswerable', query: '¿Cuánto cuesta una corona de porcelana sobre un diente natural?', relevant: [] },
    { id: 'u11', type: 'unanswerable', query: '¿Hacéis extracciones de muelas del juicio?', relevant: [] },
    { id: 'u12', type: 'unanswerable', query: '¿Se puede pagar con Bizum?', relevant: [] },
    { id: 'u13', type: 'unanswerable', query: '¿Tenéis descuento para estudiantes?', relevant: [] },
    { id: 'u14', type: 'unanswerable', query: '¿Cuánto cuesta una prótesis dental completa?', relevant: [] },
    { id: 'u15', type: 'unanswerable', query: '¿Hay ascensor para llegar a la clínica?', relevant: [] },
  ],
};
