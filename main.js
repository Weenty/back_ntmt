const path = require('path');
const autoload = require('fastify-autoload');
const fastify = require('fastify')({
    logger: true,
});
const options = {
    addToBody: true,
    sharedSchemaId: '#MultipartFileType',
}
fastify.register(require('fastify-multipart'), options)
fastify.register(require('fastify-cors'), {
  origin: "*",
  methods: ["POST", "GET", "OPTIONS"]
})
// Регистрируем fastify-swagger плагин
fastify.register(require('fastify-swagger'), {
  routePrefix: '/documentation',
  swagger: {
    info: {
      title: 'Fastify API',
      description: 'API documentation for Fastify API',
      version: '1.0.0',
    },
    // Установите путь к вашим маршрутам
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here',
    },
    host: 'localhost:3001',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
  },
  exposeRoute: true,
});

fastify.register(autoload, {
    dir: path.join(__dirname, './routes'),
});
fastify.register(require('fastify-routes'))

// fastify.register(require('@fastify/multipart'))
fastify.listen(3001, '0.0.0.0', (err, address) => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    fastify.log.info(`server listening on ${address}`)
})
