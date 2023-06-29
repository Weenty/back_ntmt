
# Серверная часть сайта личного кабинета НТМТ


![Logo](https://roslesinforg.ru/upload/iblock/d78/9ovzxa50hf85rdg5vp2t8g342qi2414e/hse-egc-roll-up-10.png)




## Как запустить?

#### Ручное развертываниe:
- Предустановить PostgreSQL:
[![postgresql](https://d1q6f0aelx0por.cloudfront.net/product-logos/library-postgres-logo.png)](https://www.postgresql.org/)
- Предустановить Node.js
[![nodejs](https://d1q6f0aelx0por.cloudfront.net/product-logos/library-node-logo.png)](https://nodejs.org/en)
- Создать базу данных в PostgreSQL
- Загрузить проект
```bash
  git clone https://github.com/Weenty/back_ntmt.git
```
- Отредактировать файл .env.example под свою данные базы данных (не забудьте переименовать данный файл в .env)
- Выполнить команды:
```bash
  npm run migrate
```
```bash
  npm start
```
- Для остановки приложения:
```bash
  npm stop
```
#### ИЛИ Docker развертываниe:
- Предустановить Docker:
[![Docker](https://www.docker.com/wp-content/uploads/2022/03/horizontal-logo-monochromatic-white.png.webp)](https://www.docker.com/)
- Выполнить команды:
```bash
  git clone https://github.com/Weenty/back_ntmt.git
```
```bash
  docker-compose up
```
## Документация SWAGGER

```https
  http://localhost:3001/documentation
```

### Для работы приложение необходимо разворачивать в сети с доступом к Active Directory. В противном случае, вы можете раскомментировать тестовых пользователях в миграциях с их данными и работать уже с ними. 