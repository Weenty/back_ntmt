const readXlsxFile = require('read-excel-file/node')
const schema = {
    'Группа': {
        prop: 'group',
        type: String
    },
    'Пара': {
        prop: 'count',
        type: Number
    },
    'Дисциплина': {
        prop: 'lesson',
        type: String
    },
    'ФО': {
        prop: 'fo',
        type: Number
    },
    'ФИО Преподавателя': {
        prop: 'teacher',
        type: String
    },
    'Дата':{
        prop:'date',
        type:Date
    }
}

 async function getSchedule(group, file) {
    let data
   await readXlsxFile(`./public/schedule/${file}.xlsx`, {schema}, group).then(async (arr) => {
        let ob = new Map()
        let array = []
        for (let i = 0; i < arr.rows.length; i++) {
            console.log(arr.rows[i].group == group)
            console.log(arr.rows[i])
            if (arr.rows[i].group == group) {
                array.push(arr.rows[i])
            }
        }

        ob.set(group, array)
        data = ob.get(group)
    })
     return data
}

module.exports = {
    getSchedule: getSchedule
}