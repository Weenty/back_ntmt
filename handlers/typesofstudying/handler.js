const { pool } = require("../../dependencies");

async function getTypes(object, user) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();
  try {
    const resQueryGetTypes = await client.query(`SELECT * FROM typesofstudying`, [])
    data = {
      message: resQueryGetTypes.rows,
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
    getTypes: getTypes,
};
