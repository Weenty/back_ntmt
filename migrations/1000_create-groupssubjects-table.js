/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('groupssubjects', {
        id: {
            type: 'bigserial',
            primaryKey: true
        },
       groupId:{
            type:'bigint'
       },
        subjectId:{
            type:'bigint'
        }
    }, {
        ifNotExists: true,
    });
};

exports.down = pgm => {
};
