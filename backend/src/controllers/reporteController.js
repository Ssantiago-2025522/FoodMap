const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');

const ESTADOS_VALIDOS = ['PENDIENTE', 'EN_REVISION', 'RESUELTO'];

async function listar(req, res, next) {
  try {
    const [filas] = await pool.query('SELECT * FROM reporte ORDER BY fecha DESC');
    res.status(200).json(filas);
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const { id } = req.params;
    const [filas] = await pool.query('SELECT * FROM reporte WHERE id_reporte = ? LIMIT 1', [id]);

    if (filas.length === 0) {
      throw new ApiError(404, 'El reporte indicado no existe.');
    }

    res.status(200).json(filas[0]);
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const { motivo, descripcion, id_usuario, id_donacion } = req.body;

    if (!motivo || !String(motivo).trim()) {
      throw new ApiError(400, 'El motivo es obligatorio.');
    }
    if (!descripcion || !String(descripcion).trim()) {
      throw new ApiError(400, 'La descripción es obligatoria.');
    }
    if (!id_usuario) {
      throw new ApiError(400, 'El id de usuario es obligatorio.');
    }
    if (!id_donacion) {
      throw new ApiError(400, 'El id de donación es obligatorio.');
    }

    const [donaciones] = await pool.query(
      'SELECT id_donacion FROM donacion WHERE id_donacion = ? LIMIT 1',
      [id_donacion]
    );
    if (donaciones.length === 0) {
      throw new ApiError(400, 'La donación indicada no existe.');
    }

    const [usuarios] = await pool.query(
      'SELECT id_usuario FROM usuario WHERE id_usuario = ? LIMIT 1',
      [id_usuario]
    );
    if (usuarios.length === 0) {
      throw new ApiError(400, 'El usuario indicado no existe.');
    }

    const [resultado] = await pool.query(
      `INSERT INTO reporte (motivo, descripcion, id_usuario, id_donacion)
       VALUES (?, ?, ?, ?)`,
      [String(motivo).trim(), String(descripcion).trim(), id_usuario, id_donacion]
    );

    const [filas] = await pool.query('SELECT * FROM reporte WHERE id_reporte = ? LIMIT 1', [
      resultado.insertId
    ]);

    res.status(201).json(filas[0]);
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { estado, resolucion } = req.body;

    if (estado && !ESTADOS_VALIDOS.includes(estado)) {
      throw new ApiError(400, 'El estado indicado no es válido.');
    }

    const campos = [];
    const valores = [];

    if (estado !== undefined) {
      campos.push('estado = ?');
      valores.push(estado);
    }
    if (resolucion !== undefined) {
      campos.push('resolucion = ?');
      valores.push(resolucion);
    }

    if (campos.length === 0) {
      throw new ApiError(400, 'No se proporcionaron campos para actualizar.');
    }

    valores.push(id);

    const [resultado] = await pool.query(
      `UPDATE reporte SET ${campos.join(', ')} WHERE id_reporte = ?`,
      valores
    );

    if (resultado.affectedRows === 0) {
      throw new ApiError(404, 'El reporte indicado no existe.');
    }

    const [filas] = await pool.query('SELECT * FROM reporte WHERE id_reporte = ? LIMIT 1', [id]);
    res.status(200).json(filas[0]);
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    const { id } = req.params;
    const [resultado] = await pool.query('DELETE FROM reporte WHERE id_reporte = ?', [id]);

    if (resultado.affectedRows === 0) {
      throw new ApiError(404, 'El reporte indicado no existe.');
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
