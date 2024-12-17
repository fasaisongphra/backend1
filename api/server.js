const express = require('express')
var bodyParser = require('body-parser')
const path = require('path'); 
const cors = require("cors");
const app = express()
const multer = require("multer");

const jwt = require('jsonwebtoken');
const secretKey = '123456';

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile/"); // Directory to save the uploaded files
  },
  filename: (req, file, cb) => {
    console.log('file', file)
    cb(null, Date.now() + "-" + path.extname(file.originalname));
    // console.log('filename=>', file.originalname)
  },
});
const upload = multer({ storage: storage });

const port = 7000
const knex = require("knex")({
    client: "mysql",
    connection: {
      host: "localhost",
      port: 3306,
      user: "root",
      password: "",
      database: "stdactivity_2567",
    },
  }); 
// parse application/json
app.use(bodyParser.json())
app.use(cors());


app.post('/login1', (req, res) => {
  const user = { id: 1, username: 'test' }; // ตัวอย่างผู้ใช้
  const token = jwt.sign(user, secretKey, { expiresIn: '1h' }); // สร้าง JWT Token
  console.log(token)
  res.json({ token }); // ส่ง JWT Token กลับไปให้ฝั่ง Client
});

// const users = [
//   { id: 1, username: 'test', password: '123456' }
// ];

// Route สำหรับการเข้าสู่ระบบ
app.post("/login", async (req, res) => {
  console.log("username & password=", req.body);
  try {
    // ตรวจสอบ username จากฐานข้อมูล
    let row = await knex("student").where({ username: req.body.username });
    console.log('row=', row[0].username)
    console.log('row=', row[0].password)
    if (row.length === 0) {
      // หากไม่มี username ในฐานข้อมูล
      return res.status(404).json({ status: 0, message: "username ไม่ถูกต้อง" });
    }
    console.log('row[0]',row[0])
    const userFromDB = row[0]; // ดึงข้อมูลผู้ใช้จากฐานข้อมูล

    // ตรวจสอบรหัสผ่าน (เปรียบเทียบ req.body.password กับข้อมูลในฐานข้อมูล)
    if (req.body.password !== userFromDB.password) {
      return res.status(401).json({ status: 0, message: "password ไม่ถูกต้อง" });
    }

    // หาก username และ password ถูกต้อง สร้าง JWT Token
    const token = jwt.sign(
      { id: userFromDB.student_id, username: userFromDB.username },
      secretKey,
      { expiresIn: "1h" }
    );

    // ส่ง token กลับไปยัง client
    return res.json({ status: 1, token });
  } catch (e) {
    // จัดการข้อผิดพลาด
    console.error("Error:", e.message);
    return res.status(500).json({ ok: 0, error: e.message });
  }
});

// Middleware สำหรับตรวจสอบ JWT Token
function authenticateToken(req, res, next) {
  const headerstoken = req.headers["authorization"];
  const token = headerstoken.split(' ')[1]
  // ดึงโทเค็นจาก Authorization Header

  console.log('token=',token.split(' ')[1] )
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }
  // ดึงโทเค็นจาก Authorization Header
  // const authHeader = req.headers['authorization']; // อ่านค่าจาก 'Authorization'
  // const token = authHeader && authHeader.split(' ')[1]; // ตัดคำว่า 'Bearer' ออก
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        message: "Invalid token",
        status: 0
      });
    }
    req.user = decoded;
    next();
  });
}
// Route ที่ต้องมีการยืนยันตัวตน (Protected Route)
app.get("/checktoken", authenticateToken, (req, res) => {
  console.log('checktoken')
  res.json({ 
    message:`Welcome ${req.user.username} to the verify! `,
    status : 1
  });
});

app.get('/api/profile', (req, res) => {
  const userId = req.query.userId; // สามารถส่ง userId ผ่าน query
  req.query('SELECT username, picture FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) {
      res.status(500).send('Database query error');
    } else {
      res.json(result[0]); // ส่งข้อมูลโปรไฟล์กลับไปที่ frontend
    }
  });
});


app.post('/upload-single', upload.single('picture'), async (req, res) => {
  console.log('data=', req.file)
  try {
    let row = await knex('student')
    .where({ student_id: 123452 })
    .update({picture: req.file.filename}) //บันทึกชื่อไฟล์ 
  res.send({
    message: 'อัปโหลดไฟล์สำเร็จ',
    file: req.file
  });
  } catch (e) {
    res.send({ status: 0, error: e.message });
  }
});

// API สำหรับอัปโหลดไฟล์เดียว
app.post('/upload-single', upload.single('picture'), (req, res) => {
  console.log('Date.now()=>', Date.now())
  console.log('data=', req)
  //insert name pic to database // 10
  res.json({
    message: 'อัปโหลดไฟล์สำเร็จ',
    file: req.file
  });
});

// API สำหรับอัปโหลดหลายไฟล์
app.post('/upload-multiple', upload.array('pictures'), (req, res) => {
  console.log('Date.now()=>', Date.now())
  console.log('', req.files)
  res.json({
    message: 'อัปโหลดหลายไฟล์สำเร็จ',
    files: req.files
  });
});

// app.post('/upload-single', upload.single('picture'), async (req, res) => {
//   try {
//     const { student_id } = req.body;
//     const filename = req.file.filename;
//     // อัพเดตข้อมูล student ด้วยชื่อไฟล์ใหม่
//     await knex('student')
//       .where({ student_id: student_id })
//       .update({ picture: filename });

//     res.send({
//       message: 'อัพโหลดรูปภาพและบันทึกสำเร็จ',
//       file: req.file
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

app.post('/upprofile', upload.single('avatar'), (req, res) => {
  console.log('body =>', req.body);
  console.log('file =>', req.file);
  res.send("File uploaded successfully!");
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/insert',async (req, res) => {
  console.log('data=', req.body.activities)
  const activities = req.body.activities;
  try {
     // ใช้ for loop เพื่อทำการ insert ทีละรายการ
     for (const activity of activities) {
      await knex('sttendance').insert({
        student_id : activity.studentId,
        status_id: activity.attendance || 0, // ถ้าไม่มี attendance ให้ตั้งค่าเป็น 0
      });
    }
    // ส่งผลลัพธ์กลับไปยัง client เมื่อเสร็จสิ้นการ insert
    res.status(200).json({ message: 'Data inserted successfully' });
    res.send('ok');
  } catch (e) {
    res.send({ status: 0, error: e.message });
  }
})

app.post("/insert1", async (req, res) => {
  console.log("data=", req.body.activities);
  const activities = req.body.activities;
  try {
    // ใช้ Promise.all เพื่อทำการ insert ข้อมูลทั้งหมดพร้อมกัน
    await Promise.all(
      activities.map((activity) => {
        if (activity.studentId && activity.studentName) {
          // ตรวจสอบว่ามี studentId และ studentName
          return knex("sttendance").insert({
            student_id: activity.studentId,
            status_id: activity.attendance || 1, // ถ้าไม่มี attendance ให้ตั้งค่าเป็น 0
          });
        }
      })
    );
    console.log("res=", res);
    res.status(200).json({ message: "Data inserted successfully" });
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).json({ message: "Error inserting data" });
  }
});

app.post("/insert2", async (req, res) => {
  console.log("data=", req.body.activities);
  // const activities = req.body.activities;
  const activities = req.body.activities.filter(activity => activity.studentId && activity.studentName); // กรองข้อมูลที่มี studentId และ studentName
  //insert
  try {
    // ใช้ bulk insert สำหรับการ insert ข้อมูลทั้งหมดในครั้งเดียว
    await knex('attendance').insert(activities.map(activity => ({
      student_id: activity.studentId,
      status_id: activity.attendance || 1, // ถ้าไม่มี attendance ให้ตั้งค่าเป็น 1
    })));
    console.log('res=', res)
    // ส่งผลลัพธ์กลับไปยัง client เมื่อเสร็จสิ้นการ insert
    res.status(200).json({ message: "Data inserted successfully insert2" });
    // res.send('ok');
  } catch (e) {
    res.send({ status: 0, error: e.message });
  }
});

app.post('/insertStudent',async (req, res) => {
  //req.body   =>  post
  console.log('insert => ', req.body)  
  try {
    let row = await knex('student')
    .insert({
          student_id: req.body.student_id,  
          username: req.body.username,
          password: req.body.password,
          picture: req.body.picture,                 
    })   
  res.send({
    insert: 'ok',
    status:  row     
  }) 
  } catch (e) {
    res.send({ ok: 0, error: e.message }); 
  }
})

// ลบข้อมูล
app.post('/deleteStudent', async (req, res) => { // เปลี่ยนจาก insertStudent เป็น deleteStudent
  console.log('delete = ', req.body);
  try {
    let row = await knex('student')
      .where({ student_id: req.body.student_id,})
      .del()
    res.send({
      status: 1,
      row: row, // เปลี่ยนชื่อ key เป็น row เพื่อบ่งบอกว่าเป็นจำนวนแถวที่ลบได้
    });
  } catch (e) {
    res.send({ status: 0, e: e.message });
  }
});

app.post("/updateStudent", async (req, res) => {
  //req.body   =>  post
  console.log("update=", req.body);
  try {
    let row = await knex("student")
    .where({student_id: req.body.student_id})
    .update({
      username: req.body.username,
      password: req.body.password,
      // picture: knex.raw('?', [req.body.picture]) // บังคับให้ใส่ค่าของ picture
      picture: req.body.picture
    })
    // console.log("Picture:", req.body.picture);
    res.send({
      status: 1,
      row: row,
    });
  } catch (e) {
    res.send({ status: 0, error: e.message });
  }
});


app.get('/listStudent',async (req, res) => {
  try {
      console.log('insert=', req.query)
      let row = await knex('student');  
      res.send({
      'status': "ok",
       datas: row 
  })
  } catch (e) {
      res.send({ ok: 0, error: e.message });
  }
})

  // http://localhost:7000/login
app.get('/login',(req, res) => {
    //req.query  =>  get
    //req.body   =>  post
    try {
    console.log('username & password=',req.query)  
    res.send('login  ok')
    } catch (e) {
      res.send({ ok: 0, error: e.message });
    }    
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})