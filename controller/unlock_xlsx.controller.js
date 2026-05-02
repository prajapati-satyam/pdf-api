import fs from 'fs'
import { fileURLToPath } from "url";
import upload_xlsx_file from '../middleware/xlsxFile.middleware.js';
import path from 'path';
import { unlock_xlsx_file }  from '../utils/unlock_excel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const unlock_xlsx = async (req,res) => {
    upload_xlsx_file.single('test')(req,res, async(err)=> {
        if (err) {
            console.log(err.code)
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    message: "maximum allowed file size is 5MB"
                })
            }
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
           return res.status(400).json({
            message: "You send wrong field name with xlsx file , check the filed name and try again"
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
        try {
            const data = await unlock_xlsx_file(req.file.path);
            if (data.success) {
                 res.status(200).download(path.join(__dirname,data.path), `${data.filename}.xlsx` , (err)=> {
               if(err) {
                console.log("error in xlsx unlocked controller while send downlaod res to user : ", err);
               }
               if (fs.existsSync(path.join(req.file.path))) {
                //   delete original file exists
                    fs.unlinkSync(path.join(req.file.path))
               }
               if (fs.existsSync(path.join( __dirname,data.path))) {
                // delete unlocked file if exists
                fs.unlinkSync(path.join( __dirname,data.path));

               }
            })
            } else {
                if (fs.existsSync(path.join(req.file.path))) {
                //   delete original file exists
                    fs.unlinkSync(path.join(req.file.path))
               }
               if (fs.existsSync(path.join( __dirname,data.path))) {
                // delete unlocked file if exists
                fs.unlinkSync(path.join( __dirname,data.path));

               }
               return res.status(400).json({
                success: false,
                message: "make sure file is not corrputed and try again"
               })
            }
        } catch (err) {
            console.log("error in unlock_xlsx controller catch block : ", err);
            // delete existing file if exist
if (fs.existsSync(path.join(req.file.path))) {
                //   delete original file exists
                    fs.unlinkSync(path.join(req.file.path))
               }
            //  delete unlocked file if exist
            if (fs.existsSync(path.join( __dirname,`../tmp/xlsx_unlocked/${req.file.filename} no-password.xlsx`))) {
                 fs.unlinkSync(`../tmp/xlsx_unlocked/${req.file.filename} no-password.xlsx`)
            }
            return res.status(400).json({
                success: false,
                message: "make sure file is not corrputed and try again"
            })
        }
    })
}


export default unlock_xlsx