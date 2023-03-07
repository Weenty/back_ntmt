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
fastify.register(autoload, {
    dir: path.join(__dirname, './routes'),
});
fastify.register(require('fastify-routes'))
fastify.register(require('fastify-cors'), {})
// fastify.register(require('@fastify/multipart'))
fastify.listen(3001, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    fastify.log.info(`server listening on ${address}`)
})


