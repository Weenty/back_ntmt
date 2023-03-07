const fs = require('fs');
const UUID = require('uuid');
const mimeTypes = require('mime-types');



const mainDirectory = './public'
const userFiles = mainDirectory + '/userFiles'
const limit = 10485760; // 10 MB
try {
    if (!fs.existsSync(mainDirectory)) {
        fs.mkdirSync(mainDirectory)
    }
    if (!fs.existsSync(userFiles)) {
        fs.mkdirSync(userFiles)
    }
} catch (e) {
    console.error(e);
    process.exit(-1);
}

function uploadFile(folder, file, options = {}) {
    let data = {
        success: false,
        message: '',
        path: ''
    }
    const regspace = / /g;
    try {
        if (file.data.length > 0) {
            const {customStr, customLimit, customMIME} = options;
            const uploadLimit = customLimit || limit;
            const uid = UUID.v4().split('-')
            const l1 = folder + '/' + uid[0].slice(0, 2)
            if (!fs.existsSync(l1)) {
                fs.mkdirSync(l1);
            }
            const l2 = l1 + '/' + uid[1].slice(0, 2);
            if (!fs.existsSync(l2)) {
                fs.mkdirSync(l2);
            }

            const mpath = l2 + '/' + uid[4] + (customStr ? '_' + customStr + '_' : '_');

            const fname = file.filename.replace(regspace, '_');
            const mime = mimeTypes.lookup(fname);
            const dataFile = file.data;
            if (dataFile.length > uploadLimit) {
                data.message = 'limit';
            } else if (Array.isArray(customMIME) && customMIME.length > 0 && !customMIME.includes(mime)) {
                data.message = 'mime';
            } else {
                const path = mpath + fname;
                fs.writeFileSync(path, dataFile);
                data.path = path;
                data.success = true;
            }

        } else {
            data.message = 'File is empty'
        }
    } catch (e) {
        data.message = e.message
    }
    console.log(data)
    return data
}

module.exports = {
    uploadFile: uploadFile,
    userFiles: userFiles
}