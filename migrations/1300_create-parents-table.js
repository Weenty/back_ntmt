/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('parents', {
        id: {
            type: 'bigserial',
            primaryKey: true
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
