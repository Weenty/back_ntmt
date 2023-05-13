const job = require('../../handlers/messages/handler')
const {checkAccessHook} = require("../../services/hooks");

module.exports = function (fastify, opts, next) {
    fastify.addHook('onRequest', async (request, reply) => {
        return await checkAccessHook(request, reply);
    });

    fastify.route({
        method: 'POST',
        url: '/get_all_messages/:list',
        schema: {
            params: {
                type: 'object',
                properties: {
                    list: {type: 'string'}
                }
            },
            tags: ['messages']
        },
        async handler(request, reply) {
            const list = request.params.list
            const data = await job.getMessages(request.body, request.info, list)
            if (data.statusCode == 200) {
                reply.status(200)
                return data
            } else {
                reply.status(400)
                return data
            }
        }
    })//Получение всех сообщений пользователя

    fastify.route({
        method: 'POST',
        url: '/get_info_about_message/:id',
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: {type: 'string'}
                }
            },
            tags: ['messages']
        },
        async handler(request, reply) {
            const id = request.params.id
            const data = await job.getInfoAboutMessage(request.body, request.info, id)
            if (data.statusCode == 200) {
                reply.status(200)
                return data
            } else {
                reply.status(400)
                return data
            }
        }
    })//Получение информации о сообщении
    

    fastify.route({
        method: 'POST',
        url: '/create_message',
        schema: {
            body: {
                type: 'object',
                properties: {
                    title: {type: 'string'},
                    text: {type: 'string'},
                    userid: {type: 'array'}
                },
                required: ['title', 'text', 'userid']
            },
            tags: ['messages']
        },
        async handler(request, reply) {
            const data = await job.createMessage(request.body, request.info)
            if (data.statusCode == 200) {
                reply.status(200)
                return data
            } else {
                reply.status(400)
                return data
            }
        }
    })
    

    fastify.route({
        method: 'POST',
        url: '/disable_views',
        schema: {
            body: {
                type: 'object',
                properties: {
                    listMessages: {type: 'array'},
                },
                required: ['listMessages']
            },
            tags: ['messages']
        },
        async handler(request, reply) {
            const data = await job.disableView(request.body, request.info)
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