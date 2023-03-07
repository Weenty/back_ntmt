const {checkAccessHook} = require("../../services/hooks");
const job = require('../../handlers/schedule/handler')
module.exports = function (fastify, opts, next) {
    fastify.addHook('onRequest', async (request, reply) => {
        return await checkAccessHook(request, reply);
    });

    fastify.route({
        method: 'GET',
        url: '/get_schedule',
        
        async handler(request, reply) {
            const data = await job.getUserSchedule(request.info, reply)
            return data
        }
    })
    next()
}