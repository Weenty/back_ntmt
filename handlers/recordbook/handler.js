const { pool } = require("../../dependencies");

async function selectRecordBook(object, user) {
  let data = {
    message: "",
    statusCode: 400,
  };

  const client = await pool.connect();
  try {
    if (user.roleId != 1) {
      data = {
        message: "access denied",
        statusCode: 403,
      };
      return data;
    }
    const checkRecord = await client.query(
      `SELECT r."endMark",
        r."id",
        r."date",
        s."name",
        s."summaryHours",
        et."type",
        b."name",
        b."secondName",
        b."patronomyc",
        s."name",
        g."groupName",
        g."typeOfStudyingId",
        concat_ws(' ', teacher."secondName", teacher."name", teacher."patronomyc") as "teacher"
 FROM recordbooks r
          INNER JOIN subjects s on r."subjectId" = s."id"
          INNER JOIN examtypes et on s."examType" = et.id
          INNER JOIN users u on r."userId" = u.id
          INNER JOIN bios b on u."id" = b."userId"
          inner join groups g on u."groupId" = g.id
          inner join bios teacher on s."userId" = teacher."userId"
 WHERE r."userId" = $1`,
      [object.userId]
    );

    data = {
      message: checkRecord.rows,
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

async function deleteRecordBook(object, user) {
  let data = {
    message: "",
    statusCode: 400,
  };

  const client = await pool.connect();
  try {
    if (user.roleId != 1) {
      data = {
        message: "access denied",
        statusCode: 403,
      };
      return data;
    }

    const checkRecord = await client.query(
      `SELECT * FROM recordbooks WHERE id = $1`,
      [object.recordId]
    );
    if (checkRecord.rows.length == 0) {
      data = {
        message: `Запись ${object.recordId} в зачетной книжке не найдена`,
        statusCode: 400,
      };
      return data;
    }

    const deleteRecord = await client.query(
      `DELETE FROM recordbooks WHERE id = $1`,
      [object.recordId]
    );

    data = {
      message: "Успешное удаление записи из зачетной книжки",
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

async function createRecordBook(object, user) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const endMark = object.endMark;
  const date = object.date;
  const userId = object.userId;
  const subjectId = object.subjectId;
  const semestrId = object.semestrId;
  const year = object.year;

  const client = await pool.connect();
  try {
    if (user.roleId != 1) {
      data = {
        message: "access denied",
        statusCode: 403,
      };
      return data;
    }
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

    const checkSubjectId = await client.query(
      `SELECT * FROM subjects WHERE "id" = $1`,
      [subjectId]
    );
    if (checkSubjectId.rows.length == 0) {
      data = {
        message: "Указанный предмет не был найден",
        statusCode: 400,
      };
      return data;
    }

    const checkSemestrId = await client.query(
      `SELECT * FROM semesters WHERE "id" = $1`,
      [semestrId]
    );
    if (checkSemestrId.rows.length == 0) {
      data = {
        message: "Указанный семестр не был найден",
        statusCode: 400,
      };
      return data;
    }

    const recordBook = await client.query(
      `insert into recordbooks ("id", "endMark", "date", "userId", "subjectId", "semestrId", "year")
                                      values ((SELECT MAX(id) + 1 FROM recordbooks), $1, $2, $3, $4, $5, $6)`,
      [endMark, date, userId, subjectId, semestrId, year]
    );

    data = {
      message: "Успешное добавление в зачетную книжку.",
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

async function getRecordBook(object, user) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();
  const userId = user.userId;
  try {
    const querySelectRecordBook = `SELECT r."endMark",
                                              r."id",
                                              s."name",
                                              r."date",
                                              s."name",
                                              s."summaryHours",
                                              et."type",
                                              b."name",
                                              b."secondName",
                                              b."patronomyc",
                                              g."groupName",
                                              g."typeOfStudyingId",
                                              concat_ws(' ', teacher."secondName", teacher."name", teacher."patronomyc") as "teacher"
                                       FROM recordbooks r
                                                INNER JOIN subjects s on r."subjectId" = s."id"
                                                INNER JOIN examtypes et on s."examType" = et.id
                                                INNER JOIN users u on r."userId" = u.id
                                                INNER JOIN bios b on u."id" = b."userId"
                                                inner join groups g on u."groupId" = g.id
                                                inner join bios teacher on s."userId" = teacher."userId"
                                       WHERE r."userId" = $1
                                         AND r."semestrId" = $2
                                         AND r.year = $3`;
    const resSelectRecordBook = await client.query(querySelectRecordBook, [
      userId,
      object.semestrId,
      object.year,
    ]);
    if (resSelectRecordBook.rows.length > 0) {
      data = {
        message: resSelectRecordBook.rows,
        statusCode: 200,
      };
    } else {
      data = {
        message: "Ошибка при получении информации о зачетке",
        statusCode: 400,
      };
      console.log("Ошибка при получении информации о зачетке");
    }
  } catch (e) {
    console.log(e);
  } finally {
    client.release();
    console.log("client.release()");
  }
  return data;
}


async function updateRecordBook(object, user) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const endMark = object.endMark;
  const date = object.date;
  const userId = object.userId;
  const subjectId = object.subjectId;
  const semestrId = object.semestrId;
  const year = object.year;
  const recordId = object.recordId;

  const client = await pool.connect();
  try {
    if (user.roleId != 1) {
      data = {
        message: "access denied",
        statusCode: 403,
      };
      return data;
    }

    const checkRecord = await client.query(
      `SELECT * FROM recordbooks WHERE id = $1`,
      [recordId]
    );
    if (checkRecord.rows.length == 0) {
      data = {
        message: `Запись ${recordId} в зачетной книжке не найдена`,
        statusCode: 400,
      };
      return data;
    }

    const updates = [];
    const values = [];

    if (endMark) {
      updates.push(`"endMark" = $${updates.length + 1}`);
      values.push(endMark);
    }

    if (date) {
      updates.push(`"date" = $${updates.length + 1}`);
      values.push(date);
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

    if (subjectId) {
      const checkSubjectId = await client.query(
        `SELECT * FROM subjects WHERE "id" = $1`,
        [subjectId]
      );
      if (checkSubjectId.rows.length == 0) {
        data = {
          message: "Указанный предмет не был найден",
          statusCode: 400,
        };
        return data;
      }

      updates.push(`"subjectId" = $${updates.length + 1}`);
      values.push(subjectId);
    }

    if (semestrId) {
      const checkSemestrId = await client.query(
        `SELECT * FROM semesters WHERE "id" = $1`,
        [semestrId]
      );
      if (checkSemestrId.rows.length == 0) {
        data = {
          message: "Указанный семестр не был найден",
          statusCode: 400,
        };
        return data;
      }
      updates.push(`"semestrId" = $${updates.length + 1}`);
      values.push(semestrId);
    }

    if (year) {
      updates.push(`"year" = $${updates.length + 1}`);
      values.push(year);
    }

    if (updates.length == 0) {
      data = {
        message: "Нет данных для обновления.",
        statusCode: 400,
      };
      return data;
    }

    const updateRecord = await client.query(
      `UPDATE recordbooks SET ${updates.join(
        ","
      )} WHERE id = $${values.length + 1} RETURNING *`,
      [...values, recordId]
    );

    data = {
      message: updateRecord.rows,
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
  getRecordBook: getRecordBook,
  updateRecordBook: updateRecordBook,
  createRecordBook: createRecordBook,
  deleteRecordBook: deleteRecordBook,
  selectRecordBook: selectRecordBook,
};
