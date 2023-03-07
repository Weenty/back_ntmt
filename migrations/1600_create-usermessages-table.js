/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('usermessages', {
        id: {
            type: 'bigserial',
            primaryKey: true
        },
        userId: {
            type: 'bigint'
        },
        messageId: {
            type: 'bigint'
        }
    }, {
        ifNotExists: true,
    });
};

exports.down = pgm => {
};
