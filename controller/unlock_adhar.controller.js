import path from "path";
import upload from "../middleware/multer.js";
import { decrypt_pdf_file } from "../utils/encrpt_decrpt_pdf.js"
import fs from 'fs'
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const unlock_adhar = async (req,res) => {
const user_fullname = req.user_data.fullname.trim().split("");
const dob = req.user_data.dob.split('/');
const user_birth_year = dob[2];


const default_password =`${user_fullname[0].toUpperCase()+user_fullname[1].toUpperCase()+user_fullname[2].toUpperCase()+user_fullname[3].toUpperCase()+user_birth_year}`;

const isUseDefualtPassword = req.headers['default']?.toLowerCase() === 'true';
console.log(isUseDefualtPassword);
const custom_password = req.headers['password'];
if (isUseDefualtPassword === false && (custom_password.length === 0 || custom_password === undefined || custom_password === null)) {
   return res.status(400).json({
    message: "kindly choose defualt password or custom password"
   })
}

upload.single('test')(req,res, async(err)=> {
    if (err) {
            console.log(err.code)
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    message: "maximum allowed file size is 5MB"
                })
            }
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
           return res.status(400).json({
            message: "you send wrong field name with pdf file , check the filed name and try again"
           })
            }
            return res.status(400).json({
                message: err.message
            })
        }
        if (!req.file) {
            return res.status(400).json({
                message: "pdf is required to performe opretation"
            })
        }


if (isUseDefualtPassword === true) {
    try {
        const decrypt_pdf = await decrypt_pdf_file(req.file.path, default_password);
        if (decrypt_pdf.success) {
            res.download(path.join(__dirname, '../tmp/decrypt', req.file.filename), `${user_fullname}adhar unlocked.pdf` , (err)=> {
               if(err) {
                console.log("error in adhar card unlocked controller while send downlaod res to user : ", err);
               }
               if (fs.existsSync(req.file.path)) {
                //   delete original file exists
                    fs.unlinkSync(req.file.path)
               }
               if (fs.existsSync(path.join(__dirname, '../tmp/decrypt', req.file.filename))) {
                // delete unlocked file if exists
                fs.unlinkSync(path.join(__dirname, '../tmp/decrypt', req.file.filename));

               }
            })
        } else {
            if (fs.existsSync(req.file.path)) {
                //   delete original file exists
                    fs.unlinkSync(req.file.path)
               }
               if (fs.existsSync(path.join(__dirname, '../tmp/decrypt', req.file.filename))) {
                // delete unlocked file if exists
                fs.unlinkSync(path.join(__dirname, '../tmp/decrypt', req.file.filename));

               }
            return res.status(400).json({
                message: "check you payload and file, and make sure your password and details are correct for this pdf"
            })
        }

    } catch(err) {
        console.log("error in adhar card unlocked controller : ", err);
        if (fs.existsSync(req.file.path)) {
                //   delete original file exists
                    fs.unlinkSync(req.file.path)
               }
               if (fs.existsSync(path.join(__dirname, '../tmp/decrypt', req.file.filename))) {
                // delete unlocked file if exists
                fs.unlinkSync(path.join(__dirname, '../tmp/decrypt', req.file.filename));

               }
        return res.status(400).json({
            message: "check you payload and file, and make sure your password and details are correct for this pdf"
        })

    }
}


if (isUseDefualtPassword === false) {
    try {
        const decrypt_pdf = await decrypt_pdf_file(req.file.path, custom_password);
        if (decrypt_pdf.success) {
            res.download(path.join(__dirname, '../tmp/decrypt', req.file.filename), `${user_fullname}adhar unlocked.pdf` , (err)=> {
               if(err) {
                console.log("error in adhar card unlocked controller while send downlaod res to user : ", err);
               }
               if (fs.existsSync(req.file.path)) {
                //   delete original file exists
                    fs.unlinkSync(req.file.path)
               }
               if (fs.existsSync(path.join(__dirname, '../tmp/decrypt', req.file.filename))) {
                // delete unlocked file if exists
                fs.unlinkSync(path.join(__dirname, '../tmp/decrypt', req.file.filename));

               }
            })
        } else {
            if (fs.existsSync(req.file.path)) {
                //   delete original file exists
                    fs.unlinkSync(req.file.path)
               }
               if (fs.existsSync(path.join(__dirname, '../tmp/decrypt', req.file.filename))) {
                // delete unlocked file if exists
                fs.unlinkSync(path.join(__dirname, '../tmp/decrypt', req.file.filename));

               }
            return res.status(400).json({
                message: "check you payload and file, and make sure your password and details are correct for this pdf"
            })
        }

    } catch(err) {
        console.log("error in adhar card unlocked controller : ", err);
        if (fs.existsSync(req.file.path)) {
                //   delete original file exists
                    fs.unlinkSync(req.file.path)
               }
               if (fs.existsSync(path.join(__dirname, '../tmp/decrypt', req.file.filename))) {
                // delete unlocked file if exists
                fs.unlinkSync(path.join(__dirname, '../tmp/decrypt', req.file.filename));

               }
        return res.status(400).json({
            message: "check you payload and file, and make sure your password and details are correct for this pdf"
        })
}
}
});


}


export { unlock_adhar }