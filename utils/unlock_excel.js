const fs = require('fs');
const JSZip = require('jszip');
const path = require('path');

const excelWorksheetRegex = /^xl\/worksheets\/.*\.xml$/;

async function unlock_xlsl_file(filepath) {
    if (!typeof filepath === 'string') {
        return new Error("File path must be string")
    }
    if (!fs.existsSync(filepath)) {
       return new Error("File path not exist , Check the path and try again")
    }
    const filename_arr = path.basename(filepath).split('.');
    try {
        const fileData = fs.readFileSync(filepath);
        const zip = await JSZip.loadAsync(fileData);

        const outputZip = new JSZip();

        const promises = Object.entries(zip.files).map(async ([fileKey, fileValue]) => {
            const fileText = await fileValue.async("string");

            if (excelWorksheetRegex.test(fileKey)) {
                // Remove <sheetProtection ... />
                const updatedText = fileText.replace(/<sheetProtection[^>]*\/>/g, '');
                outputZip.file(fileKey, updatedText);
            } else {
                outputZip.file(fileKey, fileText);
            }
        });

        // Wait for all files to process
        await Promise.all(promises);

        // Generate ZIP ONCE
        const content = await outputZip.generateAsync({ type: 'nodebuffer' });
        fs.writeFileSync(`${filename_arr[0]} no-password.xlsx`, content);

        // console.log("Password removed successfully!");
    } catch (err) {
        if (fs.existsSync(filepath)) {
             fs.unlinkSync(filepath);
        }
        console.log("Error while unlocking file :", err);
    }
}



module.exports = { unlock_xlsl_file }