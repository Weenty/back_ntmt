/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('files', {
        id: {
            type: 'bigserial',
            primaryKey: true
        },
        userId: {
            type: 'bigint'
        },
        fileType: {
            type: 'bigint'
        },
        filePath:{
            type:'varchar(500)'
        },
        fileMeta:{
            type:'jsonb'
        },
        createdAt:{
            type:'timestamp with time zone',
            default:pgm.func('now()')
        },
        updatedAt:{
            type:'timestamp with time zone',
            default: pgm.func('now()')
        }
    }, {
        ifNotExists: true,
    });
};

exports.down = pgm => {
};
