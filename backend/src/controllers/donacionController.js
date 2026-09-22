const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');

const ESTADOS_VALIDOS = ['Disponible', 'Reservada', 'Entregada', 'Expirada'];
const ROL_ADMIN = 1;

// Mapeo entre las cadenas del Frontend y los enteros de la Base de Datos
const ESTADOS_MAP = {
  'Disponible': 1,
  'Reservada': 2,
  'Entregada': 3,
  'Expirada': 4
};

// Mapeo inverso para devolver texto al Frontend en la serialización
const ESTADOS_REVERSO = {
  1: 'Disponible',
  2: 'Reservada',
  3: 'Entregada',
  4: 'Expirada'
};

const SELECT_BASE = `
  SELECT
    d.id_donacion,
    d.titulo,
    d.descripcion,
    d.cantidad,
    d.fecha_publicacion,
    d.fecha_vencimiento,
    d.estado,
    d.imagen,
    d.oculta,
    d.id_usuario,
    c.nombre AS categoria_nombre,
    u.direccion,
    u.latitud,
    u.longitud
  FROM donacion d
  JOIN categoria c ON c.id_categoria = d.id_categoria
  JOIN ubicacion u ON u.id_ubicacion = d.id_ubicacion
`;

function serializarDonacion(fila) {
  return {
    id: String(fila.id_donacion),
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    categoria: fila.categoria_nombre,
    cantidad: Number(fila.cantidad),
    // Convierte el entero de MySQL al string que espera Angular
    estado: ESTADOS_REVERSO[fila.estado] || fila.estado,
    oculta: Boolean(fila.oculta),
    ubicacion: fila.direccion,
    latitud: fila.latitud !== null ? Number(fila.latitud) : null,
    longitud: fila.longitud !== null ? Number(fila.longitud) : null,
    fechaCreacion: fila.fecha_publicacion,
    fechaExpiracion: fila.fecha_vencimiento,
    idUsuario: fila.id_usuario
  };
}

function validarDatos({ titulo, descripcion, categoria, cantidad, ubicacion, fechaExpiracion, estado }) {
  if (!titulo || !String(titulo).trim()) {
    throw new ApiError(400, 'El título es obligatorio.');
  }
  if (!descripcion || !String(descripcion).trim()) {
    throw new ApiError(400, 'La descripción es obligatoria.');
  }
  if (!categoria || !String(categoria).trim()) {
    throw new ApiError(400, 'La categoría es obligatoria.');
  }
  if (cantidad === undefined || cantidad === null || Number(cantidad) < 1) {
    throw new ApiError(400, 'La cantidad debe ser al menos 1.');
  }
  if (!ubicacion || !String(ubicacion).trim()) {
    throw new ApiError(400, 'La ubicación es obligatoria.');
  }
  if (!fechaExpiracion) {
    throw new ApiError(400, 'La fecha de expiración es obligatoria.');
  }
  if (estado && !ESTADOS_VALIDOS.includes(estado)) {
    throw new ApiError(400, 'El estado indicado no es válido.');
  }
}

async function obtenerOcrearCategoria(conexion, nombreCategoria) {
  const nombre = String(nombreCategoria).trim();

  const [filas] = await conexion.query(
    'SELECT id_categoria FROM categoria WHERE nombre = ? LIMIT 1',
    [nombre]
  );

  if (filas.length > 0) {
    return filas[0].id_categoria;
  }

  const [resultado] = await conexion.query(
    'INSERT INTO categoria (nombre, descripcion) VALUES (?, ?)',
    [nombre, `Categoría ${nombre}`]
  );

  return resultado.insertId;
}

async function listar(req, res, next) {
  try {
 
    const [filas] = await pool.query(
      `${SELECT_BASE} WHERE d.oculta = FALSE ORDER BY d.fecha_publicacion DESC`
    );
    res.status(200).json(filas.map(serializarDonacion));
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const { id } = req.params;
    const [filas] = await pool.query(`${SELECT_BASE} WHERE d.id_donacion = ? LIMIT 1`, [id]);

    if (filas.length === 0) {
      throw new ApiError(404, 'La donación indicada no existe.');
    }

    res.status(200).json(serializarDonacion(filas[0]));
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  const conexion = await pool.getConnection();

  try {
    const {
      titulo,
      descripcion,
      categoria,
      cantidad,
      ubicacion,
      fechaExpiracion,
      estado,
      latitud,
      longitud,
      imagen
    } = req.body;

    validarDatos({ titulo, descripcion, categoria, cantidad, ubicacion, fechaExpiracion, estado });

    if (!req.usuario || !req.usuario.id_usuario) {
      throw new ApiError(401, 'No autenticado.');
    }

    await conexion.beginTransaction();

    const [resultadoUbicacion] = await conexion.query(
      `INSERT INTO ubicacion (departamento, municipio, direccion, latitud, longitud)
       VALUES (?, ?, ?, ?, ?)`,
      [
        'No especificado',
        'No especificado',
        String(ubicacion).trim(),
        latitud ?? null,
        longitud ?? null
      ]
    );

    const idCategoria = await obtenerOcrearCategoria(conexion, categoria);

    // Convertir el estado en texto a su número entero correspondiente (por defecto 1 = Disponible)
    const estadoTexto = estado || 'Disponible';
    const estadoNumerico = ESTADOS_MAP[estadoTexto] || 1;

    const [resultadoDonacion] = await conexion.query(
      `INSERT INTO donacion
        (titulo, descripcion, cantidad, fecha_vencimiento, estado, imagen, id_usuario, id_ubicacion, id_categoria)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(titulo).trim(),
        String(descripcion).trim(),
        Number(cantidad),
        fechaExpiracion,
        estadoNumerico,
        imagen ?? null,
        req.usuario.id_usuario,
        resultadoUbicacion.insertId,
        idCategoria
      ]
    );

    await conexion.commit();

    const [filas] = await pool.query(`${SELECT_BASE} WHERE d.id_donacion = ? LIMIT 1`, [
      resultadoDonacion.insertId
    ]);

    res.status(201).json(serializarDonacion(filas[0]));
  } catch (error) {
    await conexion.rollback();
    next(error);
  } finally {
    conexion.release();
  }
}

async function actualizar(req, res, next) {
  const conexion = await pool.getConnection();

  try {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      categoria,
      cantidad,
      ubicacion,
      fechaExpiracion,
      estado,
      latitud,
      longitud
    } = req.body;

    const [existentes] = await conexion.query(
      'SELECT id_donacion, id_ubicacion FROM donacion WHERE id_donacion = ? LIMIT 1',
      [id]
    );

    if (existentes.length === 0) {
      throw new ApiError(404, 'La donación indicada no existe.');
    }

    if (estado && !ESTADOS_VALIDOS.includes(estado)) {
      throw new ApiError(400, 'El estado indicado no es válido.');
    }

    await conexion.beginTransaction();

    if (ubicacion !== undefined || latitud !== undefined || longitud !== undefined) {
      const campos = [];
      const valores = [];

      if (ubicacion !== undefined) {
        campos.push('direccion = ?');
        valores.push(String(ubicacion).trim());
      }
      if (latitud !== undefined) {
        campos.push('latitud = ?');
        valores.push(latitud);
      }
      if (longitud !== undefined) {
        campos.push('longitud = ?');
        valores.push(longitud);
      }

      valores.push(existentes[0].id_ubicacion);

      await conexion.query(`UPDATE ubicacion SET ${campos.join(', ')} WHERE id_ubicacion = ?`, valores);
    }

    const camposDonacion = [];
    const valoresDonacion = [];

    if (titulo !== undefined) {
      camposDonacion.push('titulo = ?');
      valoresDonacion.push(String(titulo).trim());
    }
    if (descripcion !== undefined) {
      camposDonacion.push('descripcion = ?');
      valoresDonacion.push(String(descripcion).trim());
    }
    if (cantidad !== undefined) {
      camposDonacion.push('cantidad = ?');
      valoresDonacion.push(Number(cantidad));
    }
    if (fechaExpiracion !== undefined) {
      camposDonacion.push('fecha_vencimiento = ?');
      valoresDonacion.push(fechaExpiracion);
    }
    if (estado !== undefined) {
      camposDonacion.push('estado = ?');
      valoresDonacion.push(ESTADOS_MAP[estado] || 1);
    }
    if (categoria !== undefined) {
      const idCategoria = await obtenerOcrearCategoria(conexion, categoria);
      camposDonacion.push('id_categoria = ?');
      valoresDonacion.push(idCategoria);
    }

    if (camposDonacion.length > 0) {
      valoresDonacion.push(id);
      await conexion.query(
        `UPDATE donacion SET ${camposDonacion.join(', ')} WHERE id_donacion = ?`,
        valoresDonacion
      );
    }

    await conexion.commit();

    const [filas] = await pool.query(`${SELECT_BASE} WHERE d.id_donacion = ? LIMIT 1`, [id]);
    res.status(200).json(serializarDonacion(filas[0]));
  } catch (error) {
    await conexion.rollback();
    next(error);
  } finally {
    conexion.release();
  }
}

async function cambiarVisibilidad(req, res, next) {
  try {
    const { id } = req.params;
    const { oculta } = req.body;

    if (typeof oculta !== 'boolean') {
      throw new ApiError(400, 'El campo "oculta" es obligatorio y debe ser verdadero o falso.');
    }

    const [resultado] = await pool.query(
      'UPDATE donacion SET oculta = ? WHERE id_donacion = ?',
      [oculta, id]
    );

    if (resultado.affectedRows === 0) {
      throw new ApiError(404, 'La donación indicada no existe.');
    }

    const [filas] = await pool.query(`${SELECT_BASE} WHERE d.id_donacion = ? LIMIT 1`, [id]);
    res.status(200).json(serializarDonacion(filas[0]));
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query('DELETE FROM donacion WHERE id_donacion = ?', [id]);

    if (resultado.affectedRows === 0) {
      throw new ApiError(404, 'La donación indicada no existe.');
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, cambiarVisibilidad, eliminar };