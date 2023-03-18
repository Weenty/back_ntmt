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
    const checkFolder = await client.query(
      `SELECT * FROM folders WHERE "userId" = $1 AND "id" = $2`,
      [user.userId, object.folderId]
    );
      //todo: Сделать по роли доступ 
    if (checkFolder.rows.length == 0) {
      data = {
        message: `Папка ${object.folderId} не найдена или вы не имеете к ней доступа.`,
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
      values ((SELECT MAX(id) + 1 FROM folders), $1, $2, $3) RETURNING *`;
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

    if (checkFolder.rows.length == 0 && !(object.folderId == 1 && (user.roleId == 1 || user.roleId == 3))) {
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
      message:  resQueryAddFolder.rows,
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

async function deleteFolderRecursive(folder, userId, client) {
  // Удаляем файлы внутри папки
  for (const file of folder.files) {
    await client.query(`DELETE FROM files WHERE id = $1 AND "userId" = $2`, [file.id, userId]);
    fs.unlinkSync(file.path);
  }

  // Удаляем вложенные папки
  for (const subfolder of folder.folders) {
    await deleteFolderRecursive(subfolder, userId, client);
  }

  // Удаляем саму папку
  await client.query(`DELETE FROM folders WHERE id = $1 AND "userId" = $2`, [folder.id, userId]);
}

async function deleteFolder(object, user) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const folderId = object.folderId;
  const userId = user.userId;
  const client = await pool.connect();
  const checkFolder = await client.query(
    `SELECT "id"
    FROM folders
    WHERE "id" = $1 AND "userId" = $2`,
    [folderId, user.userId]
  );
  if (checkFolder.rows.length == 0) {
    data = {
      message: "Папка не найдена или вы не имеете к ней доступа",
      statusCode: 400,
    };
    return data
  }
  struct = await createStruct(client, folderId);
  
  
  try {
    // Рекурсивно удаляем все папки и файлы из базы данных и файловой системы
    await deleteFolderRecursive(struct, userId, client);

    data = {
      message: "Folder successfully deleted",
      statusCode: 200,
    };
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
  fileId = object.fileId;
  userId = user.userId;
  let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();
  try {
    const queryGetFiles = `SELECT "filePath" FROM files WHERE "id" = $1 AND "userId" = $2`;
    const resGetFiles = await client.query(queryGetFiles, [fileId, userId]);

    if (resGetFiles.rows.length == 0) {
      data = {
        message: "Файлы не были найдены или вы не имеете к ним доступа",
        statusCode: 400,
      };
      return data
    }
    const filePaths = resGetFiles.rows.map((file) => file.filePath);

    await Promise.all([
      filesystem.deleteFiles(filePaths),
      client.query(
        'DELETE FROM files WHERE "id" = $1 AND "userId" = $2',
        [fileId, userId]
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

  if(user.roleId==4) {
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
      console.log(files.rows)
    const folderStructure = {
      id: folder.rows[0].id,
      name: folder.rows[0].name,
      files: files.rows.map((file) => ({
        id: file.id,
        path: file.filePath,
        meta: file.fileMeta,
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
  deleteFolder:deleteFolder
};
