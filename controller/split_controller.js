import multer from "multer";
import upload from "../middleware/multer.js";
import { split_pdf } from "../utils/split_merge_pdf.js";
import fs from 'fs'

const split_pdf_controllter = async (req, res) => {
    const choice = req.headers["choice"];
    const range = req.headers["range"];
    const pageNumbers = req.headers['pagenumbers'];
    const splitAll = req.headers['splitall'];
    const allowedchoice = ['range', 'pagenumbers', 'splitall']
    if (!choice) {
        return res.json({ message: "please select appocite option to split your pdf" });
    }
    if (!allowedchoice.includes(choice)) {
        return res.json({
            message: "your selected choice is not valid , kindly check it try again"
        })
    }
    try {
        upload.single("test")(req, res, async (err) => {
            if (err) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({
                        message: "Maximum allowed file size is 100MB",
                    });
                }
                if (err.code === "LIMIT_UNEXPECTED_FILE") {
                    return res.status(400).json({
                        message: "You sent wrong field name with PDF file, check and try again",
                    });
                }
                return res.status(400).json({ message: err.message });
            }
            // for range parameter
            if (choice === 'range') {
                const arr = range.split(',').map(Number);
                if (choice && choice === 'range' && arr.length === 2 && arr[0] < arr[1] && arr[1] > arr[0]) {
                    if (!req.file) {
                        return res.json({
                            message: "pdf file is requied to perfome operation"
                        })
                    }
                    // console.log(arr);
                    const split_pdf_result = await split_pdf(`${req.file.path}`, arr, undefined, undefined);
                    if (split_pdf_result.path && split_pdf_result.success === true) {
                        return res.status(200).download(split_pdf_result.path, 'split.zip', (err) => {
                            if (err) {
                                console.log("error in split pdf controller range parameter : ", err)
                            }
                            fs.unlinkSync(split_pdf_result.path);
                            fs.unlinkSync(req.file.path);
                            res.on('close', () => {
                                if (fs.existsSync(split_pdf_result.path)) {
                                    fs.unlinkSync(split_pdf_result.path);
                                }
                                if (fs.existsSync(req.file.path)) {
                                    fs.unlinkSync(req.file.path);
                                }
                            })
                        })
                    } else {
                        if (fs.existsSync(req.file.path)) {
                            fs.unlinkSync(req.file.path);
                        }
                        return res.status(400).json({
                            message: "unable to split your pdf, make sure you send pdf file and it is not encrypted and all parameters are correct"
                        })
                    }
                } else {
                    return res.json({
                        message: "something wrong with range parameter, check it and try again"
                    })
                }
            }
            // for page numbers parameter
            if (choice && choice === 'pagenumbers' && pageNumbers) {
                const arr = pageNumbers.split(',').map(Number);
                if (!req.file) {
                    return res.json({
                        message: "file is required to perfome operation"
                    })
                }
                const zip_pdf_path = await split_pdf(req.file.path, undefined, arr, undefined);
                if (zip_pdf_path.path && zip_pdf_path.success === true) {
                    return res.status(200).download(`${zip_pdf_path.path}`, "split.zip", (err) => {
                        if (err) {
                            console.log("err in split pdf controller pageNumbers : ", err);
                        }
                        if (fs.existsSync(zip_pdf_path.path)) {
                            fs.unlinkSync(zip_pdf_path.path)
                            console.log("pagenumbers zip file deleted");
                        }
                        if (req.file.path) {
                            fs.unlinkSync(req.file.path);
                            console.log("pagenumbers tmp file deleted");
                        }
                        res.on("close", () => {
                            if (fs.existsSync(zip_pdf_path.path)) {
                                fs.unlinkSync(zip_pdf_path.path)
                            }
                            if (fs.existsSync(req.file.path)) {
                                fs.unlinkSync(req.file.path)
                            }
                        })
                    })
                } else {
                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path)
                    }
                    if (fs.existsSync(zip_pdf_path.path)) {
                        fs.unlinkSync(zip_pdf_path.path)
                    }
                    return res.status(400).json({
                        message: "something wrong with pdf file and your parameter"
                    })
                }
            }

            // for split all pdf pages in to individual pdfs
            if (choice && choice === 'splitall' && (splitAll === true || splitAll === 'true')) {
                if (!req.file) {
                    return res.json({
                        message: "file is required to perfome operation"
                    })
                }
                const pdf_path = await split_pdf(`${req.file.path}`, undefined, undefined, true);
                if (pdf_path.path && pdf_path.success === true) {
                    return res.status(200).download(`${pdf_path.path}`, "split.zip", (err) => {
                        if (err) {
                            console.log("err in split all : ", err);
                        }
                        if (fs.existsSync(req.file.path)) {
                            fs.unlinkSync(req.file.path)
                        }
                        if (fs.existsSync(pdf_path.path)) {
                            fs.unlinkSync(pdf_path.path)
                        }
                        res.on("close", () => {
                            if (fs.existsSync(req.file.path)) {
                                fs.unlinkSync(req.file.path)
                            }
                            if (fs.existsSync(pdf_path.path)) {
                                fs.unlinkSync(pdf_path.path)
                            }
                        })
                    })

                } else {
                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path)
                    }
                    return res.json({
                        message: "unable to split your pdf and parameter, check you pdf and try again"
                    })
                }
            } else {
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path)
                }
                return res.json({
                    message: "something wrong with splitall parameter"
                })
            }
        })
    } catch (err) {
        console.log("unable to save file, mutlter error : ", err);
        return res.json({
            message: "unable to save your file , try again after sometime"
        })
    }
}


export default split_pdf_controllter