/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async pgm => {

    const typeOfStyding = await pgm.db.query(`insert into typesofstudying ("id", "type")
                                      values ('1', 'Очная')
                                      returning "id"`)
    if (typeOfStyding.rowCount === 0 || typeOfStyding.rows.length === 0) {
        throw 'Ошибка при добавлении семесипа'
    }
    const typeOfStyding2 = await pgm.db.query(`insert into typesofstudying ("id", "type")
                                      values ('2', 'Заочная')
                                      returning "id"`)
    if (typeOfStyding2.rowCount === 0 || typeOfStyding2.rows.length === 0) {
        throw 'Ошибка при добавлении семесипа'
    }
    const typeOfStyding3 = await pgm.db.query(`insert into typesofstudying ("id", "type")
                                      values ('3', 'Очно-заочная')
                                      returning "id"`)
    if (typeOfStyding3.rowCount === 0 || typeOfStyding3.rows.length === 0) {
        throw 'Ошибка при добавлении семесипа'
    }
};

exports.down = pgm => {
};