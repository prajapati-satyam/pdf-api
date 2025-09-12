import upload from "../middleware/multer.js"
import { merge_pdf } from "../utils/split_merge_pdf.js";
import fs from 'fs'

const merge_pdf_controller = async (req,res) => {
upload.array('test')(req,res, async(err) => {
if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "Maximum allowed file size is 5MB",
        });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          message: "You sent wrong field name with PDF file, check and try again",
        });
      }
      return res.status(400).json({ message: err.message });
    }

    if (!req.files || req.files.length < 2) {
      req.files.forEach((file) => {
        fs.unlinkSync(file.path)
      })
      return res.status(400).json({ message: "Minimum 2 pdf files are required for merge it!" });
    }
    let req_path_path = [];
    req.files.forEach((file) => {
        req_path_path.push(file.path)
    });
    let result;
    console.log(req_path_path);
    try {
        const final_merge_pdf_path = await merge_pdf([...req_path_path]);
        result = final_merge_pdf_path;
        if (final_merge_pdf_path.path && final_merge_pdf_path.success === true) {
             return res.status(200).download(final_merge_pdf_path.path, 'merge.pdf', (err) => {
              if(err) {
                console.log("erorr in merge pdf conrtoller : ", err)
              }
                // console.log("file deleted start");
                fs.unlinkSync(final_merge_pdf_path.path);
                // console.log("file deleted end ");
                req.files.forEach((file) => {
                fs.unlinkSync(file.path);
            })
             })
        }
        else {
            if (fs.existsSync(final_merge_pdf_path.path)) {
                fs.unlinkSync(final_merge_pdf_path.path);
                console.log("tempory created file deleted");
            }
            req.files.forEach((file) => {
                fs.unlinkSync(file.path);
            })
            return res.status(400).json({
                message: "uanble to merge you pdf , try again"
            })
        }

    } catch (err) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }
      if (result.path) {
        if (fs.existsSync(result.path)) {
                fs.unlinkSync(result.path);
                console.log("tempory created file deleted");
            }
          }
        console.log("error in merge file controler : ", err);
        return res.status(400).json({
            message: "something went wrong, make sure you send pdf files and they are not encrpted"
        })

    }
})
}

export default merge_pdf_controller