import upload from "../middleware/multer.js"
import fs from 'fs'
import { encrypt_pdf_file, decrypt_pdf_file } from "../utils/encrpt_decrpt_pdf.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const encrypt_pdf = (req, res) => {
    const password = req.headers['x-password'];
    if (!password) {
        return res.json({
            message: "passoword is requried to lock pdf"
        })
    }
    console.log(password);
    upload.single('test')(req, res, async(err) => {
        if (err) {
            console.log(err.code)
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.json({
                    message: "maximum allowed file size is 5MB"
                })
            }
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
           return res.json({
            message: "you send wrong field name with pdf file , check the filed name and try again"
           })
            }
            return res.json({
                message: err.message
            })
        }
        if (!req.file) {
            return res.json({
                message: "pdf is required to performe opretation"
            })
        }

        try {
            const lock_pdf = await encrypt_pdf_file(req.file.path, password);
            if (lock_pdf) {
                return res.download(path.join(__dirname ,'../tmp/encrypt', req.file.filename), 'locked.pdf', (err) => {
                    // delete original file
                    console.log("original file deleted starting : ");
                    fs.unlinkSync(req.file.path);
                    console.log("original file deleted")
                    // delete encrypted file
                    console.log("lock file deleting starting : ");
                    fs.unlinkSync(path.join(__dirname,'../tmp/encrypt', path.basename(req.file.path)));
                    console.log("lock file deleted");
                });
            } else {
                // delete original file
                console.log("error to lock pdf , so starting deleting original file")
                   fs.unlinkSync(req.file.path);
                   console.log("original file deleted");
                   res.json({
                    message: "uanble to lock your pdf , try again"
                   })
            }


        } catch(err) {
            console.log("original file starting deleting due to error (catch block)");
            fs.unlinkSync(req.file.path);
            console.log("original file deleted");
            console.log("error in encryptfile controller : ", err);
            res.json({
                message: "Unable to lock your pdf"
            })
        }
    })

}

const decrypt_pdf = (req,res) => {
    const password = req.headers['x-password'];
    if (!password) {
        return res.json({
            message: "passoword is requried to unlock pdf"
        })
    }
    console.log(password);
    upload.single('test')(req, res, async(err) => {
        if (err) {
            console.log(err.code)
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.json({
                    message: "maximum allowed file size is 5MB"
                })
            }
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
           return res.json({
            message: "you send wrong field name with pdf file , check the filed name and try again"
           })
            }
            return res.json({
                message: err.message
            })
        }
        if (!req.file) {
            return res.json({
                message: "pdf is required to performe opretation"
            })
        }

        try {
            const unlock_pdf = await decrypt_pdf_file(req.file.path, password);
            if (unlock_pdf) {
                return res.download(path.join(__dirname ,'../tmp/decrypt', req.file.filename), 'unlocked.pdf',(err) => {
                    // delete original file
                    console.log("original file deleted starting : ");
                    fs.unlinkSync(req.file.path);
                    console.log("original file deleted")
                    // delete encrypted file
                    console.log("unlock file deleting starting : ");
                    fs.unlinkSync(path.join(__dirname,'../tmp/decrypt', path.basename(req.file.path)));
                    console.log("unlock file deleted");
                });
            } else {
                // delete original file
                console.log("error to unlock pdf , so starting deleting original file")
                   fs.unlinkSync(req.file.path);
                   console.log("original file deleted");
                   res.json({
                    message: "uanble to unlock your pdf , try again"
                   })
            }


        } catch(err) {
            console.log("original file starting deleting due to error (catch block)");
            fs.unlinkSync(req.file.path);
            console.log("original file deleted");
            console.log("error in encryptfile controller : ", err);
            res.json({
                message: "Unable to unlock your pdf"
            })
        }
    })

}

export  {encrypt_pdf, decrypt_pdf};
