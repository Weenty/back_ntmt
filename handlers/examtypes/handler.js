const { pool } = require("../../dependencies");

async function getExamTypes(user) {
    let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();

  try {
    const getExamTypes = await client.query(`SELECT * FROM examtypes`)
    data = {
        message: getExamTypes.rows,
        statusCode: 200
    }
  } catch (err) {
    data = {
      message: err.message,
      statusCode: 400,
    };
  } finally {
    client.release();
  }
  return data;
}

async function addExamType(object, user) {
    let data = {
      message: "",
      statusCode: 400,
    };
    const type = object.type

    if (user.userId != 1) {
        data = {
            message: "access denied",
            statusCode: 403,
        }
        return data
    }

    const client = await pool.connect();

    try {
        const addExamType = await client.query(`INSERT INTO examtypes ("type") VALUES ($1) RETURNING *`, [type])
        return {
            message: addExamType.rows[0],
            statusCode: 200,
        }
    }
    catch (err) {
        data = {
            message: err.message,
            statusCode: 400,
        }
    }
    finally {
        client.release();
    }
    return data
  }

  async function deleteExamType(object, user) {
    let data = {
      message: "",
      statusCode: 400,
    };
    const examtypeId = object.examtypeId

    if (user.userId != 1) {
        data = {
            message: "access denied",
            statusCode: 403,
        }
        return data
    }

    const client = await pool.connect();

    try {
        const checkExamType = await client.query(`SELECT * FROM examtypes WHERE "id" = $1`, [examtypeId])
        if (checkExamType.rows.length == 0) {
            data = {
                message: `Тип экзамена ${examtypeId} не найден`,
                statusCode: 400,
            }
            return data
        }
        const deleteQuery = await client.query(`DELETE FROM examtypes WHERE id = $1`, [examtypeId])
        data = {
            message: 'Успешное удаление',
            statusCode: 200,
        }
    }
    catch (err) {
        data = {
            message: err.message,
            statusCode: 400,
        }
    }
    finally {
        client.release();
    }
    return data
  }

  async function updateExamType(object, user) {
    let data = {
      message: "",
      statusCode: 400,
    };
    const id = object.examtypeId
    const type = object.type

    if (user.userId != 1) {
        data = {
            message: "access denied",
            statusCode: 403,
        }
        return data
    }

    const client = await pool.connect();

    try {
        const checkExamType = await client.query(`SELECT * FROM examtypes WHERE id = $1`, [id])
        if (checkExamType.rows.length > 0) {
            const addExamType = await client.query(`UPDATE examtypes SET "type" = $1 WHERE id = $2 RETURNING *`, [type, id])
            data = {
                message: addExamType.rows[0],
                statusCode: 200,
            }
        }
        else {
            data = {
                message: `Тип экзамена ${id} не был найден`,
                statusCode: 400,
            }
        }
    }
    catch (err) {
        data = {
            message: err.message,
            statusCode: 400,
        }
    }
    finally {
        client.release();
    }
    return data
  }

module.exports = {
    getExamTypes: getExamTypes,
    addExamType: addExamType,
    deleteExamType: deleteExamType,
    updateExamType: updateExamType
};
