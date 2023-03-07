/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('userparetns', {
        id: {
            type: 'bigserial',
            primaryKey: true
        },
        userId:{
            type:'bigint'
        },
        parentId:{
            type:'bigint'
        }
    }, {
        ifNotExists: true,
    });
};

exports.down = pgm => {
};
