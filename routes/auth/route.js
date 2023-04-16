const job = require('../../handlers/auth/handler')
module.exports = function (fastify, opts, next) {

    // fastify.route({
    //     method: 'POST',
    //     url: '/registration',
    //     schema: {
    //         body: {
    //             type: 'object',
    //             properties: {
    //                 name: {
    //                     type: 'string'
    //                 },
    //                 secondName: {
    //                     type: 'string'
    //                 },
    //                 patronomyc: {
    //                     type: 'string'
    //                 },
    //                 flura: {
    //                     type: 'string'
    //                 },
    //                 grant: {
    //                     type: 'integer'
    //                 },
    //                 type: {
    //                     type: 'integer'
    //                 },
    //                 groupId: {
    //                     type: 'integer'
    //                 },
    //                 login: {
    //                     type: 'string'
    //                 },
    //                 password: {
    //                     type: 'string'
    //                 }
    //             },
    //             required: ["name", "secondName", "patronomyc"]
    //         },
    //     },
    //     async handler(request, reply) {
    //         const data = await job.registration(request.body)
    //         if (data.statusCode === 200) {
    //             reply.status(200)
    //             return data
    //         } else {
    //             reply.status(400)
    //             return data
    //         }
    //     }
    // }) // Регистрация

    fastify.route({
        method: 'POST',
        url: '/login',
        schema: {
            body: {
                type: 'object',
                properties: {
                    type: {type: 'integer'},
                    login: {type: 'string'},
                    password: {type: 'string'}
                },
                required: ["type", "login", "password"]
            },
            tags: ['Authentication']
        },
        async handler(request, reply) {
            if(request.body.type == 1){
              return  await job.login2(request.body,reply)
            }
            const data = await job.login2(request.body,reply)
            if (data.statusCode == 200) {
                reply.status(200)
                return data
            } else {
                reply.status(400)
                return data
            }
        }
    }) //Авторизация

    next()
}