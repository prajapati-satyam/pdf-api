import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fs from 'fs'
// Create a new PDFDocument
const pdfDoc = await PDFDocument.create()

// Embed the Times Roman font
const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

// Add a blank page to the document
const page = pdfDoc.addPage()

// Get the width and height of the page
const { width, height } = page.getSize()

// Draw a string of text toward the top of the page
const fontSize = 16
page.drawText('Creating PDFs in JavaScript is awesome!', {
  x: 50,
  y: height - 4 * fontSize,
  size: fontSize,
  font: timesRomanFont,
  color: rgb(1, 0, 0),
})

// Serialize the PDFDocument to bytes (a Uint8Array)
const pdfBytes = await pdfDoc.save()

fs.writeFileSync('./tmp/output.pdf', pdfBytes);

// orignal modyfied code of unlock excel file
// const fs = require('fs');
// const JSZip = require("jszip");
// const path = require('path');

// const excelFileRegex = /^.*\.xls[xm]$/gi;
// const excelWorksheetRegex = /^xl\/worksheets\/.*.xml$/gi;
// let outputZip;


// function processFile(filepath) {
//     if (typeof filepath !== 'string') {
//         return new Error("Filepath must be string");
//     }
//     if (!fs.existsSync(filepath)) {
//         return new Error("Filepath not exist , check the path and try again");
//     }
//     const file_name = path.basename(filepath).split('.');
//     const file_data = fs.readFileSync(`${filepath}`)
//     // outputZipFilename = document.getElementById('input-file').files[0].name;
//     // outputZipExtension = "."+outputZipFilename.split(".").pop();
//     // outputZipFilename = outputZipFilename.substring(0, outputZipFilename.length - outputZipExtension.length);
//     // outputZipFilename = outputZipFilename + "_no-password" + outputZipExtension;
//     JSZip.loadAsync(file_data).then(function (zip) {
//         outputZip = new JSZip();
//         // filesTotalCount = 0;
//         // filesProcessedCount = 0;
//         // passwordsRemoved = 0;
//         for (const [fileKey, fileValue] of Object.entries(zip.files)) {
//             // filesTotalCount++;
//             if (fileKey.match(excelWorksheetRegex)) {
//                 //console.debug("Checking: "+fileKey);
//                 fileValue.async("string").then(function (fileText) {
//                     var startIndex = fileText.indexOf('<sheetProtection ');
//                     if (startIndex === -1) {
//                         // No password found.
//                         outputZip.file(fileKey, fileText);
//                         //console.debug("Analysed: "+fileKey);
//                     } else {
//                         // Removing the password.
//                         var endIndex = fileText.indexOf('/>', startIndex) + 2;
//                         fileText = fileText.replace(fileText.substr(startIndex, endIndex - startIndex), "");
//                         outputZip.file(fileKey, fileText);
//                         //console.debug("Processed: "+fileKey);
//                         // passwordsRemoved++;
//                     }
//                     // filesProcessedCount++;
//                 });
//             } else {
//                 // Other files.
//                 //console.debug("Ignoring: "+fileKey);
//                 fileValue.async("string").then(function (fileText) {
//                     outputZip.file(fileKey, fileText);
//                     //console.debug("Copied: "+fileKey);
//                     // filesProcessedCount++;
//                     // console.log(outputZip);
//                     // const fs = require('fs');


//                     outputZip.generateAsync({ type: 'nodebuffer' })
//                         .then((content) => {
//                             fs.writeFileSync(`${file_name[0]}-no password.xlsx`, content);
//                             // console.log('ZIP saved!');
//                         })
//                         .catch((err) => {
//                             console.log("error while unlocked file : ", err);
//                             // remving orignla excel file
//                             if (fs.existsSync(filepath)) {
//                                 fs.unlinkSync(filepath)
//                             }
//                         });
//                     // fs.writeFileSync('nopassword.xlsx', outputZip)

//                 });
//             }
//         }
//         //console.debug("Waiting for all the files to be processed !");
//         // setTimeout(waitFilesBeingProcessed, 50);
//     }, function (err) {
//         // handleError("Failed to extract the content of the file in the browser ! ("+e.message+")");
//         console.log("Error while removed password from the excel sheet : ", err);
//         // removing orignal excel file
//         if (fs.existsSync(filepath)) {
//             fs.unlinkSync(filepath)
//         }
//     });
// }


// processFile();