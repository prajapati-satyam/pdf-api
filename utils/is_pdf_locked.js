import { PDFDocument } from 'pdf-lib';
import fs from 'fs'

const isPdfLocked = async(pddPath) => {
    let locked = true;
    if (!pddPath || typeof pddPath !== 'string') {
        console.log("pdf path required and must be a string");
        return locked;
    }
    try {

const pdfBytes = fs.readFileSync(pddPath);
const obj = await PDFDocument.load(pdfBytes, {ignoreEncryption: true});
if (obj.isEncrypted === true) {
 return locked
} else {
    locked = false;
    return locked;
}
    } catch (err) {
        console.log("error to read pdf in is Locked pdf function : ", err);
        return locked;
    }
}


export default isPdfLocked;