import fs, { mkdtempSync } from "fs";
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
    const newPdf = await PDFDocument.create();
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

    const random_dir = fs.mkdtempSync("hello split");

for (let i = 0; i < page_count2.length; i++) {
      const singlePagePdf = await PDFDocument.create();
      const [page] = await singlePagePdf.copyPages(existingPdf, [i]);
      singlePagePdf.addPage(page);
      const pdfBytes = await singlePagePdf.save();
      fs.writeFileSync(`./${random_dir}/page_${page_count2}.pdf`, pdfBytes);
    }
    await zip(`./${random_dir}`, `${random_dir}.zip`, {
      compression: COMPRESSION_LEVEL.high
    })
    fs.rmSync(random_dir, {recursive: true, force: true});
  }
// for is user give random page numbers
  if (pagenumbers && pagenumbers.length > 0) {
    const existingPdf = await PDFDocument.load(existingPdfBytes);


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
fs.rmSync(random_dir, {recursive: true, force:true})
  }
}