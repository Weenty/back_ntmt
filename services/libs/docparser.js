const fs = require("fs");
const WordExtractor = require("word-extractor"); 

let dateTime = new Date();

async function getSchedule(date, group) {
  if (!date) {
    date = dateTime.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
  let data;
  try {
    data = JSON.parse(fs.readFileSync(`./public/schedule/${date}.json`, "utf-8"));
  }
  catch (e) {
    data = []
  }
  if (group && data.length) {
    data = data['groups'];
    for (let i = 0; i < data.length; i++) {
      if (data[i].code.split(' ').join('') == group.split(' ').join('')) {
        data = data[i];
        break;
      }
    }
    if (Array.isArray(data)) {
        throw new Error(`Группа ${group} не была найдена в расписании`);
    }
  }
  return data;
}

function searchDate(result, data) {
    for(let i = 0; i < data.length; i++) {
      let date = data[i].match(/([0-3][0-9]\.[0-1][0-9]\.[12][09][0-9][0-9]) (.+)/)
      if (date !== null) {
        result['date'] = date[1]
        result['day_of_the_week'] = date[2]
        continue
      }
      if (data[i].match(/([а-яА-ЯёЁa-zA-Z]* ?- ?[0-9]+)/) !== null) {
        data = data.slice(i)
        break
      }
    }
    return result, data
  }
  
  function parseSchedule(result, data, wrap) {
    for(let g = wrap; g<data.length; g=g+44) {
      if (data[g] == '') {
        continue
      }
      let groupSchedule = {
        code: data[g].replace(/(\r\n|\n|\r)/gm,""),
        schedule: {}
      }
      for(let pair = g + 1 ; pair<data.length; pair = pair + 11) {
        let arrPairs = data[pair].split(',')
        if(arrPairs[0]=='1' && groupSchedule['schedule'][1] !== undefined || isNaN(arrPairs[0]) || arrPairs[0]=='') {
          break
        } else {
          let bodyPair = {
            'subject': data[pair+1],
            'fo': data[pair+2],
            'fio': data[pair+3]
          }
          if (arrPairs.length > 1) {
            for(let j = 0; j < arrPairs.length; j++) {
              groupSchedule['schedule'][arrPairs[j]] = bodyPair
            }
          }
          groupSchedule['schedule'][arrPairs[0]] = bodyPair
        }
        
      }
      result['groups'].push(groupSchedule)
    }
    return result, data
  }
  
  function seatchGroup(data) {
    for(let i = 0; i < data.length; i++) {
      if(data[i].match(/([а-яА-ЯёЁa-zA-Z]* ?- ?[0-9]+)/) !== null) {
        console.log(data[i] + ': ' + i)
      }
    }
  }
  
  async function sendSchedule(file) {
    const extractor = new WordExtractor();
    const extracted = extractor.extract(file);
    extracted.then(function(doc) { 
        data = doc.getBody().split('\t')
        result = {
        }
        result['groups'] = []
        result, data = searchDate(result, data)
        result, data = parseSchedule(result, data, 0)
        result, data = parseSchedule(result, data, 5)
        fs.writeFile(`./public/schedule/${result['date']}.json`, JSON.stringify(result), function (err) {
          if (err) throw err;
        });
      });
      return true
  }
  

module.exports = {
  getSchedule: getSchedule,
  sendSchedule: sendSchedule
};
