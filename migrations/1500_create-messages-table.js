/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('messages', {
        id: {
            type: 'bigserial',
            primaryKey: true
        },
        title:{
            type:'varchar(150)'
        },
        text:{
            type:'varchar(500)'
        },
        date:{
            type:'timestamp with time zone',
            default: pgm.func('now()')
        },
        author:{
            type:'bigint'
        }
    }, {
        ifNotExists: true,
    });
    
};

exports.down = pgm => {
};
