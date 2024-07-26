const {pool,constants} = require('../../dependencies')

async function showUserInfo(object,user){
    let data = {
        message:'error',
        statusCode:400
    }
    console.log(user.userId)
    const client = await pool.connect()
    try {
        let infoQuery = ''
        if (user.roleId == 1 || user.roleId == 3) {
            infoQuery = `SELECT u."id"::integer as "userId",u2."roleId"::integer,
            concat_ws(' ', b."secondName", b."name", b."patronomyc") as "fio",
            g."groupName", g."code"
     FROM users u
              left join bios b on b."userId" = u.id
              left join groups g on u."groupId" = g.id
                inner join userroles u2 on b."userId" = u2."userId"
     WHERE u."id" = $1`
        }
        else {
            infoQuery = `SELECT u."id"::integer as "userId",u2."roleId"::integer,
        concat_ws(' ', b."secondName", b."name", b."patronomyc") as "fio",
        g."groupName", g."code", t."type"
 FROM users u
          left join bios b on b."userId" = u.id
          left join groups g on u."groupId" = g.id
            inner join userroles u2 on b."userId" = u2."userId"
            inner join typesofstudying t on g."typeOfStudyingId" = t.id
 WHERE u."id" = $1`
        }
        const info = await client.query(infoQuery, [user.userId])
        if(info.rows.length > 0){
            data = {
                message:info.rows[0],
                statusCode: 200
            }
        }else{
            data = {
                message:'get user info error',
                statusCode: 400
            }
        }
    }catch (e) {
        console.log(e.message, e.stack)
    }finally {
        client.release()
    }
    return data
}

module.exports = {
    showUserInfo:showUserInfo,
}
