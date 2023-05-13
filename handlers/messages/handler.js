const { pool } = require("../../dependencies");

async function getMessages(object, user, list) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();
  const userId = user.userId;
  const entriesOnPage = 5;
  let listLimit = list * entriesOnPage - entriesOnPage;

  try {
    const qCount = await client.query(
      `select count(*)::integer  from usermessages where "userId" = $1`,
      [user.userId]
    );
    const querySelectAllMessages = `SELECT *
                                        FROM usermessages um
                                                 LEFT JOIN messages m on um."messageId" = m.id
                                        WHERE "userId" = $1 AND "view" = 1
                                        ORDER BY m.date DESC
                                        OFFSET $2 LIMIT $3`;
    const resSelectAllMessages = await client.query(querySelectAllMessages, [
      userId,
      listLimit,
      entriesOnPage,
    ]);
    data = {
      message: resSelectAllMessages.rows,
      statusCode: 200,
      count: qCount.rows[0].count,
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

async function disableView(object, user) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const list = object.listMessages
  const client = await pool.connect();
  try {
    let lossMessage = []
    for (let i = 0; i<list.length; i++) {
      const checkMessage = await client.query(`SELECT * FROM usermessages WHERE "userId" = $1 AND "messageId" = $2`, [user.userId, list[i]])
      if (checkMessage.rows.length > 0) {
        const setNewView = await client.query(`UPDATE usermessages SET "view" = 0 WHERE "userId" = $1 AND "messageId" = $2`, [user.userId, list[i]])
      }
      else {
        lossMessage.push(list[i])
      }
    }
    data = {
      message: lossMessage.length > 0 ? `Сообщения: ${lossMessage.join(', ')} не были изменены` : 'Сообщения скрыты',
      statusCode: lossMessage.length > 0 ? 206 : 200,
    }
    return data
  } catch (e) {
    console.log(e);
  } finally {
    client.release();
    console.log("client.release()");
  }
  return data;
}

async function getInfoAboutMessage(object, user, id) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();
  try {
    const querySelectMessage = `SELECT *
                                    FROM messages
                                    WHERE "id" = $1`;
    const resSelectMessage = await client.query(querySelectMessage, [id]);
    if (resSelectMessage.rows.length > 0) {
      data = {
        message: resSelectMessage.rows[0],
        statusCode: 200,
      };
    } else {
      data = {
        message: `Сообщения с id ${id} не существует`,
        statusCode: 400,
      };
      console.log(`Сообщения с id ${id} не существует`);
    }
  } catch (e) {
    console.log(e);
  } finally {
    client.release();
    console.log("client.release()");
  }
  return data;
}

async function createMessage(object, user) {
  let data = {
    message: "",
    statusCode: 400,
  };

  let workWithUser;
  let lossUsers = []
  
  const client = await pool.connect();
  const userId = user.userId;
  if (user.roleId != 1) {
    data = {
      message: "access denied",
      statusCode: 400,
    };
    return data;
  }
  try {
    const querySelectMessage = `insert into messages ("id", "title", "text", "date", "author")
      values ((SELECT MAX(id) + 1 FROM messages), $1, $2, 'NOW()', $3) returning "id"`;

    const messagesuser = `insert into usermessages ("id", "userId", "messageId") values ((SELECT MAX(id) + 1 FROM usermessages), $1, $2)`;

    for (let i = 0; i < object.userid.length; i++) {
      workWithUser = object.userid[i];
      const queryCheckUser = "SELECT * FROM users WHERE id = $1";
      const resqueryCheckUser = await client.query(queryCheckUser, [
        workWithUser,
      ]);

      if (resqueryCheckUser.rows.length > 0) {
        const resSelectMessage = await client.query(querySelectMessage, [
          object.title,
          object.text,
          workWithUser,
        ]);

        const resSelectMessage2 = await client.query(messagesuser, [
          workWithUser,
          resSelectMessage.rows[0].id,
        ]);

      } else {
        lossUsers.push(workWithUser);
      }
    }
    if (lossUsers.length > 0) {
      data = {
        message: "Пользователи не найдены: " + lossUsers.join(", "),
        statusCode: 206,
      };
    }
    else {
      data = {
        message: "Сообщения успешно отправлены",
        statusCode: 200,
      };
    }
    
  } catch (e) {
    console.log(e);
  } finally {
    client.release();
    console.log("client.release()");
  }
  return data;
}

module.exports = {
  getMessages: getMessages,
  getInfoAboutMessage: getInfoAboutMessage,
  createMessage: createMessage,
  disableView: disableView
};
