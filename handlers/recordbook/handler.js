const {pool} = require("../../dependencies");

async function getRecordBook(object, user) {
    let data = {
        message: '',
        statusCode: 400
    }
    const client = await pool.connect()
    const userId = user.userId
    try {
        const querySelectRecordBook = `SELECT r."endMark",
                                              r."date",
                                              s."name",
                                              s."summaryHours",
                                              et."value",
                                              b."name",
                                              b."secondName",
                                              b."patronomyc",
                                              g."groupName",
                                              g."typeOfStudyingId"
                                       FROM recordbooks r
                                                INNER JOIN subjects s on r."subjectId" = s."id"
                                                INNER JOIN examtypes et on s."examType" = et.id
                                                INNER JOIN users u on r."userId" = u.id
                                                INNER JOIN bios b on u."bioId" = b.id
                                                inner join groups g on u."groupId" = g.id
                                       WHERE r."userId" = $1
                                         AND r."semestrId" = $2
                                         AND r.year = $3`
        const resSelectRecordBook = await client.query(querySelectRecordBook,
            [
                userId,
                object.semestrId,
                object.year
            ])
        if (resSelectRecordBook.rows.length > 0) {
            data = {
                message: resSelectRecordBook.rows,
                statusCode: 200
            }
        } else {
            data = {
                message: 'Ошибка при получении информации о зачетке',
                statusCode: 400
            }
            console.log('Ошибка при получении информации о зачетке')
        }
    } catch (e) {
        console.log(e)
    } finally {
        client.release()
        console.log('client.release()')
    }
    return data
}

module.exports = {
    getRecordBook: getRecordBook
}