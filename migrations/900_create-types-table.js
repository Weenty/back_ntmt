/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('logintypes', {
        id: {
            type: 'bigserial',
            primaryKey: true
        },
        type:{
            type:'varchar(150)',
            comment:'вход через active directory или логин+пароль'
        }
    }, {
        ifNotExists: true,
    });
};

exports.down = pgm => {
};
