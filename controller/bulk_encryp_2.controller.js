import upload from "../middleware/multer.js";
import encrypt_pdf_file_bulk from "../utils/encrypt_decrypt_bulk_pdf.js";
import genrate_random_direcory from "../utils/genarte_random_directory.js";
import fs from "fs";
import archiver from "archiver";

const bulk_pdf_encrypt = async (req, res) => {
  const password = req.headers["x-password"];
  if (!password) {
    return res.status(400).json({
      message: "Password is required to lock PDF",
    });
  }

  upload.array("test")(req, res, async (err) => {
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

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded!" });
    }

    const random_dir = genrate_random_direcory();

    try {
      // Encrypt PDFs and delete originals
      for (const [index, file] of req.files.entries()) {
        await encrypt_pdf_file_bulk(file.path, password, random_dir);
        console.log(`${index} : pdf locked`);
        fs.unlinkSync(file.path);
        console.log(`${index} : original pdf deleted`);
      }
      // Set response headers for ZIP download
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", "attachment; filename=locked.zip");

      // Create archiver instance
      const archive = archiver("zip", { zlib: { level: 9 } });

      // Handle archiver errors
      archive.on("error", (err) => {
        console.error("Archiver error:", err);
        res.status(500).json({ message: "Error creating zip file" });
      });

      // Pipe archive directly to response
      archive.pipe(res);

      // Add the random_dir folder into the zip
      archive.directory(`./${random_dir}`, false);

      // Finalize (start streaming)
      await archive.finalize();

      // When finished streaming, cleanup
      archive.on("end", () => {
        if (fs.existsSync(`./${random_dir}`)) {
          fs.rmSync(`./${random_dir}`, { recursive: true, force: true });
          console.log("Cleanup: random folder deleted after streaming");
        }
      });
    } catch (error) {
      console.error("Error:", error.message);
      if (fs.existsSync(`./${random_dir}`)) {
        fs.rmSync(`./${random_dir}`, { recursive: true, force: true });
      }
      return res.status(500).json({ message: error.message });
    }
  });
};

export default bulk_pdf_encrypt;
