const { filesystem, pool, constants } = require("../../dependencies");
const fs = require("fs");
async function uploadFiles(object, user) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();
  let uploadsFiles = [];
  let wasBegin = false;
  try {
    // "SELECT * FROM folders WHERE folderId = $1 AND userId = $2"

    const checkFolder = await client.query(
      `SELECT f."id"
      FROM folders f
      left join userroles r on f."id" = r.id
      WHERE f."id" = $1 AND r.roleId = $2`,
      [object.folderId, user.roleId]
    );
    if (checkFolder.rows.length == 0) {
      data = {
        message: `Папка ${folderId} не найдена или вы не имеете к ней доступа.`,
        statusCode: 400,
      };
      return data;
    }
    console.log(object.files.length);
    const queryInsertFiles = `INSERT INTO files ("userId", "fileType", "filePath", "fileMeta", "folderId")
                                  VALUES ($1, $2, $3, $4, $5)
                                  RETURNING *`;
    await client.query("BEGIN");
    wasBegin = true;
    for (let i = 0; i < object.files.length; i++) {
      try {
        console.log(object.files[i]);
        const upload = filesystem.uploadFile(
          filesystem.userFiles,
          object.files[i],
          {
            customStr: "u" + user.userId,
            customMIME: constants.FILE_TYPES,
          }
        );
        if (upload.success) {
          const resInsertFiles = await client.query(queryInsertFiles, [
            user.userId,
            object.fileType,
            upload.path,
            { fileName: object.files[i].filename.split(".")[0] },
            object.folderId,
          ]);
          uploadsFiles.push(resInsertFiles.rows[0]);
        } else {
          data = {
            message: upload.message,
            statusCode: 400,
          };
        }
      } catch (e) {
        console.log(e);
        data = {
          message: e.message,
          statusCode: 400,
        };
      }
    }
    if (uploadsFiles.length === object.files.length) {
      await client.query("COMMIT");
      data = {
        message: uploadsFiles,
        statusCode: 200,
      };
    } else {
      await client.query("ROLLBACK");
      data = {
        message: "Ошибка",
        statusCode: 400,
      };
    }
  } catch (e) {
    if (wasBegin) {
      await client.query("ROLLBACK");
    }
    data = {
      message: e.message,
      statusCode: 400,
    };
  } finally {
    client.release();
  }
  return data;
}

async function createFolder(object, user) {
  const queryAddFolder = `insert into folders ("id", "userId", "name", "folderId")
      values ((SELECT MAX(id) + 1 FROM folders), $1, $2, $3)`;
  let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();
  try {
    const checkFolder = await client.query(
      `SELECT * FROM folders WHERE "userId" = $1 AND "id" = $2`,
      [user.userId, object.folderId]
    );
    //todo: Сделать доступ для создания папок.
    if (checkFolder.rows.length == 0) {
      data = {
        message: `Папка ${object.folderId} не найдена или вы не имеете к ней доступа.`,
        statusCode: 400,
      };
      return data;
    }

    const resQueryAddFolder = await client.query(queryAddFolder, [
      user.userId,
      object.name,
      object.folderId,
    ]);
    data = {
      message: "Папка успешно создана.",
      statusCode: 200,
    };
  } catch (e) {
    console.log(e);
    data = {
      message: e.message,
      statusCode: 400,
    };
  } finally {
    client.release();
  }
  return data;
}

async function getUserFiles(object, user) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();
  try {
    const querySelectFiles = `SELECT "fileType"::integer,substring("filePath",2,length("filePath")) as "filePath",("fileMeta"->'fileName')::text as "fileName",id::integer
                                  FROM files
                                  WHERE "userId" = $1`;
    const resSelectFiles = await client.query(querySelectFiles, [user.userId]);
    if (resSelectFiles.rows.length > 0) {
      data = {
        message: resSelectFiles.rows,
        statusCode: 200,
      };
    } else {
      data = {
        message: "У данного пользователя нет файлов",
        statusCode: 400,
      };
    }
  } catch (e) {
    data = {
      message: e.message,
      statusCode: 400,
    };
  }
  return data;
}

async function downloadFile(object, user) {
  let data = {
    message: "error",
    statusCode: 400,
  };
  const client = await pool.connect();

  try {
    const fileInfo = await client.query(
      `select "fileType"::integer, "filePath"
                                             from files
                                             where id = $1`,
      [object.fileId]
    );
    if (fileInfo.rows.length > 0) {
      const type = fileInfo.rows[0].fileType;
      const path = fileInfo.rows[0].filePath;
      let buffer = null;
      try {
        if (fs.existsSync(path)) {
          buffer = fs.createReadStream(path);

          data = {
            message: {
              buffer: buffer,
              fileType: type,
              success: true,
            },
            statusCode: 200,
          };
        } else {
          console.log("файла по данному пути нет");
          data = {
            message: "файла нет",
            statusCode: 400,
          };
        }
      } catch (e) {}
    } else {
      data = {
        message: "Ошибка при получении информации о файле",
        statusCode: 400,
      };
    }
  } catch (e) {
    console.log(e);
  } finally {
    client.release();
  }
  return data;
}

async function deleteFolder(object, user) {
  fileIds = object.fileId;
  userId = user.userId;
  let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();
  try {
    const folder = await client.query(`SELECT * FROM folders WHERE "id" = $1 AND "userId" = $2`, [
      folderId,userId
    ]);
    if (folder.rows.length > 0) {
      //todo: Сделать удаление файлов и папок
    }
  } catch (e) {
    data = {
      message: e.message,
      statusCode: 400,
    };
  } finally {
    client.release();
  }
  return data;
}


async function deleteFiles(object, user) {
  fileIds = object.fileId;
  userId = user.userId;
  let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();
  try {
    const queryGetFiles = `SELECT "filePath" FROM files WHERE "id" = ANY($1::int[]) AND "userId" = $2`;
    const resGetFiles = await client.query(queryGetFiles, [fileIds, userId]);
    const filePaths = resGetFiles.rows.map((file) => file.filePath);

    await Promise.all([
      filesystem.deleteFiles(filePaths),
      client.query(
        'DELETE FROM files WHERE "id" = ANY($1::int[]) AND "userId" = $2',
        [fileIds, userId]
      ),
    ]);
    await client.query("COMMIT");
    data = {
      message: "Удалено успешно",
      statusCode: 200,
    };
  } catch (e) {
    await client.query("ROLLBACK");
    data = {
      message: e.message,
      statusCode: 400,
    };
  } finally {
    client.release();
  }
  return data;
}

async function getFolderStruct(object, user) {
  
  folderId = object.folderId
  const client = await pool.connect();
  let data = {
    message: "",
    statusCode: 400,
  };

  const checkFoldernull = await client.query(
    `SELECT "id"
    FROM folders
    WHERE "id" = $1 AND "folderId" IS NULL`,
    [folderId]
  );
  if (checkFoldernull.rows.length == 0) {
    data = {
      message: "Структуру файлов можно получать только по корневой директории.",
      statusCode: 400,
    };
    return data
  }
  if(user.type==4) {
    const checkFolder = await client.query(
      `SELECT "id"
      FROM folders
      WHERE "id" = $1 AND userId = $2`,
      [folderId, user.userId]
    );
    if (checkFolder.rows.length == 0) {
      data = {
        message: "Папка не найдена или вы не имеете к ней доступ",
        statusCode: 400,
      };
      return data
    }
  }
  
  
  try {
    struct = await createStruct(client, folderId);
    data = {
      message: struct,
      statusCode: 200,
    };
  }
  catch (e) {
    console.error(e)
    data = {
      message: "Папка не найдена или вы не имеете к ней доступ.",
      statusCode: 400,
    };
  } finally {
    client.release();
  }
  return data;
}

async function createStruct(client, folderId) {
    const folder = await client.query(`SELECT * FROM folders WHERE "id" = $1`, [
      folderId,
    ]);

    const files = await client.query(
      `SELECT * FROM files WHERE "folderId" = $1`,
      [folderId]
    );

    const childFolders = await client.query(
      `SELECT * FROM folders WHERE "folderId" = $1`,
      [folderId]
    );
    const childFolderStructures = await Promise.all(
      childFolders.rows.map((childFolder) => createStruct(client, childFolder.id))
    );

    const folderStructure = {
      id: folder.rows[0].id,
      name: folder.rows[0].name,
      files: files.rows.map((file) => ({
        id: file.rows[0].id,
        path: file.rows[0].filePath,
        meta: file.rows[0].fileMeta,
      })),
      folders: childFolderStructures,
    };
    return client, folderStructure;
}

module.exports = {
  uploadFiles: uploadFiles,
  getUserFiles: getUserFiles,
  downloadFile: downloadFile,
  deleteFiles: deleteFiles,
  createFolder: createFolder,
  getFolderStruct: getFolderStruct,
};
