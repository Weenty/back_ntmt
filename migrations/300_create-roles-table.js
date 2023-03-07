/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('roles', {
        id: {
            type: 'bigserial',
            primaryKey: true
        },
        value:{
            type:'varchar(250)'
        }
    }, {
        ifNotExists: true,
    });
};

exports.down = pgm => {
};
