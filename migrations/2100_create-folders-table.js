/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('folders', {
        id: {
            type: 'bigserial',
            primaryKey: true
        },
        userId: {
            type: 'bigint'
        },
        name:{
            type:'varchar(500)'
        },
        folderId: {
            type: 'bigint'
        }
    }, {
        ifNotExists: true,
    });
};

exports.down = pgm => {
};
