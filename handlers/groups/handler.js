const { pool } = require("../../dependencies");

async function getGroups(object, user) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();
  try {
    const resQueryGetGroups = await client.query(
      `SELECT g."id", g."groupName", g."code", t."type" 
                                                FROM groups g
                                                left join typesofstudying t on g."typeOfStudyingId" = t."id"
                                                  `,
      []
    );
    data = {
      message: resQueryGetGroups.rows,
      statusCode: 200,
    };
    return data;
  } catch (e) {
    console.log(e);
    data = {
      message: e,
      statusCode: 400,
    };
  } finally {
    client.release();
    console.log("client.release");
  }
  return data;
}

async function getStudentsByGroup(group, user) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();
  try {
    const resQueryGetUsers = await client.query(
      `SELECT u."id", concat_ws(' ', b."secondName", b."name", b."patronomyc") as "fio"
                                                  FROM users u
                                                  left join bios b on u."id" = b.id
                                                  WHERE u."groupId" = $1`,
      [group]
    );
    data = {
      message: resQueryGetUsers.rows,
      statusCode: 200,
    };
    return data;
  } catch (e) {
    console.log(e);
    data = {
      message: e,
      statusCode: 400,
    };
  } finally {
    client.release();
    console.log("client.release");
  }
  return data;
}

async function getGroupsSubject(object, user) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const groupId = object.groupId;
  const client = await pool.connect();
  try {
    const subjectGroup = await client.query(
                                              `SELECT gj."id",
                                              s."name" as "subjectName", 
                                              s."summaryHours", 
                                              t."type",
                                              concat_ws(' ', teacher."secondName", teacher."name", teacher."patronomyc") as "teacher"
                                              FROM groupssubjects gj
                                              INNER JOIN subjects s on gj."subjectId" = s."id"
                                              inner join bios teacher on s."userId" = teacher."userId"
                                              inner join examtypes t on t."id" = s."examType"
                                              WHERE gj."groupId" = $1
                                              `,
      [groupId]
    );
    data = {
      message: subjectGroup.rows,
      statusCode: 200,
    };
  } catch (e) {
    console.log(e);
    data = {
      message: e,
      statusCode: 400,
    };
  } finally {
    client.release();
    console.log("client.release");
  }
  return data;
}

async function addSubjctsForGroups(object, user) {
  let data = {
    message: "",
    statusCode: 400,
  };

  if (user.roleId != 1) {
    data = {
      message: "access denied",
      statusCode: 403,
    };
    return data;
  }
  const groupId = object.groupId;
  const subjects = object.subjects;
  const client = await pool.connect();

  try {
    const checkGroups = await client.query(
      `SELECT * FROM groups WHERE "id" = $1`,
      [groupId]
    );
    if (checkGroups.rows.length == 0) {
      data = {
        message: `Группа ${groupId} не найдена`,
        statusCode: 400,
      };
      return data;
    }
    await client.query("BEGIN");
    for (let i = 0; i < subjects.length; i++) {
      const checkSubject = await client.query(
        `SELECT * FROM subjects WHERE "id" = $1`,
        [subjects[i]]
      );
      if (checkSubject.rows.length == 0) {
        await client.query("ROLLBACK");
        data = {
          message: `Предмет ${subjects[i]} не найден`,
          statusCode: 400,
        };
        return data;
      }
      else {
        const addSubject = await client.query(`insert into groupssubjects ("groupId", "subjectId")
        values ($1, $2)`, [groupId,subjects[i]])
      }
    }
    await client.query("COMMIT");
    data = {
      message: `Успешное добавление`,
      statusCode: 200,
    };
    return data
  } catch (err) {
    await client.query("ROLLBACK");
    data = {
      message: err.message,
      statusCode: 400,
    };
  } finally {
    client.release();
  }
  return data;
}

async function deleteSubjectForGroup(object, user) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const subjectGroupId = object.subjectGroupId

  if (user.roleId != 1) {
      data = {
          message: "access denied",
          statusCode: 403,
      }
      return data
  }

  const client = await pool.connect();

  try {
      const checkGroupsSubjects = await client.query(`SELECT * FROM groupssubjects WHERE "id" = $1`, [subjectGroupId])
      if (checkGroupsSubjects.rows.length == 0) {
          data = {
              message: `Связь ${subjectGroupId} не найдена`,
              statusCode: 400,
          }
          return data
      }
      const deleteQuery = await client.query(`DELETE FROM groupssubjects WHERE id = $1`, [subjectGroupId])
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
  getGroups: getGroups,
  getStudentsByGroup: getStudentsByGroup,
  getGroupsSubject: getGroupsSubject,
  addSubjctsForGroups:addSubjctsForGroups,
  deleteSubjectForGroup:deleteSubjectForGroup
};
