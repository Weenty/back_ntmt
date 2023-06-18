/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async pgm => {
    // const recordBook = await pgm.db.query(`insert into recordbooks ("id", "endMark", "date", "userId", "subjectId", "semestrId", "year")
    //                                   values ('1', 'Зачет', '2023-03-15 10:30:00-04:00', '2', '1', '1', '2023')
    //                                   returning "id"`)
    // if (recordBook.rowCount === 0 || recordBook.rows.length === 0) {
    //     throw 'Ошибка при добавлении зачетки'
    // }

    // const recordBook1 = await pgm.db.query(`insert into recordbooks ("id", "endMark", "date", "userId", "subjectId", "semestrId", "year")
    //                                   values ('2', 'Отлично', '2023-03-15 10:30:00-04:00', '2', '1', '1', '2023')
    //                                   returning "id"`)
    // if (recordBook1.rowCount === 0 || recordBook1.rows.length === 0) {
    //     throw 'Ошибка при добавлении зачетки'
    // }


    
    // const subject = await pgm.db.query(`insert into subjects ("id", "name", "summaryHours", "examType", "userId")
    //                                   values ('1', 'Мобильные приложения', '322', '1', '1')
    //                                   returning "id"`)
    // if (subject.rowCount === 0 || subject.rows.length === 0) {
    //     throw 'Ошибка при добавлении дисциплины'
    // }

    const examType = await pgm.db.query(`insert into examtypes ("id", "type")
                                      values ('1', 'Экзамен')
                                      returning "id"`)
    if (examType.rowCount === 0 || examType.rows.length === 0) {
        throw 'Ошибка при добавлении типа экзамена'
    }

    const examType2 = await pgm.db.query(`insert into examtypes ("id", "type")
                                      values ('2', 'Зачет')
                                      returning "id"`)
    if (examType2.rowCount === 0 || examType2.rows.length === 0) {
        throw 'Ошибка при добавлении типа экзамена'
    }

    const semestr = await pgm.db.query(`insert into semesters ("id", "value")
                                      values ('1', 'Осенний')
                                      returning "id"`)
    if (semestr.rowCount === 0 || semestr.rows.length === 0) {
        throw 'Ошибка при добавлении семесипа'
    }
    const semestr2 = await pgm.db.query(`insert into semesters ("id", "value")
                                      values ('2', 'Весенний')
                                      returning "id"`)
    if (semestr2.rowCount === 0 || semestr2.rows.length === 0) {
        throw 'Ошибка при добавлении семесипа'
    }
   
};

exports.down = pgm => {
};