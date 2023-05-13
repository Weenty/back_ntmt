const { pool } = require("../../dependencies");

async function getSemesters(user) {
    let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();

  try {
    const getSemesters = await client.query(`SELECT * FROM semesters`)
    data = {
        message: getSemesters.rows,
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

async function addSemester(object, user) {
    let data = {
      message: "",
      statusCode: 400,
    };
    const value = object.value

    if (user.userId != 1) {
        data = {
            message: "access denied",
            statusCode: 403,
        }
        return data
    }

    const client = await pool.connect();

    try {
        const addSemester = await client.query(`INSERT INTO semesters ("value") VALUES ($1) RETURNING *`, [value])
        return {
            message: addSemester.rows[0],
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

  async function deleteSemester(object, user) {
    let data = {
      message: "",
      statusCode: 400,
    };
    const semesterId = object.semesterId

    if (user.userId != 1) {
        data = {
            message: "access denied",
            statusCode: 403,
        }
        return data
    }

    const client = await pool.connect();

    try {
        const checkSemester = await client.query(`SELECT * FROM semesters WHERE "id" = $1`, [semesterId])
        if (checkSemester.rows.length == 0) {
            data = {
                message: `Семестр ${semesterId} не найден`,
                statusCode: 400,
            }
            return data
        }
        const deleteQuery = await client.query(`DELETE FROM semesters WHERE id = $1`, [semesterId])
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

  async function updateSemester(object, user) {
    let data = {
      message: "",
      statusCode: 400,
    };
    const id = object.semesterId
    const value = object.value

    if (user.userId != 1) {
        data = {
            message: "access denied",
            statusCode: 403,
        }
        return data
    }

    const client = await pool.connect();

    try {
        const checkSemester = await client.query(`SELECT * FROM semesters WHERE id = $1`, [id])
        if (checkSemester.rows.length > 0) {
            const addSemester = await client.query(`UPDATE semesters SET "value" = $1 WHERE id = $2 RETURNING *`, [value, id])
            data = {
                message: addSemester.rows[0],
                statusCode: 200,
            }
        }
        else {
            data = {
                message: `Семестр ${id} не был найден`,
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
    getSemesters: getSemesters,
    addSemester: addSemester,
    deleteSemester: deleteSemester,
    updateSemester: updateSemester
};
