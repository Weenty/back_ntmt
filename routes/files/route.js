const {checkAccessHook} = require("../../services/hooks");
const {constants} = require('../../dependencies')
const job = require('../../handlers/files/handler')
module.exports = function (fastify, opts, next) {
    fastify.addHook('onRequest', async (request, reply) => {
        return await checkAccessHook(request, reply);
    });

    fastify.route({
        method: 'POST',
        url: '/upload',
        schema: {
            body: {
                type: 'object',
                properties: {
                    folderId: {type: 'integer'},
                    files: {
                        type: 'array',
                        items: fastify.getSchema('MultipartFileType')
                    }
                },
                required: ['folderId']
            },
            response: {
                400: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string'
                        },
                        statusCode: {
                            type: 'integer'
                        }
                    }
                }
            }
        },
        async handler(request, reply) {
            const data = await job.uploadFiles(request.body, request.info)
            if (data.statusCode == 200) {
                reply.status(200)
                return data
            } else {
                reply.status(400)
                return data
            }
        }
    }) // Загрузка

    fastify.route({
        method: 'POST',
        url: '/get_all',
        schema: {
            response: {
                400: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string'
                        },
                        statusCode: {
                            type: 'integer'
                        }
                    }
                }
            }
        },
        async handler(request, reply) {
            const data = await job.getUserFiles(request.body, request.info)
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
        url:'/download',
        method:'POST',
        schema:{
            body:{
                type:'object',
                properties:{
                    fileId:{type:'integer'}
                },
                required:['fileId']
            }
        },
        async handler(request,reply){
            const data = await job.downloadFile(request.body,request.info)
            if(data.statusCode === 200){
                const type = data.message.fileType
                if(type === constants.FILE_TYPES.word){
                    reply.header('Content-Type',' application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                }else if (type === constants.FILE_TYPES.excel){
                    reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                }else if( type === constants.FILE_TYPES[".txt"]){
                    reply.header('Content-Type', 'text/plain');
                }
                reply.send(data.message.buffer)
            }else{
                reply.send({message:'error',statusCode:400})
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
                    fileId: {type: 'integer'}
                },
                required: ['fileId']
            },
            response: {
                400: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string'
                        },
                        statusCode: {
                            type: 'integer'
                        }
                    }
                }
            }
        },
        async handler(request, reply) {
            const data = await job.deleteFiles(request.body, request.info)
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
        url: '/create_folder',
        schema: {
            body: {
                type: 'object',
                properties: {
                    name: {type: 'string'},
                    folderId: {type: 'integer'}
                }
            },
            response: {
                400: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string'
                        },
                        statusCode: {
                            type: 'integer'
                        }
                    }
                }
            }
        },
        async handler(request, reply) {
            const data = await job.createFolder(request.body, request.info)
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
        url: '/delete_folder',
        schema: {
            body: {
                type: 'object',
                properties: {
                    folderId: {type: 'integer'}
                },
                required: ['folderId']
            },
            response: {
                400: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string'
                        },
                        statusCode: {
                            type: 'integer'
                        }
                    }
                }
            }
        },
        async handler(request, reply) {
            const data = await job.deleteFolder(request.body, request.info)
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
        url: '/get_struct',
        schema: {
            body: {
                type: 'object',
                properties: {
                    folderId: {type: 'integer'}
                },
                required: ['folderId']
            },
            response: {
                400: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string'
                        },
                        statusCode: {
                            type: 'integer'
                        }
                    }
                }
            }
        },
        async handler(request, reply) {
            let folderId = request.body.folderId
            const data = await job.getFolderStruct(request.body, request.info)
            if (data.statusCode) {
                reply.status(data.statusCode)
                return data
            }
            else {
                reply.status(200)
                return {
                    message: data,
                    statusCode: 200,
                }
            }

        }
    })

    next()
}