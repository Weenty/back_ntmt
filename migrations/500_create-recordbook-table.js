/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('recordbooks', {
        id: {
            type: 'bigserial',
            primaryKey: true
        },
        endMark: {
            type: 'varchar(250)',
            comment: 'Итоговая оценка',
            required: true
        },
        date: {
            type: 'timestamp with time zone',
            default: pgm.func('now()')
        },
        userId:{
            type:'bigint'
        },
        subjectId:{
            type:'bigint'
        },
        semestrId:{
            type:'bigint'
        },
        year:{
            type:'integer'
        }


    }, {
        ifNotExists: true,
    });
};

exports.down = pgm => {
};
