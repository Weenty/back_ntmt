const { filesystem, pool, constants } = require("../../dependencies");

async function getSubject(object, user, id) {
    let data = {
        message: "",
        statusCode: 400,
      };
  
      const client = await pool.connect();
  
      try {
        let getSubject
          if (id) {
            getSubject = await client.query(`SELECT s."id", s."name", s."summaryHours", ex."type" as "examType", concat_ws(' ', teacher."secondName", teacher."name", teacher."patronomyc") as "teacher" 
            FROM subjects s
            left join examtypes ex on s."examType" = ex."id"
            inner join bios teacher on s."userId" = teacher."userId"
            WHERE s."id" = $1`, [id])
          }
          else {
            getSubject = await client.query(`SELECT s."id", s."name", s."summaryHours", ex."type" as "examType", concat_ws(' ', teacher."secondName", teacher."name", teacher."patronomyc") as "teacher" 
            FROM subjects s
            left join examtypes ex on s."examType" = ex."id"
            inner join bios teacher on s."userId" = teacher."userId"`)
          }
        data = {
            message: getSubject.rows,
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

async function addSubjct(object, user) {
    let data = {
      message: "",
      statusCode: 400,
    };
    const name = object.name
    const teacherId = object.teacherId
    const examType = object.examType
    const hours = object.hours
    if (user.roleId != 1) {
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

    if (user.roleId != 1) {
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

  async function updateSubject(object, user) {
    let data = {
      message: "",
      statusCode: 400,
    };
    const subjectId = object.subjectId;
    const name = object.name;
    const summaryHours = object.summaryHours;
    const examType = object.examType;
    const userId = object.teacherId
  
    const client = await pool.connect();
    try {
      if (user.roleId != 1) {
        data = {
          message: "access denied",
          statusCode: 403,
        };
        return data;
      }
  
      const checkSubject = await client.query(
        `SELECT * FROM subjects WHERE id = $1`,
        [subjectId]
      );
      if (checkSubject.rows.length == 0) {
        data = {
          message: `Предмет ${subjectId} не был найден`,
          statusCode: 400,
        };
        return data;
      }
  
      const updates = [];
      const values = [];
  
      if (name) {
        updates.push(`"name" = $${updates.length + 1}`);
        values.push(name);
      }
  
      if (summaryHours) {
        updates.push(`"summaryHours" = $${updates.length + 1}`);
        values.push(summaryHours);
      }
  
      if (userId) {
        const checkUserId = await client.query(
          `SELECT * FROM users WHERE "id" = $1`,
          [userId]
        );
        if (checkUserId.rows.length == 0) {
          data = {
            message: "Указанный пользователь не был найден",
            statusCode: 400,
          };
          return data;
        }
  
        updates.push(`"userId" = $${updates.length + 1}`);
        values.push(userId);
      }
  
      if (examType) {
        const checkSubjectId = await client.query(
          `SELECT * FROM examtypes WHERE "id" = $1`,
          [examType]
        );
        if (checkSubjectId.rows.length == 0) {
          data = {
            message: "Указанный тип экзамена не был найден",
            statusCode: 400,
          };
          return data;
        }
  
        updates.push(`"examType" = $${updates.length + 1}`);
        values.push(examType);
      }
  
      if (updates.length == 0) {
        data = {
          message: "Нет данных для обновления.",
          statusCode: 400,
        };
        return data;
      }
  
      const updateSubject = await client.query(
        `UPDATE subjects SET ${updates.join(
          ","
        )} WHERE id = $${values.length + 1} RETURNING *`,
        [...values, subjectId]
      );
  
      data = {
        message: updateSubject.rows,
        statusCode: 200,
      };
    } catch (e) {
      console.error(e);
      data = {
        message: e.message,
        statusCode: 400,
      };
    } finally {
      client.release();
      console.log("client.release()");
    }
    return data;
  }

module.exports = {
    getSubject: getSubject,
    addSubjct:addSubjct,
    deleteSubject:deleteSubject,
    updateSubject: updateSubject,
  };
  