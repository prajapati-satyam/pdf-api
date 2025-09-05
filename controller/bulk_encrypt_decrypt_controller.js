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
                cleanupNeeded = false;
            })
            res.on("close", () => {
                if (cleanupNeeded && fs.existsSync(zipPath)) {
                    fs.unlinkSync(zipPath);
                    console.log("Cleanup: zip deleted on request close");
                }
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
            return res.json({
                message: err.message
            })
        } finally {
      if (fs.existsSync(`./${random_dir}`)) {
        fs.rmSync(`./${random_dir}`, { recursive: true, force: true });
      }
      if (fs.existsSync(`./${random_dir}.zip`)) {
        fs.unlinkSync(`./${random_dir}.zip`, { recursive: true, force: true });
      }
    }
    req.files.forEach((file) => {
        if(fs.existsSync(file)) {
            fs.unlinkSync(file);
            return true;
        } else {
            return true
        }
    });

    })
}


export default bulk_pdf_encrypt;