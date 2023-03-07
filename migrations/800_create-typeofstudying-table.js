/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('typesofstudying', {
        id: {
            type: 'bigserial',
            primaryKey: true
        },
        type:{
            type:'varchar(500)'
        }
    }, {
        ifNotExists: true,
    });
};

exports.down = pgm => {
};
