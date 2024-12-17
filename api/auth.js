const express = require('express')
const jwt = require('jsonwebtoken')
const jwtCheck = require('./middleware/jwt-check')
const router = express.Router()
module.exports = router
//
router.post("/login", async (req, res) => {
    console.log("username & password=", req.body);
    try {
      // ตรวจสอบ username จากฐานข้อมูล
      let row = await req.db("student").where({ username: req.body.username });
      console.log('row[0].username=', row[0].username)
      console.log('row[0].password=', row[0].password)
      if (row.length === 0) {
        // หากไม่มี username ในฐานข้อมูล
        return res.status(404).json({ status: 0, message: "username ไม่ถูกต้อง" });
      }
      // console.log('row[0]=',row[0] )
      const userFromDB = row[0]; // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
  
      // ตรวจสอบรหัสผ่าน (เปรียบเทียบ req.body.password กับข้อมูลในฐานข้อมูล)
      if (req.body.password !== userFromDB.password) {
        return res.status(401).json({ status: 0, message: "password ไม่ถูกต้อง" });
      }
        // หาก username และ password ถูกต้อง สร้าง JWT Token
      const token = jwt.sign(
        { id: userFromDB.student_id, username: userFromDB.username },
        req.config.jwt.secret,req.config.jwt.options 
      );
       
      // ส่ง token กลับไปยัง client
      return res.json({ status: 1, token });
    } catch (e) {
      // จัดการข้อผิดพลาด
      console.error("Error:", e.message);
      return res.status(500).json({ ok: 0, error: e.message });
    }
  });
  router.get('/', (req,res) =>{
    console.log('test')
    res.send('alongkorn')
  })
  router.get("/checktoken", jwtCheck,async (req, res) => {
    console.log('req.user=', req.user)
    let user = await req.db('student')
      .where('student_id', req.user.id)
      .then(rows => rows[0])
    res.json({ 
      message: `Welcome ${req.user.username} to the verify!`,
      status: 1
    });
  });
  /////