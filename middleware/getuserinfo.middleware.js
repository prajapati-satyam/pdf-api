import 'dotenv/config'
import jwt from 'jsonwebtoken'

const get_user_info_cookies = (req,res, next) => {
const token = req.cookies.data;

if (!token) {
  return res.status(404).json({
    message: "Cookies not set yet, Set your cookies first"
  });
}

try {
  const verify = jwt.verify(token, process.env.JWT_SECRET);
  const data = {
    fullname: verify.fullname,
    dob: verify.dob
  }
  req.user_data = data
  next()
} catch (err) {
console.log(err);
console.log("unverify run");
return res.json({message: "error while verify jwt token"})
}

}



export default get_user_info_cookies