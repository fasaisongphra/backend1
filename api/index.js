//รัน npm run dev

const express = require("express");
const knex = require("knex")
const app = express();
const cors = require("cors");
const student = require('./student');//พึ่งใส่
const config = require('./config')
const db = knex(config.db)
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
   console.log('welcome')
   req.db = db
   req.config = config
   next()
})

//เชื่อมโยงไฟล์ student.js
app.use('/student', student)
app.use('/auth', require('./auth.js'))

app.listen(7000, () => {
    console.log(`Example app listening on port 7000`);
})