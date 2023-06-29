/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async pgm => {
    // const messages = await pgm.db.query(`insert into messages ("title", "text", "date", "author")
    //                                   values ('Новый тестовый сотрудник', 'Привет, ты новый преподаватель!', 'NOW()', 1)
    //                                   returning "id"`)
    // if (messages.rowCount === 0) {
    // throw 'Ошибка при создании сообщений'
    // }

    // const messagesuser = await pgm.db.query(`insert into usermessages ("userId", "messageId")
    //                                   values ('1', '1')
    //                                   returning "id"`)
    // if (messagesuser.rowCount === 0) {
    // throw 'Ошибка при создании сообщений для юзеров'
    // }
};

exports.down = pgm => {
};