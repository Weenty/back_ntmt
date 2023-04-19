const { pool } = require("../../dependencies");

async function getGroups(object, user) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();
  try {
    const resQueryGetGroups = await client.query(`SELECT * FROM groups`, [])
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

module.exports = {
  getGroups: getGroups,
};
