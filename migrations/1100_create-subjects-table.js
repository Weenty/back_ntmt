/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('subjects', {
        id: {
            type: 'bigserial',
            primaryKey: true
        },
        name:{
            type:'varchar(500)'
        },
        summaryHours:{
            type:'int'
        },
        examType:{
            type:'int'
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
