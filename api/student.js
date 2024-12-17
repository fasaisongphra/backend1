const express = require('express')
const router = express.Router()
const knex = require("knex")
// const db = require("../db")
// const config = require('./config')
// const db = knex(config.db)

module.exports = router
router.get('/', (req, res) => {
    console.log('show data')
    res.send('show data')
})
//http:localhost:7000/list
router.get('/list', async (req, res) => {
// let db = req.db
console.log('list')
let row = await db('student')
console.log(row)
res.send({
    status: 'ok',
    row: row
})
})