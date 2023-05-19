const job = require('../../handlers/groups/handler')
const {checkAccessHook} = require("../../services/hooks");

module.exports = function (fastify, opts, next) {
    fastify.addHook('onRequest', async (request, reply) => {
        return await checkAccessHook(request, reply);
    });

    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            tags: ['groups']
        },
        async handler(request, reply) {
            const data = await job.getGroups(request.body, request.info)
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
        method: "GET",
        url: "/:group",
        schema: {
          params: {
            type: "object",
            properties: {
              id: { type: ["integer", "string"] },
            },
          },
          tags: ["groups"],
        },
        async handler(request, reply) {
          const group = request.params.group;
          const data = await job.getStudentsByGroup(group, request.info);
          if (data.statusCode == 200) {
            reply.status(200);
            return data;
          } else {
            reply.status(400);
            return data;
          }
        },
      });

      fastify.route({
        method: 'POST',
        url: '/get_subjects',
        schema: {
            body: {
                type: 'object',
                properties: {
                    groupId: {type: 'integer'}
                },
                required: ['groupId']
            },
            tags: ['groups'],
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
            const data = await job.getGroupsSubject(request.body, request.info)
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
        url: '/add_subjects_for_group',
        schema: {
            body: {
                type: 'object',
                properties: {
                    groupId: {type: 'integer'},
                    subjects: {type: 'array'}
                },
                required: ['groupId','subjects']
            },
            tags: ['groups'],
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
            const data = await job.addSubjctsForGroups(request.body, request.info)
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
        url: '/delete_subject',
        schema: {
            body: {
                type: 'object',
                properties: {
                    subjectGroupId: {type: 'integer'}
                },
                required: ['subjectGroupId']
            },
            tags: ['groups'],
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
            const data = await job.deleteSubjectForGroup(request.body, request.info)
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