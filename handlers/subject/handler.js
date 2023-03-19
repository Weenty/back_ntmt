const { filesystem, pool, constants } = require("../../dependencies");

async function addSubjct(object, user) {
    let data = {
      message: "",
      statusCode: 400,
    };
    const name = object.name
    const teacherId = object.teacherId
    const examType = object.examType
    const hours = object.hours

    if (user.userId != 1) {
        data = {
            message: "access denied",
            statusCode: 403,
        }
        return data
    }

    const client = await pool.connect();

    try {
        const checkUser = await client.query(`SELECT * FROM users WHERE "id" = $1`, [teacherId])
        if (checkUser.rows.length == 0) {
            data = {
                message: `Пользователь ${teacherId} не найден`,
                statusCode: 400,
            }
            return data
        }

        const checkExamType = await client.query(`SELECT * FROM examtypes WHERE "id" = $1`, [examType])
        if (checkExamType.rows.length == 0) {
            data = {
                message: `Тип экзамена ${examType} не найден`,
                statusCode: 400,
            }
            return data
        }

        const addSubjct = await client.query(`insert into subjects ("id", "name", "summaryHours", "examType", "userId")
        values ((SELECT MAX(id) + 1 FROM subjects), $1, $2, $3, $4) RETURNING *`,[name, hours, examType, teacherId])

        return {
            message: addSubjct.rows,
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

  async function deleteSubject(object, user) {
    let data = {
      message: "",
      statusCode: 400,
    };
    const subjectId = object.subjectId

    if (user.userId != 1) {
        data = {
            message: "access denied",
            statusCode: 403,
        }
        return data
    }

    const client = await pool.connect();

    try {
        const checkSubject = await client.query(`SELECT * FROM subjects WHERE "id" = $1`, [subjectId])
        if (checkSubject.rows.length == 0) {
            data = {
                message: `Предмет ${subjectId} не найден`,
                statusCode: 400,
            }
            return data
        }
        const deleteQuery = await client.query(`DELETE FROM subjects WHERE id = $1`, [subjectId])
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

module.exports = {
    addSubjct:addSubjct,
    deleteSubject:deleteSubject,
  };
  