const { pool } = require("../../dependencies");

async function getUser(object, user, id) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();
  if (user.roleId != 1) {
    data = {
      message: "access denied",
      statusCode: 400,
    };
    return data;
  }
  try {
    let resQueryGetUser
    if (id) {
      
      const queryGetUser = `SELECT u."id", u."login", concat_ws(' ', b."secondName", b."name", b."patronomyc") as "fio" 
      FROM users u
      left join bios b on u."id" = b."id"
      WHERE u."id" = $1`;
      resQueryGetUser = await client.query(queryGetUser, [id]);
    }
    else {

      const queryGetUser = `SELECT u."id", u."login", concat_ws(' ', b."secondName", b."name", b."patronomyc") as "fio" 
      FROM users u
      left join bios b on u."id" = b."id"`;
      resQueryGetUser = await client.query(queryGetUser, []);
    }

    data = {
      message: resQueryGetUser.rows,
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
  getUser: getUser,
};
