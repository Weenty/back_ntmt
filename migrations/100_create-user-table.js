/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('users', {
        id: {
            type: 'bigserial',
            primaryKey: true
        },
        typesId: {
            type: 'bigint'
        },
        login: {
            type: 'varchar(500)',
            unique: true
        },
        password: {
            type: 'varchar(500)'
        },
        groupId:{
            type:'bigint'
        }
    }, {
        ifNotExists: true,
    });
};

exports.down = pgm => {
};
