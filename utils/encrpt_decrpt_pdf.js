import { encrypt , decrypt} from "node-qpdf2";
import path from 'path'

async function encrypt_pdf_file(pdfFilePath, password) {
  if (!pdfFilePath || !password) {
          throw new Error("both parameters are required");
  }

  const file_name = path.basename(pdfFilePath);
  const pdf = {
  input: pdfFilePath,
  output: `./tmp/encrypt/${file_name}`,
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



async function decrypt_pdf_file(pdfFilePath, password) {
  if (!pdfFilePath || !password) {
          throw new Error("both parameters are required");
  }

  const file_name = path.basename(pdfFilePath);
  const pdf = {
  input: pdfFilePath,
  output: `./tmp/decrypt/${file_name}`,
  password: password,
  }
   try {

     await decrypt(pdf);
     return {success: true};
   } catch (err) {
      console.log("unable to decrypt pdf : ", err);
      return {success: false}
   }
}

export { encrypt_pdf_file, decrypt_pdf_file }