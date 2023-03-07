/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async pgm => {
    const messages = await pgm.db.query(`insert into messages ("id", "title", "text", "date", "author")
                                      values ('1', 'ОТ ДЕПАРТА', 'У тебя экзамен, бро, нужна флюра', 'NOW()', 2)
                                      returning "id"`)
    if (messages.rowCount === 0) {
    throw 'Ошибка при создании сообщений'
    }

    const messagesuser = await pgm.db.query(`insert into usermessages ("id", "userId", "messageId")
                                      values ('1', '1', '1')
                                      returning "id"`)
    if (messagesuser.rowCount === 0) {
    throw 'Ошибка при создании сообщений для юзеров'
    }
};

exports.down = pgm => {
};