const {pool,constants} = require('../../dependencies')

async function showUserInfo(object,user){
    let data = {
        message:'error',
        statusCode:400
    }
    const client = await pool.connect()
    try {
        const info = await client.query(`SELECT u."id"::integer as "userId",u2."roleId"::integer,
                                                concat_ws(' ', b."secondName", b."name", b."patronomyc") as "fio",
                                                g."groupName"
                                         FROM users u
                                                  left join bios b on u."id" = b.id
                                                  left join groups g on u."groupId" = g.id
                                                    inner join userroles u2 on b."userId" = u2."userId"
                                         WHERE u."id" = $1`, [user.userId])
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
        console.log(e)
    }finally {
        client.release()
    }
    return data
}

module.exports = {
    showUserInfo:showUserInfo,
}