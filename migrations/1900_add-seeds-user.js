/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async pgm => {
    const group = await pgm.db.query(`insert into groups ("groupName", "code", "typeOfStudyingId")
                                      values ('Информационные системы и технологии', 'Т-493901', 1)
                                      returning "id"`)
    if (group.rowCount === 0 || group.rows.length === 0) {
        throw 'Ошибка при создании группы'
    }
    const group2 = await pgm.db.query(`insert into groups ("groupName", "code", "typeOfStudyingId")
                                      values ('Технологии оптимизации', 'ТО-12901', 1)
                                      returning "id"`)
    if (group2.rowCount === 0 || group2.rows.length === 0) {
        throw 'Ошибка при создании группы'
    }

    const group3 = await pgm.db.query(`insert into groups ("groupName", "code", "typeOfStudyingId")
                                      values ('Технологии дерьма', 'ТО-21906', 1)
                                      returning "id"`)
    if (group3.rowCount === 0 || group3.rows.length === 0) {
        throw 'Ошибка при создании группы'
    }
    //password = root
    const user = await pgm.db.query(`insert into users ("typesId", "login", "password", "groupId")
                                     values (2, 'user', '$2a$10$yqkkq19EglFc68MuNEHifuFGYfUnc9oaSlgfvp/SrnLu4dR4uvdHG',
                                             ${group.rows[0].id})
                                     returning "id"`);
    if (user.rowCount === 0 || user.rows.length === 0) {
        throw 'Ошибка при создании пользователя'
    }
    const prep = await pgm.db.query(`insert into users ("typesId", "login", "password", "groupId")
                                     values (2, 'weentry', '$2a$10$yqkkq19EglFc68MuNEHifuFGYfUnc9oaSlgfvp/SrnLu4dR4uvdHG',
                                             ${group2.rows[0].id})
                                     returning "id"`);
    if (prep.rowCount === 0 || prep.rows.length === 0) {
        throw 'Ошибка при создании пользователя'
    }

    const student = await pgm.db.query(`insert into users ("typesId", "login", "password", "groupId")
                                     values (2, 'student', '$2a$10$yqkkq19EglFc68MuNEHifuFGYfUnc9oaSlgfvp/SrnLu4dR4uvdHG',
                                             ${group3.rows[0].id})
                                     returning "id"`);
    if (student.rowCount === 0 || student.rows.length === 0) {
        throw 'Ошибка при создании пользователя'
    }

    const student2 = await pgm.db.query(`insert into users ("typesId", "login", "password", "groupId")
                                     values (2, 'student2', '$2a$10$yqkkq19EglFc68MuNEHifuFGYfUnc9oaSlgfvp/SrnLu4dR4uvdHG',
                                             ${group2.rows[0].id})
                                     returning "id"`);
    if (student2.rowCount === 0 || student2.rows.length === 0) {
        throw 'Ошибка при создании пользователя'
    }

    const bio = await pgm.db.query(`insert into bios ("name", "secondName", "patronomyc", "grant", "userId", "flura")
                                    values ('Иван', 'Иванов', 'Иванович', 2000, ${user.rows[0].id}, now())`)
    if (bio.rowCount === 0) {
        throw 'Ошибка при создании био'
    }
    const bio2 = await pgm.db.query(`insert into bios ("name", "secondName", "patronomyc", "grant", "userId", "flura")
                                    values ('Алексей', 'Паньшин', 'Александрович', 22000, ${prep.rows[0].id}, now())`)
    if (bio2.rowCount === 0) {
        throw 'Ошибка при создании био'
    }

    const bio3 = await pgm.db.query(`insert into bios ("name", "secondName", "patronomyc", "grant", "userId", "flura")
                                    values ('Юрий', 'Табачок', 'Сергеевич', 22000, ${student.rows[0].id}, now())`)
    if (bio3.rowCount === 0) {
        throw 'Ошибка при создании био'
    }
    const bio4 = await pgm.db.query(`insert into bios ("name", "secondName", "patronomyc", "grant", "userId", "flura")
                                    values ('Виктория', 'Бронникова', 'Ульяновна', 22000, ${student2.rows[0].id}, now())`)
    if (bio4.rowCount === 0) {
        throw 'Ошибка при создании био'
    }

    const roles = await pgm.db.query(`insert into roles (value) values ('Администратор') returning id`)
    const roles2 = await pgm.db.query(`insert into roles (value) values ('Родитель') returning id`)
    const roles3 = await pgm.db.query(`insert into roles (value) values ('Преподаватель') returning id`)
    const roles4 = await pgm.db.query(`insert into roles (value) values ('Студент') returning id`)

    const userRole = await pgm.db.query(`insert into userroles ("userId", "roleId") values (${user.rows[0].id},${roles.rows[0].id})`)
    const userRole2 = await pgm.db.query(`insert into userroles ("userId", "roleId") values (${prep.rows[0].id},${roles3.rows[0].id})`)
    const userRole3 = await pgm.db.query(`insert into userroles ("userId", "roleId") values (${student.rows[0].id},${roles4.rows[0].id})`)
    const userRole4 = await pgm.db.query(`insert into userroles ("userId", "roleId") values (${student2.rows[0].id},${roles4.rows[0].id})`)
};

exports.down = pgm => {
};