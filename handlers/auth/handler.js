const { pool, constants } = require("../../dependencies");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ldap = require("ldapjs");
const { v4: uuidv4 } = require('uuid')
// const ldapClient = ldap.createClient({
//     url: "ldap://172.16.0.10:389",
//   });
let userData;

async function authenticateDn(login, password, object) {
  let data = false;
  await ldapClient.bind(login, password, async (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Success");
      data = true;
      return data;
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
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();
  try {
    const querySelectLogin = `SELECT *
                                  FROM users
                                  WHERE login = $1`;
    const resSelectLogin = await client.query(querySelectLogin, [object.login]);
    if (resSelectLogin.rows.length === 0) {
      await client.query("BEGIN");

      let hashPassword;
      if (object.type != 1) {
        hashPassword = bcrypt.hashSync(object.password, 5);
      } else {
        hashPassword = bcrypt.hashSync(uuidv4(), 5)
      }
      const queryInsertUsers = `INSERT INTO users ("typesId", "login", "password", "groupId")
                                          VALUES ($1, $2, $3, $4)
                                          RETURNING *`;
      const resInsertUsers = await client.query(queryInsertUsers, [
        object.type,
        object.login,
        hashPassword,
        object.groupId,
      ]);
      if (resInsertUsers.rows.length > 0) {
        const queryInsertBios = `INSERT INTO bios ("name", "secondName", "patronomyc", "flura", "grant","userId")
                                             VALUES ($1, $2, $3, $4, $5, $6)`;
        const resInsertBios = await client.query(queryInsertBios, [
          object.name,
          object.secondName,
          object.patronomyc,
          object.flura,
          object.grant,
          resInsertUsers.rows[0].id,
        ]);

        if (resInsertUsers.rowCount > 0) {
          const queryInsertUserRole = `INSERT INTO userroles ("userId", "roleId")
                                                 VALUES ($1, $2)
                                                  RETURNING *`;

          const resInsertFolder = await client.query(
            `insert into folders ("id", "userId", "name", "folderId")
          values ((SELECT MAX(id) + 1 FROM folders),$1, $2, null)
          returning "id"`,
            [Number(resInsertUsers.rows[0].id), object.login]
          );
          if (
            resInsertFolder.rowCount === 0 ||
            resInsertFolder.rows.length === 0
          ) {
            await client.query("ROLLBACK");
            data = {
              message: "Ошибка при создания папки для пользователя",
              statusCode: 400,
            };
            console.log("ERROR: Ошибка при создания папки для пользователя");
            return data;
          }

          const resInsertUserRole = await client.query(queryInsertUserRole, [
            Number(resInsertUsers.rows[0].id),
            object.role,
          ]);
          if (resInsertUserRole.rows.length > 0) {
            await client.query("COMMIT");
            data = {
              message: Number(resInsertUsers.rows[0].id),
              statusCode: 200,
            };
          } else {
            await client.query("ROLLBACK");
            data = {
              message: "Ошибка при создании роли пользователя",
              statusCode: 400,
            };
            console.log("ERROR:Ошибка при роли пользователя");
          }
        } else {
          console.log(`Ошибка при создании био пользователя`);

          data = {
            message: "create user bio error",
            statusCode: 400,
          };
        }
      } else {
        await client.query("ROLLBACK");
        data = {
          message: "Ошибка при создании пользователя",
          statusCode: 400,
        };
        console.log("ERROR:Ошибка при создании пользователя");
      }
    } else {
      data = {
        message: "Пользователь с таким логином уже существует",
        statusCode: 400,
      };
    }
  } catch (e) {
    console.log(e);
  } finally {
    client.release();
    console.log("client.release");
  }
  return data;
}

async function login2(object, reply) {
  let data = {
    message: "",
    statusCode: 400,
  };

  const client = await pool.connect();


  try {
    const type = object.type; // Получаем тип пользователя
    const login = object.login;
    const password = object.password;

    if (type === constants.LOGIN_TYPES.activeDirectory) {
      const ldapClient1 = ldap.createClient({
        url: "LDAP://nuk-5142-017.edu.ntiustu.local",
      });

      const ldapClient2 = ldap.createClient({
        url: "LDAP://nuk-5142-018.ntiustu.local",
      });

      const args = await tryConnect(login, password, ldapClient1, ldapClient2,
        {
          baseDN: "dc=edu,dc=ntiustu,dc=local", opts: {
            filter: `(sAMAccountName=${login})`,
            // filter: `(department=ДТ)`,
            // filter: `(department=НТМТ)`,
            scope: "sub",
          }
        },
        {
          baseDN: "dc=ntiustu,dc=local", opts: {
            filter: `(sAMAccountName=${login})`,
            scope: "sub",
          }
        }, client
      );
      //todo: Сдеалть фильтр по департаменту через иф
      let GroupArr = args.description.split('-')
      if (GroupArr[0][0] === '_') {
        return ({
          message: "non-active user",
          statusCode: 403,
        })
      }
      let groupCode = `${GroupArr[0]}-${GroupArr[1]}`
      let displayName = args.displayName.split(' ');
      let roleId = 0
      if (RegExp('CN=AllowCreateStudents').test(args.memberOf)) {
        roleId = 4
      }
      if (RegExp('CN=Prepods').test(args.memberOf)) {
        roleId = 3
        groupCode = null
      }
      if (RegExp('CN=NTMT_PortalAdmin').test(args.memberOf)) {
        roleId = 1
        groupCode = null
      }
      if (roleId == 0) {
        return data
      }
      const name = displayName[1];
      const secondName = displayName[0];
      const patronomyc = displayName[2]
      const querySelectGroup = `SELECT *
                                          FROM groups
                                          WHERE "code" = $1`;
      const resSelectGroup = await client.query(querySelectGroup, [
        groupCode,
      ]);
      if ((resSelectGroup.rows.length > 0 && roleId == 4) || roleId == 1 || roleId == 3) {
        const querySelectBio = `SELECT *
                                            FROM bios
                                            WHERE "name" = $1
                                              AND "secondName" = $2`;
        const resSelectBio = await client.query(querySelectBio, [
          name,
          secondName,
        ]);
        if (resSelectBio.rows.length == 0) {
          let registerObject = {
            name: name,
            login: login,
            secondName: secondName,
            patronomyc: patronomyc,
            password: password,
            role: roleId,
            type: constants.LOGIN_TYPES.activeDirectory,
            groupId: resSelectGroup?.rows[0]?.id || null,
          };
          let registerData = await registration(registerObject);
          console.log(registerData);
          return (await login2(object))
        } else {
          const checkGroupForUser = await client.query(`SELECT g."code" FROM users u 
                                                        left join groups g on u."groupId" = g."id"
                                                        WHERE u."id"=$1`,[resSelectBio.rows[0].userId])
          if(checkGroupForUser.rows[0].code != groupCode && roleId == 4) {
            const updateGroup = await client.query(`UPDATE users SET "groupId" = $1 WHERE "id" = $2 RETURNING *`, [querySelectGroup.rows[0].id, resSelectBio.rows[0].userId])
          }
          const token = jwt.sign(
            {
              // sAMAccountName: login,
              roleId: roleId,
              userId: resSelectBio.rows[0].userId,
            },
            process.env.PRIVATE_KEY,
            {
              expiresIn: "24h",
            }
          );
          userData = {
            message: {token:token,
            roleId: roleId,
            fio: `${secondName} ${name} ${patronomyc}`},
            statusCode: 200,
            
          };
          return (userData);
        }
      } else {
        const ldapClient3 = ldap.createClient({
          url: "LDAP://nuk-5142-017.edu.ntiustu.local",
        });
        let GroupsArr = await parseGroups(ldapClient3, "EDU\\" + login, password, {
          baseDN: "dc=edu,dc=ntiustu,dc=local", opts: {
            // filter: `(department=НТМТ)`,
            filter: `(department=ДТ)`,
            scope: "sub",
            attributes: ["description"]
          }
        })
        for (let i = 0; i < GroupsArr.length; i++) {
          await client.query(`insert into groups ("groupName", "code", "typeOfStudyingId")
                                        values ($1, $2, $3)`, [GroupsArr[i], GroupsArr[i], GroupsArr[i].length > 2 ? 2:1])
        }
        return await login2(object)
      }

    } else if (type === constants.LOGIN_TYPES.loginPassword) {
      //Если пользователь авторизуется через нашу базу
      const querySelectUserByLogin = `SELECT u."password" ,
                                                   u."id",
                                                   concat_ws(' ', b."secondName", b."name", b."patronomyc") as "fio",
                                                   g."groupName"
                                            FROM users u
                                                     left join bios b on b."userId" = u.id
                                                     left join groups g on u."groupId" = g.id
                                            WHERE "login" = $1`;
      const resSelectUserByLogin = await client.query(querySelectUserByLogin, [
        login,
      ]);
      if (resSelectUserByLogin.rows.length > 0) {
        const userPassword = resSelectUserByLogin.rows[0].password;
        const userId = resSelectUserByLogin.rows[0].id;
        const fio = resSelectUserByLogin.rows[0].fio;
        const groupName = resSelectUserByLogin.rows[0].groupName;
        const querySelectRole = `SELECT *
                                         FROM userroles
                                         WHERE "userId" = $1`;
        const resSelectRole = await client.query(querySelectRole, [userId]);
        const roleId = resSelectRole.rows[0].roleId;
        if ((await bcrypt.compare(password, userPassword)) == true) {
          const token = await jwt.sign(
            { userId: userId, roleId: roleId },
            process.env.PRIVATE_KEY,
            {
              expiresIn: "24h",
            }
          );
          data = {
            message: {
              token: token,
              userId: +userId,
              roleId: +roleId,
              fio: fio,
              groupName: groupName,
            },
            statusCode: 200,
          }
          console.log(`Успешный вход для пользователя ${login}`);
          return data
        } else {
          data = {
            message: `Неверный пароль для пользователя: ${login}`,
            statusCode: 400,
          };
          return data
          console.log("Неверный пароль");
        }
      } else {
        data = {
          message: `Пользователя с логином ${login} не существует`,
          statusCode: 400,
        };
        return data
      }
    } else {
      data = {
        message: `Вход типа ${type} недоступен`,
        statusCode: 400,
      };
      return data
      console.log(`Вход типа ${type} недоступен`);
    }
  } catch (e) {
    console.log(e.message)
    return data
  } finally {
    client.release();
    console.log("client.release");
  }
}

async function tryConnect(login, password, ldapClient1, ldapClient2, searchParams1, searchParams2, client) {
  let data = {
    message: "",
    statusCode: 400,
  }
  try {
    // Попытка привязки к первому домену с логином в формате EDU\\login
    data = await tryBind(ldapClient1, "EDU\\" + login, password, searchParams1, client);
    console.log("Подключение к первому домену успешно");
    ldapClient2.unbind();
    return data
  } catch (err) {
    console.log("Подключение к первому домену не удалось:", err.message);
  }

  try {
    // Попытка привязки ко второму домену с логином в формате login@ntiustu.local
    data = await tryBind(ldapClient2, login + "@ntiustu.local", password, searchParams2, client);
    console.log("Подключение ко второму домену успешно");
    return data
  } catch (err) {
    console.log("Подключение ко второму домену не удалось:", err.message);
    return data
  }
  return {
    message: "Неправильный логин или пароль",
    statusCode: 400,
  }
}

function parseGroups(ldapClient, login, password, searchParams) {
  return new Promise((resolve, reject) => {
    ldapClient.bind(login, password, (err) => {
      if (err) {
        // Привязка не удалась
        reject(err);
      } else {
        // Привязка успешна
        // Выполнение поиска по LDAP с заданными параметрами
        ldapClient.search(searchParams.baseDN, searchParams.opts, (err, res) => {
          if (err) {
            // Поиск не удался
            reject(err);
          } else {
            // Поиск успешен
            // Обработка результатов поиска
            let EntyArr = []
            res.on('searchEntry', (entry) => {
              let GroupArr = entry.object.description.split('-')
              let groupCode = `${GroupArr[0]}-${GroupArr[1]}`
              if (!EntyArr.includes(groupCode)) {
                EntyArr.push(groupCode)
              }
            });
            res.on('error', (err) => {
              console.error('Ошибка поиска:', err.message);
              ldapClient.unbind();
            });
            res.on('end', (result) => {
              resolve(EntyArr);
              ldapClient.unbind();
            });
          }
        });
      }
    });
  });
}

function tryBind(ldapClient, login, password, searchParams, client) {
  return new Promise((resolve, reject) => {
    ldapClient.bind(login, password, (err) => {
      if (err) {
        // Привязка не удалась
        reject(err);
      } else {
        // Привязка успешна
        // Выполнение поиска по LDAP с заданными параметрами
        ldapClient.search(searchParams.baseDN, searchParams.opts, (err, res) => {
          if (err) {
            // Поиск не удался
            reject(err);
          } else {
            // Поиск успешен
            // Обработка результатов поиска
            res.on('searchEntry', (entry) => {
              resolve(entry.object);
            });
            res.on('error', (err) => {
              console.error('Ошибка поиска:', err.message);
              ldapClient.unbind();
            });
            res.on('end', (result) => {
              ldapClient.unbind();
            });
          }
        });
      }
    });
  });
}

module.exports = {
  registration: registration,
  login2: login2,
};
