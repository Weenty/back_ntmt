const job = require('../../handlers/typesofstudying/handler')
const {checkAccessHook} = require("../../services/hooks");

module.exports = function (fastify, opts, next) {
    fastify.addHook('onRequest', async (request, reply) => {
        return await checkAccessHook(request, reply);
    });

    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            tags: ['TypesOfStuding']
        },
        async handler(request, reply) {
            const data = await job.getTypes(request.body, request.info)
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