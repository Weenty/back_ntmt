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
        },
        view: {
            type: 'integer',
            default: 1
        }
    }, {
        ifNotExists: true,
    });
};

exports.down = pgm => {
};
