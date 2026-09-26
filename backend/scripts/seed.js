/**
 * Uso:
 *   npm run db:seed            Siembra solo si la tabla `usuario` está vacía
 *   npm run db:seed -- --force Borra los datos (usuario, donacion, solicitud,
 *                              entrega, chat, mensaje, notificacion, reporte,
 *                              calificacion, ubicacion, categoria) y siembra
 *                              de nuevo. NO toca la tabla `rol`.
 *
 * Requiere que ya se hayan ejecutado `npm run db:init` y `npm run db:migrate`.
 */
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const forzar = process.argv.includes('--force');

const ROLES = { ADMIN: 1, MODERADOR: 2, BENEFICIARIO: 3, DONADOR: 4 };
const CONTRASENA_DEMO = 'Demo1234'; // Cumple la regla de authController (mínimo 8 caracteres)

// Tablas hijas -> padres, en el orden correcto para poder truncarlas con --force
// sin violar foreign keys. No incluye `rol` (no se toca) ni `schema_migrations`.
const TABLAS_EN_ORDEN_DE_BORRADO = [
  'calificacion',
  'mensaje',
  'chat',
  'entrega',
  'reporte',
  'notificacion',
  'solicitud',
  'donacion',
  'ubicacion',
  'categoria',
  'usuario'
];

async function conectar() {
  return mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    multipleStatements: false
  });
}

async function yaHayDatos(conexion) {
  const [[fila]] = await conexion.query('SELECT COUNT(*) AS total FROM usuario');
  return fila.total > 0;
}

async function limpiar(conexion) {
  await conexion.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const tabla of TABLAS_EN_ORDEN_DE_BORRADO) {
    await conexion.query(`TRUNCATE TABLE ${tabla}`);
  }
  await conexion.query('SET FOREIGN_KEY_CHECKS = 1');
}

async function crearUsuario(conexion, { username, correo, telefono, id_rol }) {
  const hash = await bcrypt.hash(CONTRASENA_DEMO, 10);
  const [resultado] = await conexion.query(
    `INSERT INTO usuario (username, correo, telefono, contrasena, id_rol)
     VALUES (?, ?, ?, ?, ?)`,
    [username, correo, telefono, hash, id_rol]
  );
  return resultado.insertId;
}

async function crearCategoria(conexion, nombre, descripcion) {
  const [resultado] = await conexion.query(
    'INSERT INTO categoria (nombre, descripcion) VALUES (?, ?)',
    [nombre, descripcion]
  );
  return resultado.insertId;
}

async function crearUbicacion(conexion, ubicacion) {
  const [resultado] = await conexion.query(
    `INSERT INTO ubicacion (departamento, municipio, direccion, latitud, longitud, referencia)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      ubicacion.departamento,
      ubicacion.municipio,
      ubicacion.direccion,
      ubicacion.latitud,
      ubicacion.longitud,
      ubicacion.referencia ?? null
    ]
  );
  return resultado.insertId;
}

async function crearDonacion(conexion, donacion) {
  const [resultado] = await conexion.query(
    `INSERT INTO donacion
      (titulo, descripcion, cantidad, fecha_vencimiento, estado, id_usuario, id_ubicacion, id_categoria)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      donacion.titulo,
      donacion.descripcion,
      donacion.cantidad,
      donacion.fecha_vencimiento,
      donacion.estado,
      donacion.id_usuario,
      donacion.id_ubicacion,
      donacion.id_categoria
    ]
  );
  return resultado.insertId;
}

async function crearSolicitud(conexion, solicitud) {
  const [resultado] = await conexion.query(
    `INSERT INTO solicitud (id_donacion, id_usuario, estado, cantidad_solicitada, comentario)
     VALUES (?, ?, ?, ?, ?)`,
    [
      solicitud.id_donacion,
      solicitud.id_usuario,
      solicitud.estado,
      solicitud.cantidad_solicitada,
      solicitud.comentario ?? null
    ]
  );
  return resultado.insertId;
}

async function crearNotificacion(conexion, { titulo, mensaje, id_usuario, leida = false }) {
  await conexion.query(
    'INSERT INTO notificacion (titulo, mensaje, id_usuario, leida) VALUES (?, ?, ?, ?)',
    [titulo, mensaje, id_usuario, leida]
  );
}

async function sembrar() {
  const conexion = await conectar();

  try {
    if (await yaHayDatos(conexion)) {
      if (!forzar) {
        console.log('Ya existen usuarios en la base de datos. No se modificó nada.');
        console.log('Para borrar los datos de demostración/prueba y volver a sembrar: npm run db:seed -- --force');
        return;
      }
      console.log('Borrando datos existentes (usuario, donacion, solicitud, entrega, chat, mensaje, notificacion, reporte, calificacion, ubicacion, categoria)...');
      await limpiar(conexion);
    }

    console.log('Creando usuarios de demostración...');
    const idAdmin = await crearUsuario(conexion, {
      username: 'Admin FoodMap',
      correo: 'admin@foodmap.test',
      telefono: '50211001',
      id_rol: ROLES.ADMIN
    });
    const idModerador = await crearUsuario(conexion, {
      username: 'Moderador FoodMap',
      correo: 'moderador@foodmap.test',
      telefono: '50211002',
      id_rol: ROLES.MODERADOR
    });
    const idDonador1 = await crearUsuario(conexion, {
      username: 'Panadería Don Luis',
      correo: 'donador1@foodmap.test',
      telefono: '50211003',
      id_rol: ROLES.DONADOR
    });
    const idDonador2 = await crearUsuario(conexion, {
      username: 'Restaurante La Fonda',
      correo: 'donador2@foodmap.test',
      telefono: '50211004',
      id_rol: ROLES.DONADOR
    });
    const idBeneficiario1 = await crearUsuario(conexion, {
      username: 'Ana Ruiz',
      correo: 'beneficiario1@foodmap.test',
      telefono: '50211005',
      id_rol: ROLES.BENEFICIARIO
    });
    const idBeneficiario2 = await crearUsuario(conexion, {
      username: 'Banco de Alimentos GT',
      correo: 'beneficiario2@foodmap.test',
      telefono: '50211006',
      id_rol: ROLES.BENEFICIARIO
    });

    console.log('Creando categorías...');
    const catPan = await crearCategoria(conexion, 'Panadería', 'Pan, repostería y productos horneados');
    const catComida = await crearCategoria(conexion, 'Comida preparada', 'Platillos listos para consumir');
    const catFrutas = await crearCategoria(conexion, 'Frutas y verduras', 'Productos frescos');

    console.log('Creando ubicaciones...');
    const ubZona1 = await crearUbicacion(conexion, {
      departamento: 'Guatemala',
      municipio: 'Guatemala',
      direccion: '5a Avenida, Zona 1',
      latitud: 14.6431,
      longitud: -90.5133,
      referencia: 'Frente al Parque Central'
    });
    const ubZona10 = await crearUbicacion(conexion, {
      departamento: 'Guatemala',
      municipio: 'Guatemala',
      direccion: '12 Calle, Zona 10',
      latitud: 14.5958,
      longitud: -90.5083,
      referencia: 'Cerca del Obelisco'
    });
    const ubVillaNueva = await crearUbicacion(conexion, {
      departamento: 'Guatemala',
      municipio: 'Villa Nueva',
      direccion: 'Colonia El Frutal',
      latitud: 14.5266,
      longitud: -90.5877,
      referencia: null
    });

    console.log('Creando donaciones...');
    const manana = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    // Disponible (sin solicitudes todavía) — usada para probar el CRUD de donaciones/solicitudes.
    const donDisponible1 = await crearDonacion(conexion, {
      titulo: 'Pan del día',
      descripcion: '8 kg de pan variado sobrante del día.',
      cantidad: 8,
      fecha_vencimiento: manana,
      estado: 'Disponible',
      id_usuario: idDonador1,
      id_ubicacion: ubZona1,
      id_categoria: catPan
    });

    // Disponible (segunda, de otro donador) — para probar filtros/listado.
    const donDisponible2 = await crearDonacion(conexion, {
      titulo: 'Almuerzos del día',
      descripcion: '10 porciones de almuerzo preparado.',
      cantidad: 10,
      fecha_vencimiento: manana,
      estado: 'Disponible',
      id_usuario: idDonador2,
      id_ubicacion: ubZona10,
      id_categoria: catComida
    });

    // Reservada (tiene una solicitud ACEPTADA que consumió todo lo disponible).
    const donReservada = await crearDonacion(conexion, {
      titulo: 'Repostería variada',
      descripcion: '6 kg de repostería sobrante.',
      cantidad: 6,
      fecha_vencimiento: manana,
      estado: 'Reservada',
      id_usuario: idDonador1,
      id_ubicacion: ubZona1,
      id_categoria: catPan
    });

    // Entregada (flujo completo: solicitud aceptada -> entrega confirmada -> calificación).
    const donEntregada = await crearDonacion(conexion, {
      titulo: 'Frutas y verduras frescas',
      descripcion: '12 kg de frutas y verduras en buen estado.',
      cantidad: 12,
      fecha_vencimiento: manana,
      estado: 'Entregada',
      id_usuario: idDonador2,
      id_ubicacion: ubVillaNueva,
      id_categoria: catFrutas
    });

    console.log('Creando solicitudes en distintos estados...');

    // 1) PENDIENTE: esperando respuesta del donador (sobre la primera disponible).
    await crearSolicitud(conexion, {
      id_donacion: donDisponible1,
      id_usuario: idBeneficiario1,
      estado: 'PENDIENTE',
      cantidad_solicitada: 3,
      comentario: 'Podemos recogerlo hoy en la tarde.'
    });

    // 2) RECHAZADA (sobre la segunda disponible).
    const idSolicitudRechazada = await crearSolicitud(conexion, {
      id_donacion: donDisponible2,
      id_usuario: idBeneficiario2,
      estado: 'RECHAZADA',
      cantidad_solicitada: 4,
      comentario: 'Necesitamos para el comedor comunitario.'
    });
    await crearNotificacion(conexion, {
      titulo: 'Solicitud rechazada',
      mensaje: 'Restaurante La Fonda rechazó tu solicitud de "Almuerzos del día".',
      id_usuario: idBeneficiario2
    });

    // 3) ACEPTADA (sobre la reservada): crea chat + entrega PENDIENTE, igual que
    //    hace solicitudes.controller.js -> aceptar().
    const idSolicitudAceptada = await crearSolicitud(conexion, {
      id_donacion: donReservada,
      id_usuario: idBeneficiario1,
      estado: 'ACEPTADA',
      cantidad_solicitada: 6,
      comentario: 'Confirmamos la recogida.'
    });
    const [chatAceptada] = await conexion.query(
      'INSERT INTO chat (id_solicitud) VALUES (?)', [idSolicitudAceptada]
    );
    await conexion.query(
      "INSERT INTO entrega (estado, id_solicitud) VALUES ('PENDIENTE', ?)",
      [idSolicitudAceptada]
    );
    await conexion.query(
      'INSERT INTO mensaje (contenido, id_chat, id_usuario) VALUES (?, ?, ?)',
      ['Hola, ¿a qué hora podemos pasar por la donación?', chatAceptada.insertId, idBeneficiario1]
    );
    await conexion.query(
      'INSERT INTO mensaje (contenido, id_chat, id_usuario) VALUES (?, ?, ?)',
      ['Después de las 3pm, aquí los espero.', chatAceptada.insertId, idDonador1]
    );
    await crearNotificacion(conexion, {
      titulo: 'Solicitud aceptada',
      mensaje: 'Panadería Don Luis aceptó tu solicitud de "Repostería variada". Ya pueden coordinar por el chat.',
      id_usuario: idBeneficiario1
    });

    // 4) ACEPTADA -> ENTREGADA (sobre la donación "Entregada"): flujo completo,
    //    igual que solicitudes.controller.js -> aceptar() + confirmarRecepcion().
    const idSolicitudEntregada = await crearSolicitud(conexion, {
      id_donacion: donEntregada,
      id_usuario: idBeneficiario2,
      estado: 'ACEPTADA',
      cantidad_solicitada: 12,
      comentario: 'Gracias por la donación.'
    });
    await conexion.query('INSERT INTO chat (id_solicitud) VALUES (?)', [idSolicitudEntregada]);
    const [entregaResultado] = await conexion.query(
      `INSERT INTO entrega (estado, fecha_entrega, hora_entrega, observaciones, id_solicitud)
       VALUES ('ENTREGADA', CURDATE(), CURTIME(), 'Entrega recibida en buen estado.', ?)`,
      [idSolicitudEntregada]
    );
    await crearNotificacion(conexion, {
      titulo: 'Entrega confirmada',
      mensaje: 'Banco de Alimentos GT confirmó la recepción de "Frutas y verduras frescas".',
      id_usuario: idDonador2,
      leida: true
    });

    console.log('Creando calificación de ejemplo...');
    await conexion.query(
      `INSERT INTO calificacion (puntuacion, comentario, id_usuario, id_entrega)
       VALUES (?, ?, ?, ?)`,
      [5, 'Excelente calidad y muy puntuales con la entrega.', idBeneficiario2, entregaResultado.insertId]
    );

    console.log('Creando reporte de ejemplo...');
    await conexion.query(
      `INSERT INTO reporte (motivo, descripcion, id_usuario, id_donacion)
       VALUES (?, ?, ?, ?)`,
      ['Información incompleta', 'La donación no especifica bien la fecha de vencimiento.', idBeneficiario1, donDisponible2]
    );

    console.log('Creando notificaciones adicionales (no leídas) para el dashboard...');
    await crearNotificacion(conexion, {
      titulo: 'Bienvenido a FoodMap',
      mensaje: 'Completa tu perfil para empezar a donar o solicitar alimentos.',
      id_usuario: idBeneficiario1
    });
    await crearNotificacion(conexion, {
      titulo: 'Nueva solicitud',
      mensaje: 'Ana Ruiz solicitó 3 de "Pan del día".',
      id_usuario: idDonador1
    });

    console.log('\nListo. Usuarios de demostración creados (misma contraseña para todos):');
    console.log(`  Contraseña: ${CONTRASENA_DEMO}`);
    console.log('  admin@foodmap.test          (ADMIN)');
    console.log('  moderador@foodmap.test      (MODERADOR)');
    console.log('  donador1@foodmap.test       (DONADOR - Panadería Don Luis)');
    console.log('  donador2@foodmap.test       (DONADOR - Restaurante La Fonda)');
    console.log('  beneficiario1@foodmap.test  (BENEFICIARIO - Ana Ruiz)');
    console.log('  beneficiario2@foodmap.test  (BENEFICIARIO - Banco de Alimentos GT)');
  } finally {
    await conexion.end();
  }
}

sembrar().catch((error) => {
  console.error('No se pudo sembrar la base de datos:', error.message);
  process.exit(1);
});
