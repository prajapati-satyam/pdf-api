import { encrypt , decrypt} from "node-qpdf2";
import path from 'path'
import fs from 'fs'

async function encrypt_pdf_file_bulk(pdfFilePath, password, outputFoldername) {
  if (!pdfFilePath || !password || !outputFoldername) {
          throw new Error("All Three parameters are required");
  }

  const file_name = path.basename(pdfFilePath);
  const pdf = {
  input: pdfFilePath,
  output: `./${outputFoldername}/${file_name}`,
  password: password,
  }
   try {

     await encrypt(pdf);
     return true;
   } catch (err) {
        console.log("unable to lock pdf : ", err.message);
        return false;
   }
}


export async function decrypt_pdf_file_bulk(pdfFilePath, password, outputFoldername) {
    if (!pdfFilePath || !password || !outputFoldername) {
        throw new Error("All parameters are required");
    }

    const file_name = path.basename(pdfFilePath);

    const pdf = {
        input: pdfFilePath,
        output: `./${outputFoldername}/${file_name}`,
        password: password
    };

    try {
        await decrypt(pdf);

        // IMPORTANT: confirm file exists
        if (!fs.existsSync(pdf.output)) {
            throw new Error("Decryption failed: output file not created");
        }

        return true;

    } catch (err) {
        console.log("Unable to unlock PDF:", err.message);

        //  THROW instead of return
        throw new Error("Invalid password or corrupted PDF");
    }
}


export default encrypt_pdf_file_bulk;