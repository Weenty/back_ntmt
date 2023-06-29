const job = require('../../handlers/clear/handler')
const {checkAccessHook} = require("../../services/hooks");
module.exports = function (fastify, opts, next) {
    fastify.addHook('onRequest', async (request, reply) => {
        return await checkAccessHook(request, reply);
    });

    fastify.route({
        method: 'DELETE',
        url: '/:id',
        schema: {
            params: {
                type: "object",
                properties: {
                  id: { type: ["integer", "string"] },
                },
              },
            tags: ['FULL CLEAR USER DATA'],
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
            const id = request.params.id;
            const data = await job.deleteUser(request.body, request.info, id)
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