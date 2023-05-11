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
            tags: ['recorkbook'],
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

    fastify.route({
        method: 'POST',
        url: '/get',
        schema: {
            body: {
                type: 'object',
                properties: {
                    userId: {type: 'integer'},
                }
            },
            tags: ['recorkbook'],
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
            const data = await job.selectRecordBook(request.body, request.info)
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
                    endMark: {type: 'string'},
                    date: {
                        type: 'string',
                        pattern: '^\\d{2}\\.\\d{2}\\.\\d{4}$'
                      },
                    userId: {type: 'integer'},
                    subjectId: {type: 'integer'}, 
                    semestrId: {type: 'integer'},
                    year: {
                        type: 'integer',
                        maximum: 9999,
                        minimum: 1000
                      }
                    
                },
                required: ['endMark', 'date', 'userId', 'subjectId', 'semestrId', 'year']
            },
            tags: ['recorkbook'],
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
            const data = await job.createRecordBook(request.body, request.info)
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
                    recordId: {type: 'integer'}
                },
                required: ['recordId']
            },
            tags: ['recorkbook'],
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
            const data = await job.deleteRecordBook(request.body, request.info)
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
                    recordId: {type: 'integer'},
                    endMark: {type: 'string'},
                    date: {
                        type: 'string',
                        pattern: '^\\d{2}\\.\\d{2}\\.\\d{4}$'
                      },
                    userId: {type: 'integer'},
                    subjectId: {type: 'integer'}, 
                    semestrId: {type: 'integer'},
                    year: {
                        type: 'integer',
                        maximum: 9999,
                        minimum: 1000
                      }
                    
                },
                required: ['recordId']
            },
            tags: ['recorkbook'],
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
            const data = await job.updateRecordBook(request.body, request.info)
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