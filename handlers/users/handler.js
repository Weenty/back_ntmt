const { pool } = require("../../dependencies");

async function getUser(object, user, id) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();
  if (user.roleId != 1 && user.roleId != 3) {
    data = {
      message: "access denied",
      statusCode: 400,
    };
    return data;
  }
  try {
    let resQueryGetUser
    if (id) {
      const queryGetUser = `SELECT u."id", ur."roleId", concat_ws(' ', b."secondName", b."name", b."patronomyc") as "fio" 
      FROM users u
      left join bios b on u."id" = b."id"
      left join userroles ur on u."id" = ur."userId"
      WHERE u."id" = $1`;
      resQueryGetUser = await client.query(queryGetUser, [id]);
    }
    else {

      const queryGetUser = `SELECT u."id", ur."roleId", concat_ws(' ', b."secondName", b."name", b."patronomyc") as "fio" 
      FROM users u
      left join userroles ur on u."id" = ur."userId"
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

async function getByRole(object, user) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const roleId = object.roleId
  const client = await pool.connect();
  if (user.roleId != 1 && user.roleId != 3) {
    data = {
      message: "access denied",
      statusCode: 403,
    };
    return data;
  }
  try {
    advenseRole = roleId
    if(roleId == 3) {
      advenseRole = 1
    }
    const queryGetByRole= `SELECT u."id", concat_ws(' ', b."secondName", b."name", b."patronomyc") as "fio" 
      FROM users u
      left join userroles ur on u."id" = ur."userId"
      left join bios b on u."id" = b."userId"
      WHERE ur."roleId" = $1 OR ur."roleId" = $2`;
    const resQueryGetUser = await client.query(queryGetByRole, [roleId, advenseRole]);
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
  getByRole: getByRole
};
