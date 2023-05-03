const job = require('../../handlers/semesters/handler')
const {checkAccessHook} = require("../../services/hooks");
module.exports = function (fastify, opts, next) {
    fastify.addHook('onRequest', async (request, reply) => {
        return await checkAccessHook(request, reply);
    });

    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            tags: ['semesters'],
        },
        async handler(request, reply) {
            const data = await job.getSemesters(request.info)
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
        url: '/create',
        schema: {
            body: {
                type: 'object',
                properties: {
                    value: {type: 'string'},
                },
                required: ['value']
            },
            tags: ['semesaters'],
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
            const data = await job.addSemester(request.body, request.info)
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
                    semesterId: {type: 'integer'}
                },
                required: ['semesterId']
            },
            tags: ['semesaters'],
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
            const data = await job.deleteSemester(request.body, request.info)
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
        url: '/update',
        schema: {
            body: {
                type: 'object',
                properties: {
                    semesterId: {type: 'integer'},
                    value: {type: 'string'},
                },
                required: ['semesterId', 'value']
            },
            tags: ['semesaters'],
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
            const data = await job.updateSemester(request.body, request.info)
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