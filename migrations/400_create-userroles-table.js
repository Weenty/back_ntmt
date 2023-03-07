/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('userroles', {
        id: {
            type: 'bigserial',
            primaryKey: true
        },
        userId:{
            type:'bigint'
        },
        roleId:{
            type:'bigint'
        }
    }, {
        ifNotExists: true,
    });
};

exports.down = pgm => {
};
