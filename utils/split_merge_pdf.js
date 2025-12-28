import { rejects } from "assert";
import { error } from "console";
import fs, { mkdtempSync } from "fs";
import path, { resolve } from "path";
import { PDFDocument } from "pdf-lib";
import { zip, COMPRESSION_LEVEL } from 'zip-a-folder';


async function split_pdf(inputpath, range, pagenumbers, allpagesplit) {
  if (!inputpath || !(fs.existsSync(inputpath))) {
    console.log("input path error")
    return false;
  }
  if ([range, pagenumbers, allpagesplit].filter(Boolean).length >= 2) {
    console.log("only one parameter can be execute at once")
    process.exit(1);
  }
  const existingPdfBytes = fs.readFileSync(inputpath);

  // for if user give all page split true
  if (allpagesplit === true) {
    const existingPdf = await PDFDocument.load(existingPdfBytes);
    // const newPdf = await PDFDocument.create();
    const page_count = existingPdf.getPageIndices();
    const random_dir = fs.mkdtempSync("hello split");

    for (let i = 0; i < page_count.length; i++) {
      const singlePagePdf = await PDFDocument.create();
      const [page] = await singlePagePdf.copyPages(existingPdf, [i]);
      singlePagePdf.addPage(page);
      const pdfBytes = await singlePagePdf.save();
      fs.writeFileSync(`./${random_dir}/page_${i + 1}.pdf`, pdfBytes);
    }

    const zip_file = await zip(`./${random_dir}`, `./${random_dir}.zip`, { compression: COMPRESSION_LEVEL.high });
    fs.rmSync(random_dir, { recursive: true, force: true });
    return { path: path.resolve(`${random_dir}.zip`), success: true }
  }

  // for if user give range of two numbers
  if (range && range.length === 2 && range[0] < range[1] && range[1] > range[0]) {
    let page_count2 = [];
    while (range[0] <= range[1]) {
      page_count2.push(range[0]);
      range[0]++;
    }
    // console.log("i am page count ", page_count2)
    const existingPdf = await PDFDocument.load(existingPdfBytes);
    const newPdf = await PDFDocument.create();
    // check input range is not greater than total pdf length
    if (page_count2.length > existingPdf.getPageCount()) {
      return { path: null, success: false }
    }

    const random_dir = fs.mkdtempSync("hello split");
    for (let i = 0; i < page_count2.length; i++) {
      const singlePagePdf = await PDFDocument.create();
      const [page] = await singlePagePdf.copyPages(existingPdf, [page_count2[i] - 1]);
      singlePagePdf.addPage(page);
      const pdfBytes = await singlePagePdf.save();
      fs.writeFileSync(`./${random_dir}/page_${page_count2[i]}.pdf`, pdfBytes);
    }
    await zip(`./${random_dir}`, `${random_dir}.zip`, {
      compression: COMPRESSION_LEVEL.high
    })
    fs.rmSync(random_dir, { recursive: true, force: true });
    return { path: path.resolve(`${random_dir}.zip`), success: true }
  }
  // for is user give random page numbers
  if (pagenumbers && pagenumbers.length > 0) {
    const existingPdf = await PDFDocument.load(existingPdfBytes);
    for (let i =0; i < pagenumbers.length; i++) {
      if (pagenumbers[i] > existingPdf.getPageCount()) {
          return {path: null, success: false}
      }
    }

    const newPdf = await PDFDocument.create();
    const random_dir = mkdtempSync("hello split");
    for (let i = 0; i < pagenumbers.length; i++) {
      const pageIndex = pagenumbers[i] - 1;

      const singlePagePdf = await PDFDocument.create();
      const [page] = await singlePagePdf.copyPages(existingPdf, [pageIndex]);
      singlePagePdf.addPage(page);

      const pdfBytes = await singlePagePdf.save();

      // keep the file name same as user input (1-based)
      fs.writeFileSync(`${random_dir}/page_${pagenumbers[i]}.pdf`, pdfBytes);
    }
    await zip(`./${random_dir}`, `${random_dir}.zip`, {
      compression: COMPRESSION_LEVEL.high
    })
    fs.rmSync(random_dir, { recursive: true, force: true })
    return { path: path.resolve(`${random_dir}.zip`), success: true }
  }
}
// function for merge pdf

async function merge_pdf(pdfpaths) {
  if (pdfpaths.length < 2) {
    console.log("minimum two pdf file path required to merge it");
    process.exit(1);
  }
  let pdfBytesLoad = [];
  // buffer data of pdf
  for (let i = 0; i < pdfpaths.length; i++) {
    let chunks = [];
    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(pdfpaths[i]);
      stream.on('data', (chunk) => {
       chunks.push(chunk)
      })
      stream.on('end', () => {
        pdfBytesLoad.push(Buffer.concat(chunks));
        resolve();
      })
      stream.on("error", () => {
        reject("err in stream");
        console.log("unable to process stram in merge_pdf");
        process.exit(1);
      })
    })
  }
  console.log("length of pdf bytes load : ", pdfBytesLoad.length);
  // console.log("data of pdf bytes load : ", pdfBytesLoad);
  let existingPdf = [];
  // load data in pdf document
  for (let i = 0; i < pdfBytesLoad.length; i++) {
    const loadpdf = await PDFDocument.load(pdfBytesLoad[i]);
    existingPdf.push(loadpdf);
  }
  console.log("length of existing pdf : ", existingPdf.length);
  // console.log("existing pdf data : ", existingPdf);

  // making final pdf
  // let bytesOfFinalPdf = [];
  const final_pdf = await PDFDocument.create();
  for (let i = 0; i < existingPdf.length; i++) {
    const copyPages = await final_pdf.copyPages(existingPdf[i], existingPdf[i].getPageIndices());

    copyPages.forEach((page) => {
      final_pdf.addPage(page)
    });
  }
  const finalPdfBytes = await final_pdf.save();
  const random_number = Math.floor(100000 + Math.random() * 900000);
  fs.writeFileSync(`merge_${random_number}.pdf`, finalPdfBytes);
  return { path: path.resolve(`merge_${random_number}.pdf`), success: true }
}


export { split_pdf, merge_pdf }