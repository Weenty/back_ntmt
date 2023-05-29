/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async pgm => {
    const folders1 = await pgm.db.query(`insert into folders ("id", "userId", "name", "folderId")
                                      values ('1', '1', 'Задание', null)
                                      returning "id"`)
    if (folders1.rowCount === 0 || folders1.rows.length === 0) {
        throw 'Ошибка при добавлении папок'
    }
    
    // const folders2 = await pgm.db.query(`insert into folders ("id", "userId", "name", "folderId")
    //                                   values ('2', '2', 'weentry', null)
    //                                   returning "id"`)
    // if (folders2.rowCount === 0 || folders2.rows.length === 0) {
    //     throw 'Ошибка при добавлении папок'
    // }


    // const folders3 = await pgm.db.query(`insert into folders ("id", "userId", "name", "folderId")
    //                                   values ('3', '3', 'student', null)
    //                                   returning "id"`)
    // if (folders3.rowCount === 0 || folders3.rows.length === 0) {
    //     throw 'Ошибка при добавлении папок'
    // }

    // const folders4 = await pgm.db.query(`insert into folders ("id", "userId", "name", "folderId")
    //                                   values ('4', '4', 'Бронникова Виктория', null)
    //                                   returning "id"`)
    // if (folders4.rowCount === 0 || folders4.rows.length === 0) {
    //     throw 'Ошибка при добавлении папок'
    // }
};

exports.down = pgm => {
};