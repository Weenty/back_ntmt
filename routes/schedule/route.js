const {checkAccessHook} = require("../../services/hooks");
const job = require('../../handlers/schedule/handler')
module.exports = function (fastify, opts, next) {
    fastify.addHook('onRequest', async (request, reply) => {
        return await checkAccessHook(request, reply);
    });

    fastify.route({
        method: 'POST',
        url: '/get_schedule',
        schema: {
            body: {
                type: 'object',
                properties: {
                    date: {
                        type: 'string',
                        pattern: '^\\d{2}\\.\\d{2}\\.\\d{4}$'
                      },
                    group: {type: 'string'}
                },
            },
            tags: ['schedule']
        },
        async handler(request, reply) {
            const data = await job.getUserSchedule(request.body, request.info, reply)
            return data
        }
    })


    fastify.route({
        method: 'POST',
        url: '/send_schedule',
        schema: {
            body: {
                type: 'object',
                properties: {
                    files: {
                        type: 'array',
                        items: fastify.getSchema('MultipartFileType')
                    }
                },
                required: ['files']
            },
            tags: ['schedule'],
            
        },
        async handler(request, reply) {
            const data = await job.sendSchedule(request.body, request.info, reply)
            return data
        }
    })


    next()
}