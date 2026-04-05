import { encrypt , decrypt} from "node-qpdf2";
import path from 'path'

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


export async function decrypt_pdf_file_bulk(pdfFilePath, passoword, outputFoldername) {
    if (!pdfFilePath || !passoword || !outputFoldername) {
      throw new Error("All three paramrets are required");
    }
    const file_name = path.basename(pdfFilePath);
    const pdf = {
      input: pdfFilePath,
      output: `./${outputFoldername}/${file_name}`,
      passoword: passoword
    }
    try {
      await decrypt(pdf);
    } catch (err) {
         console.log("unable to unlock pdf ", err.message);
         return false;
    }
}


export default encrypt_pdf_file_bulk;