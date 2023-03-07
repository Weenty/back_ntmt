const job = require('../../handlers/recordbook/handler')
const {checkAccessHook} = require("../../services/hooks");
module.exports = function (fastify, opts, next) {
    fastify.addHook('onRequest', async (request, reply) => {
        return await checkAccessHook(request, reply);
    });
    fastify.route({
        method: 'POST',
        url: '/get_info',
        schema: {
            body: {
                type: 'object',
                properties: {
                    semestrId: {type: 'integer'},
                    year: {type: 'integer'}
                }
            },
            response: {
                400: {
                    type: 'object',
                    properties: {
                        message: {type: 'string'},
                        statusCode: {type: 'integer'}
                    }
                }
            }
        },
        async handler(request, reply) {
            const data = await job.getRecordBook(request.body, request.info)
            if (data.statusCode == 200) {
                reply.status(200)
                return data
            } else {
                reply.status(400)
                return data
            }
        }
    })

    next()
}