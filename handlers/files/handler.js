const {filesystem, pool, constants} = require('../../dependencies');
const fs = require('fs')
async function uploadFiles(object, user) {
    let data = {
        message: '',
        statusCode: 400
    }
    const client = await pool.connect()
    let uploadsFiles = []
    let wasBegin = false
    try {
        console.log(object.files.length)
        const queryInsertFiles = `INSERT INTO files ("userId", "fileType", "filePath", "fileMeta")
                                  VALUES ($1, $2, $3, $4)
                                  RETURNING *`
        await client.query('BEGIN')
        wasBegin = true
        for (let i = 0; i < object.files.length; i++) {
            try{
                console.log(object.files[i])
                const upload = filesystem.uploadFile(filesystem.userFiles, object.files[i], {
                    customStr: "u" + user.userId,
                    customMIME: constants.FILE_TYPES
                })
                if(upload.success){
                    const resInsertFiles = await client.query(queryInsertFiles,
                        [
                            user.userId,
                            object.fileType,
                            upload.path,
                            {fileName:object.files[i].filename.split('.')[0]}
                        ])
                    uploadsFiles.push(resInsertFiles.rows[0])
                }else{
                     data = {
                        message:upload.message,
                        statusCode: 400
                    }
                }
            }catch (e) {
                console.log(e)
                 data = {
                    message:e.message,
                    statusCode: 400
                }
            }
        }
        if (uploadsFiles.length === object.files.length) {
            await client.query('COMMIT')
            data = {
                message: uploadsFiles,
                statusCode: 200
            }
        } else {
            await client.query('ROLLBACK')
            data = {
                message: 'Ошибка',
                statusCode: 400
            }
        }
    } catch (e) {
        if(wasBegin){
            await client.query('ROLLBACK')
        }
        data = {
            message: e.message,
            statusCode: 400
        }
    } finally {
        client.release()
    }
    return data
}

async function getUserFiles(object, user) {
    let data = {
        message: '',
        statusCode: 400
    }
    const client = await pool.connect()
    try {
        const querySelectFiles = `SELECT "fileType"::integer,substring("filePath",2,length("filePath")) as "filePath",("fileMeta"->'fileName')::text as "fileName",id::integer
                                  FROM files
                                  WHERE "userId" = $1`
        const resSelectFiles = await client.query(querySelectFiles,
            [
                user.userId
            ])
        if (resSelectFiles.rows.length > 0) {
            data = {
                message: resSelectFiles.rows,
                statusCode: 200
            }
        } else {
            data = {
                message: 'У данного пользователя нет файлов',
                statusCode: 400
            }
        }
    } catch (e) {
        data = {
            message: e.message,
            statusCode: 400
        }
    }
    return data
}

async function downloadFile(object,user){
    let data = {
        message:'error',
        statusCode:400
    }
    const client = await pool.connect()

    try {
        const fileInfo = await client.query(`select "fileType"::integer, "filePath"
                                             from files
                                             where "userId" = $1
                                               and id = $2`, [user.userId, object.fileId])
        if(fileInfo.rows.length > 0){
            const type = fileInfo.rows[0].fileType
            const path = fileInfo.rows[0].filePath
            let buffer = null
            try {
                if(fs.existsSync(path)){
                    buffer = fs.createReadStream(path)

                    data = {
                        message: {
                            buffer:buffer,
                            fileType: type,
                            success: true
                        },
                        statusCode: 200
                    }
                }else{
                    console.log('файла по данному пути нет')
                    data = {
                        message:"файла нет",
                        statusCode: 400
                    }
                }
            }catch (e) {

            }
        }else{
            data = {
                message:'Ошибка при получении информации о файле',
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
    uploadFiles: uploadFiles,
    getUserFiles: getUserFiles,
    downloadFile:downloadFile,
}