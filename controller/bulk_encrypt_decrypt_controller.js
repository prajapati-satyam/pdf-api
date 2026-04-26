// take pdfs from the user
// encrypt it and save it in random folder
// delete original pdf
// make zip of random folder
// delete unzip folder
// send zip folder to user

import upload from "../middleware/multer.js";
import encrypt_pdf_file_bulk from "../utils/encrypt_decrypt_bulk_pdf.js";
import genrate_random_direcory from "../utils/genarte_random_directory.js";
import fs from "fs"
import { zip, COMPRESSION_LEVEL } from 'zip-a-folder';
import {decrypt_pdf_file_bulk} from '../utils/encrypt_decrypt_bulk_pdf.js'
import isPdfLocked from "../utils/is_pdf_locked.js"

const bulk_pdf_encrypt = async (req, res) => {
    const password = req.headers['x-password'];
    if (!password) {
        return res.json({
            message: "passoword is requried to lock pdf"
        })
    }
    console.log(password);
    upload.array('test')(req, res, async (err) => {
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
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded!' });
        }
        // check for locked pdf
        for (const file of req.files) {
            const locked = await isPdfLocked(file.path);
            if (locked) {
                for (const f of req.files) {
                    if (fs.existsSync(f.path)) {
                        fs.unlinkSync(f.path);
                    }
                }

                return res.status(400).json({
                    message: "PDF is locked, can't perform operation"
                });
            }
        }
        const random_dir = genrate_random_direcory();
        const zipPath = `./${random_dir}.zip`;
        let cleanupNeeded = true;
        try {
            await Promise.all(
                req.files.map(async (file, index) => {
                    await encrypt_pdf_file_bulk(file.path, password, random_dir);
                    fs.unlinkSync(file.path);
                })
            )
            const zip_lock_dir = await zip(`./${random_dir}`, `./${random_dir}.zip`, { compression: COMPRESSION_LEVEL.high });
            console.log(zip_lock_dir);
            console.log("locked pdf folder zip folder created");
            fs.rmSync(`./${random_dir}`, { recursive: true, force: true });
            console.log("locked pdf original(random) folder deleted");
            res.download(`./${random_dir}.zip`, "locked.zip", (err) => {
                if (err) {
                    console.log("Error sending file:", err);
                }
                if (fs.existsSync(zipPath)) {
                    fs.unlinkSync(zipPath);
                    console.log("locked zip deleted after sending");
                }
                req.files.forEach((file) => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                });
                cleanupNeeded = false;
            })
            res.on("close", () => {
                if (cleanupNeeded && fs.existsSync(zipPath)) {
                    fs.unlinkSync(zipPath);
                    console.log("Cleanup: zip deleted on request close");
                }
                req.files.forEach((file) => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                });

            });

        } catch (err) {
            if (fs.existsSync(`./${random_dir}`)) {
                fs.rmSync(`./${random_dir}`, { recursive: true, force: true });
                console.log("Cleanup: leftover folder deleted in finally");
            }
            if (fs.existsSync(zipPath) && cleanupNeeded) {
                fs.unlinkSync(zipPath);
                console.log("Cleanup: leftover zip deleted in finally");
            }
            req.files.forEach((file) => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
            return res.json({
                message: err.message
            })
        }

    })
}

// take pdfs from the user
// decrypt it and save it in random folder
// delete original pdf
// make zip of random folder
// delete unzip folder
// send zip folder to user


export const bulk_pdf_decrypt = async (req, res) => {
    const password = req.headers['x-password'];
    if (!password) {
        return res.json({
            message: "passoword is requried to lock pdf"
        })
    }
    upload.array('test')(req, res, async (err) => {
        if (err) {
            console.log("error in file upload bulk decrypt : ", err);
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.json({
                    message: "maximum allowed file size is 5MB"
                })
            }
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
                return res.json({
                    message: "you send wrong filed name with pdf file , check the field name and try again later"
                })
            }
            return res.json({
                message: err.message
            })
        }
        if (!req.files || req.files.length === 0) {
            return res.json({
                message: "No file uploaded"
            })
        }
        const random_dir = genrate_random_direcory();
        const zipPath = `./${random_dir}.zip`;
        let cleanupNeeded = true;
        try {
               await Promise.all(
                req.files.map(async (file, index) => {
                    await decrypt_pdf_file_bulk(file.path, password, random_dir);
                    fs.unlinkSync(file.path)
                })
               )
               const zip_unlock_dir = await zip(`${random_dir}`, `${random_dir}.zip`, {
                compression: COMPRESSION_LEVEL.high
               })
               console.log(zip_unlock_dir);
               console.log('unlocked zip folder created');
               fs.rmSync(`${random_dir}`, {recursive: true, force: true})
               console.log('unlocked orginal dir (random dir deleted)');
               res.download(`${random_dir}.zip`, 'unlocked.zip', (err)=> {
                if (err) {
                    console.log("erorr sending file",err);
                }
                if(fs.existsSync(zipPath)) {
                    fs.unlinkSync(zipPath);
                    console.log('unlocked zip file deleted');
                }
                req.files.forEach((file) => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path)
                    }
                })
                cleanupNeeded = false
               })
               res.on('close', ()=> {
                if (fs.existsSync(`${random_dir}`)) {
                    fs.rmSync(random_dir, {force: true, recursive: true});
                    console.log("delete random folder raw files");
                }
                if (cleanupNeeded && fs.existsSync(`${random_dir}.zip`)) {
                    fs.unlinkSync(`${random_dir}.zip`);
                    console.log("clean left over zip file");
                }
                req.files.map((file)=> {
                    if (fs.existsSync(file.path)) {
                     fs.unlinkSync(file.path)
                    }
                })
               })
        } catch (err) {
            if (fs.existsSync(random_dir)) {
                  fs.rmSync(random_dir, {force: true, recursive: true});
            }
            if (zipPath && cleanupNeeded && fs.existsSync(zipPath)) {
                fs.unlinkSync(zipPath);
            }
            req.files.map((file) => {
                if (fs.existsSync(file.path)) {
                     fs.unlinkSync(file.path)
                }
            })
            return res.json({
                message: err.message
            })
        }
    })

}



export default bulk_pdf_encrypt;