require('dotenv').config()
const pgpool = require('./services/libs/pgpool')
const constants = require('./services/constants')
const ldapClient = require('./services/libs/ldap')
const filesystem = require('./services/libs/filesystem')
const getSchedule = require('./services/libs/excelparser')
module.exports = {
    pool: pgpool.pool,
    constants: constants,
    ldapClient: ldapClient,
    filesystem: filesystem,
    getSchedule: getSchedule
}