const LOGIN_TYPES = {
    activeDirectory: 1,
    loginPassword: 2
}
const USER_ROLES = {
    admin: 1,
    teacher: 2,
    student: 3,
    parent: 4
}
const TYPES_OF_STUDYING = {
    fullTime: 1, //очка
    extramural: 2 //заочка
}
const TYPES_OF_EXAM = {
    exam: 1,
    offset: 2,
    1: 'зачет',
    2: 'экзамен'
}
const TYPES_OF_SEMESTERS = {
    autumn: 1, // Осень
    spring: 2 // Весна
}

const FILE_TYPES = {
    1: '.txt',
    '.txt': 1,
    2: 'excel',
    'excel': 2,
    3: 'word',
    'word': 3

}

const MIME_IMAGES = [
    'image/jpeg',
    'image/png',
    'text/plain'
];

module.exports = {
    LOGIN_TYPES: LOGIN_TYPES,
    USER_ROLES: USER_ROLES,
    TYPES_OF_STUDYING: TYPES_OF_STUDYING,
    TYPES_OF_EXAM: TYPES_OF_EXAM,
    TYPES_OF_SEMESTERS: TYPES_OF_SEMESTERS,
    FILE_TYPES:FILE_TYPES,
    MIME_IMAGES:MIME_IMAGES
}