import multer from 'multer'
import path from "path"
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname,'../tmp'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '_' + Math.floor(Math.random() * 1e9) + '_' + file.originalname;
    cb(null, file.fieldname + '_' + uniqueSuffix)
  }
})

const file_filter = (req, file, cb) => {
  if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    cb(null, true)
  } else {
    cb(new Error("only xlsxs files are allowed"), false);
  }

}

const upload_xlsx = multer({
  storage: storage,
  fileFilter: file_filter,
  limits: {fileSize: 100 * 1024 * 1024}
})

export default upload_xlsx;