/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('groups', {
        id: {
            type: 'bigserial',
            primaryKey: true
        },
        groupName:{
            type:'varchar(500)'
        },
        code:{
            type:'varchar(250)',
            comment:'Типа ИсИТ'
        },
        typeOfStudyingId:{
            type:'int',
            comment:'очка/заочка и тд'
        }
    }, {
        ifNotExists: true,
    });
};

exports.down = pgm => {
};
