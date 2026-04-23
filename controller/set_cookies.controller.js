import 'dotenv/config'
import jwt from 'jsonwebtoken'

const set_cookies = async (req,res) => {
    try {
    if (!req.body || !req.body.fullname || !req.body.dob) {
        return res.json({
            message: "Check payload and try again"
        })
    }
    const dob = req.body.dob.split('/');
    if (dob.length !== 3) {
        return res.json({
            message: "wrong payload of dob"
        })
    }
    const data = {
        fullname: req.body.fullname,
        dob: req.body.dob
    }
    const token = jwt.sign(data, process.env.JWT_SECRET);
    res.cookie('data', token);
    res.json({
        message: "cookies set done"
    })
} catch(err) {
    console.log("unable to set cookie : ", err);
    res.json({
        message: "unable to set cookies"
    })
}

}



export default set_cookies