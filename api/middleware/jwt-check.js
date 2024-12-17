const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
   // const authHeader = req.headers['authorization']; // อ่านค่าจาก 'Authorization'
  let token = req.headers.authorization?.split(/\s+/)[1]
  // const token = authHeader.split(' ')[1]; // ตัดคำว่า 'Bearer' ออก
  console.log('token=', token)
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }
  // ตรวจสอบความถูกต้องของโทเค็น
  // let data = jwt.verify(token, req.config.jwt.secret, req.config.jwt.options)
//     req.token = data
  jwt.verify(token, req.config.jwt.secret,req.config.jwt.options, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = decoded; // เก็บข้อมูลผู้ใช้ที่ถอดรหัสแล้วใน req.user
    next();
  });
}