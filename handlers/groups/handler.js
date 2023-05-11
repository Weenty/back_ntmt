const { pool } = require("../../dependencies");

async function getGroups(object, user) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();
  try {
    const resQueryGetGroups = await client.query(`SELECT g."id", g."groupName", g."code", t."type" 
                                                FROM groups g
                                                left join typesofstudying t on g."typeOfStudyingId" = t."id"
                                                  `, [])
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
    const resQueryGetUsers = await client.query(`SELECT u."id", concat_ws(' ', b."secondName", b."name", b."patronomyc") as "fio"
                                                  FROM users u
                                                  left join bios b on u."id" = b.id
                                                  WHERE u."groupId" = $1`, [group])
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

module.exports = {
  getGroups: getGroups,
  getStudentsByGroup:getStudentsByGroup
};
