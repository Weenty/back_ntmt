const {checkAccessHook} = require("../../services/hooks");
const job = require('../../handlers/account/handler')

module.exports = function (fastify, opts, next) {
    fastify.addHook('onRequest', async (request, reply) => {
        return await checkAccessHook(request, reply);
    });

    fastify.route({
        url:'/user/info',
        method:'POST',
        async handler(request,reply){
            const data = await job.showUserInfo(request.body,request.info)
            if(data.statusCode !== 200){
                reply.status(400)
            }
            reply.send(data)
        }
    })

    next()
}