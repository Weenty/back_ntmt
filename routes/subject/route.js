const job = require('../../handlers/subject/handler')
const {checkAccessHook} = require("../../services/hooks");
module.exports = function (fastify, opts, next) {
    fastify.addHook('onRequest', async (request, reply) => {
        return await checkAccessHook(request, reply);
    });
    fastify.route({
        method: 'POST',
        url: '/create',
        schema: {
            body: {
                type: 'object',
                properties: {
                    name: {type: 'string'},
                    teacherId: {type: 'integer'},
                    examType: {type: 'integer'},
                    hours: {type: 'integer'},
                },
                required: ['name', 'teacherId', 'hours', 'examType']
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
            const data = await job.addSubjct(request.body, request.info)
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
        url: '/delete',
        schema: {
            body: {
                type: 'object',
                properties: {
                    subjectId: {type: 'integer'}
                },
                required: ['subjectId']
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
            const data = await job.deleteSubject(request.body, request.info)
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