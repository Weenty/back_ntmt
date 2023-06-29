const { pool } = require("../../dependencies");
const files = require("../files/handler")
async function deleteUser(object, user, id) {
    let data = {
      message: "",
      statusCode: 400,
    };
    if(user.roleId != 1) {
        return {
            message: "access denied",
            statusCode: 403,
          };
    }
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const user = await client.query('SELECT * FROM users WHERE "id" = $1', id)
        const bio = await client.query('SELECT * FROM bios WHERE "userId" = $1', id)
        if(user.rows.length == 0 || bio.rows.length == 0) {
            throw new Error('Информация о пользователе не была найдена!')
        }
        await client.query('DELETE FROM users WHERE "id" = $1', id)
        await client.query('DELETE FROM bios WHERE "userId" = $1', id)

        const role = await client.query('SELECT * FROM userroles WHERE "userId" = $1', id)
        await client.query('DELETE FROM userroles WHERE "userId" = $1', id)
        if(role.rows[0].roleId == 1 && role.rows[0].roleId == 3) {
            const subjects = await client.query('SELECT * FROM subjects WHERE "userId" = $1', id)
            for(const subject of subjects.rows) {
                await client.query('DELETE FROM recordbooks WHERE "subjectId" = $1', id)
            }
            await client.query('DELETE FROM subjects WHERE "userId" = $1', id)
        } 
        await client.query('DELETE FROM recordbooks WHERE "userId" = $1', id)
        const messages = await client.query('SELECT * FROM messages WHERE "author" = $1',id)
        for(const message of messages.rows) {
            await client.query('DELETE FROM usermessages WHERE "messageId" = $1', message.id)
        }
        await client.query('DELETE FROM messages WHERE "author" = $1', id)
        await client.query('DELETE FROM usermessages WHERE "userId" = $1', id)

        const folders = await client.query('SELECT * FROM files WHERE "userId" = $1', id)
        for(const folder of folders.rows) {
            files.deleteFolderRecursive(folder.id, id, client)
        }

        await client.query("COMMIT");
        data = {
            message: "Успешное удаление",
            statusCode: 200,
        }
        return data
    } catch (e) {
        await client.query("ROLLBACK");
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
    deleteUser: deleteUser
  };
  