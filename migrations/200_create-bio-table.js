/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('bios', {
        id: {
            type: 'bigserial',
            primaryKey: true
        },
        name: {
            type: 'varchar(500)',
            required: true
        },
        secondName: {
            type: 'varchar(500)',
            required: true
        },
        patronomyc: {
            type: 'varchar(500)'
        },
        flura: {
            type: 'timestamp with time zone',
            default: pgm.func('now()')
        },
        grant: {
            type: 'integer'
        },
        userId:{
            type:'bigint'
        }
    }, {
        ifNotExists: true,
    });
};

exports.down = pgm => {
};
