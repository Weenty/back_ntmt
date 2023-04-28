const { filesystem, pool, constants } = require("../../dependencies");
const Schedule = require("../../services/libs/docparser");
const fs = require('fs');

async function getUserSchedule(object, user, reply) {
  let data = {
    message: "",
    statusCode: 400,
  };
  const client = await pool.connect();
  try {
    const docData = await Schedule.getSchedule(object.date, object.group);
    data = {
      message: docData,
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

async function sendSchedule(object, user) {
  if (user.roleId != 1) {
    return {
      message: "access denied",
      statusCode: 403,
    };
  }
  let data = {
    message: "",
    statusCode: 400,
  };
  try {
    const upload = filesystem.uploadFile(filesystem.scheduleFiles, object.files[0], {
        customStr: "u" + user.userId,
        customMIME: constants.FILE_TYPES,
      });
    if (upload.success) {
      
      if (await Schedule.sendSchedule(upload.path)) {
        fs.unlink(upload.path, (err) => {
          if (err) throw err;
          console.log('Файл удален');
        });
        data = {
          message: 'Успешное добавление расписания',
          statusCode: 200,
        };
      }
      //todo: Доделать удаление двух папок
     
    } else {
      {
        data = {
          message: upload.message,
          statusCode: 400,
        };
      }
    }
  } catch (e) {
    data = {
      message: e.message,
      statusCode: 400,
    };
  }
  return data;
}

module.exports = {
  getUserSchedule: getUserSchedule,
  sendSchedule: sendSchedule,
};
