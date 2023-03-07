const {pool, constants} = require('../../dependencies')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const ldap = require('ldapjs')
// const ldapClient = ldap.createClient({
//     url: 'ldap://192.168.43.230:389'
// })
const eventEmmiter = require('events')
const emmiter = new eventEmmiter()

let userData

async function authenticateDn(login, password, object) {
    let data = false
    await ldapClient.bind(login, password, async (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log('Success')
            data = true
            return data
        }
    });
}

// function search() {
//     let data
//     var opts = {
//         filter: '(sAMAccountName=snowflake)',
//         scope: 'sub',
//         // attributes: ['dc', 'dn', 'sn', 'cn', 'sAMAccountName'],
//     };
//     ldapClient.search('dc=ntmt,dc=local', opts, function (err, res) {
//         if (err) {
//             console.log("Error in search " + err)
//         } else {
//             res.on('searchEntry', function (entry) {
//                 // console.log('entry: ' + JSON.stringify(entry.object));
//                 data = JSON.stringify(entry.object)
//                 console.log(data)
//                 return data
//             });
//             res.on('searchReference', function (referral) {
//                 console.log('referral: ' + referral.uris.join());
//             });
//             res.on('error', function (err) {
//                 console.error('error: ' + err.message);
//             });
//             res.on('end', function (result) {
//                 console.log('status: ' + result.status);
//             });
//         }
//     });
//
// }
//
// async function addUser() {
//     var newDN = "cn=new guy2,ou=USERS,ou=NTMT,dc=ntmt,dc=local";
//     var newUser = {
//         cn: 'new guy2',
//         sn: 'guy2',
//         mail: 'nguy2@example.org',
//         objectClass: ["top", "person", "organizationalPerson", "user"],
//         userPassword: 'q20047878qQ',
//         sAMAccountName: 'newguy2',
//         userPrincipalName: 'newguy2@ntmt.local'
//     }
//     ldapClient.add(newDN, newUser, (err, res) => {
//         if (err) {
//             console.log(err)
//         } else {
//             console.log(res.status)
//         }
//     });
// }

async function registration(object) {
    let data = {
        message: '',
        statusCode: 400
    }
    const client = await pool.connect()
    try {
        //Проверяем, занят ли логин
        const querySelectLogin = `SELECT *
                                  FROM users
                                  WHERE login = $1`
        const resSelectLogin = await client.query(querySelectLogin,
            [
                object.login
            ])
        if (resSelectLogin.rows.length === 0) {
            await client.query('BEGIN')

                let hashPassword
                if (object.type != 1) {
                    hashPassword = bcrypt.hashSync(object.password, 5)
                } else {
                    hashPassword = object.password
                }
                const queryInsertUsers = `INSERT INTO users ("typesId", "login", "password", "groupId")
                                          VALUES ($1, $2, $3, $4)
                                          RETURNING *`
                const resInsertUsers = await client.query(queryInsertUsers,
                    [
                        object.type,
                        object.login,
                        hashPassword,
                        object.groupId
                    ])
                if (resInsertUsers.rows.length > 0) {
                    const queryInsertBios = `INSERT INTO bios ("name", "secondName", "patronomyc", "flura", "grant","userId")
                                             VALUES ($1, $2, $3, $4, $5, $6)`
                    const resInsertBios = await client.query(queryInsertBios,
                        [
                            object.name,
                            object.secondName,
                            object.patronomyc,
                            object.flura,
                            object.grant,
                            resInsertUsers.rows[0].id
                        ])
                        console.log(444444)
                    if(resInsertUsers.rowCount > 0){
                        const queryInsertUserRole = `INSERT INTO userroles ("userId", "roleId")
                                                 VALUES ($1, $2)
                                                 RETURNING *`
                        const resInsertUserRole = await client.query(queryInsertUserRole,
                            [
                                Number(resInsertUsers.rows[0].id),
                                object.role
                            ])
                        if (resInsertUserRole.rows.length > 0) {
                            await client.query('COMMIT')
                            data = {
                                message: 'success',
                                statusCode: 200
                            }
                        } else {
                            await client.query('ROLLBACK')
                            data = {
                                message: 'Ошибка при создании роли пользователя',
                                statusCode: 400
                            }
                            console.log('ERROR:Ошибка при роли пользователя')
                        }

                    }else{
                        console.log(`Ошибка при создании био пользователя`)

                        data = {
                            message:'create user bio error',
                            statusCode: 400
                        }
                    }
                } else {
                    await client.query('ROLLBACK')
                    data = {
                        message: 'Ошибка при создании пользователя',
                        statusCode: 400
                    }
                    console.log('ERROR:Ошибка при создании пользователя')
                }
        } else {
            data = {
                message: 'Пользователь с таким логином уже существует',
                statusCode: 400
            }
        }
    } catch (e) {
        console.log(e)
    } finally {
        client.release()
        console.log('client.release')
    }
    return data
}

async function login2(object, reply) {
    let data = {
        message: '',
        statusCode: 400
    }

    const client = await pool.connect()
    try {
        const type = object.type // Получаем тип пользователя
        const login = object.login
        const password = object.password
        if (type === constants.LOGIN_TYPES.activeDirectory) { // Если пользователь авторизуется через active directory
            let check = false
            ldapClient.bind('ntmt\\' + `Администратор`, password, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log('Success')
                    check = true
                }
                console.log(check)
                if (check == true) {
                    var opts = {
                        filter: `(sAMAccountName=${login})`,
                        scope: 'sub',
                    };
                    ldapClient.search('dc=ntmt,dc=local', opts, function (err, res) {
                        if (err) {
                            console.log("Error in search " + err)
                        } else {
                            res.on('searchEntry', function (entry) {
                                emmiter.emit('searchEntry', entry.object, reply)
                            });
                            res.on('error', function (err) {
                                console.error('error: ' + err.message);
                            });
                        }
                    });
                } else {
                    console.log('Ошибка при авторизации')
                }
            });
            emmiter.on('searchEntry', async (args, reply) => {
                console.log(args)
                const groupCode = args.department
                const name = args.givenName
                const secondName = args.sn
                const querySelectGroup = `SELECT *
                                          FROM groups
                                          WHERE "code" = $1`
                const resSelectGroup = await client.query(querySelectGroup,
                    [
                        groupCode
                    ])
                if (resSelectGroup.rows.length > 0) {
                    const querySelectBio = `SELECT *
                                            FROM bios
                                            WHERE "name" = $1
                                              AND "secondName" = $2`
                    const resSelectBio = await client.query(querySelectBio,
                        [
                            name,
                            secondName
                        ])
                    if (resSelectBio.rows.length == 0) {
                        let registerObject = {
                            name: name,
                            secondName: secondName,
                            type: constants.LOGIN_TYPES.activeDirectory,
                            groupId: resSelectGroup.rows[0].id
                        }
                        let registerData = await registration(registerObject)
                        console.log(registerData)
                        await login2(object, reply)
                    } else {
                        const token = await jwt.sign(
                            {
                                sAMAccountName: args.sAMAccountName,
                                userId: resSelectBio.rows[0].userId
                            },
                            process.env.PRIVATE_KEY, {
                                expiresIn: '24h'
                            })
                        userData = {
                            message: token,
                            statusCode: 200
                        }
                        await reply.send(userData)
                    }
                } else {
                    data = {
                        message: 'Группы с таким номером не существует',
                        statusCode: 400
                    }
                }

            })
            return userData
        } else if (type === constants.LOGIN_TYPES.loginPassword) { //Если пользователь авторизуется через нашу базу
            const querySelectUserByLogin = `SELECT u."password" ,
                                                   u."id",
                                                   concat_ws(' ', b."secondName", b."name", b."patronomyc") as "fio",
                                                   g."groupName"
                                            FROM users u
                                                     left join bios b on b."userId" = u.id
                                                     left join groups g on u."groupId" = g.id
                                            WHERE "login" = $1`
            const resSelectUserByLogin = await client.query(querySelectUserByLogin,
                [
                    login
                ])
            if (resSelectUserByLogin.rows.length > 0) {
                const userPassword = resSelectUserByLogin.rows[0].password
                const userId = resSelectUserByLogin.rows[0].id
                const fio = resSelectUserByLogin.rows[0].fio
                const groupName = resSelectUserByLogin.rows[0].groupName
                const querySelectRole = `SELECT *
                                         FROM userroles
                                         WHERE "userId" = $1`
                const resSelectRole = await client.query(querySelectRole,
                    [
                        userId
                    ])
                const roleId = resSelectRole.rows[0].roleId
                if (await bcrypt.compare(password, userPassword) == true) {
                    const token = await jwt.sign({userId: userId, roleId: roleId}, process.env.PRIVATE_KEY, {
                        expiresIn: '24h'
                    })
                    reply.send({
                        message: {
                            token: token,
                            userId: +userId,
                            roleId: +roleId,
                            fio:fio,
                            groupName:groupName
                        },
                        statusCode: 200
                    })
                    console.log(`Успешный вход для пользователя ${login}`)
                } else {
                    data = {
                        message: `Неверный пароль для пользователя: ${login}`,
                        statusCode: 400
                    }
                    console.log('Неверный пароль')
                }
            } else {
                data = {
                    message: `Пользователя с логином ${login} не существует`,
                    statusCode: 400
                }
                console.log(`Ошибка при нахождении пользователя с логином ${login}`)
            }
        } else {
            data = {
                message: `Вход типа ${type} недоступен`,
                statusCode: 400
            }
            console.log(`Вход типа ${type} недоступен`)
        }
    } catch
        (e) {
        console.log(e)
    } finally {
        client.release()
        console.log('client.release')
    }
    return data
}

module.exports = {
    registration: registration,
    login2: login2,
}

