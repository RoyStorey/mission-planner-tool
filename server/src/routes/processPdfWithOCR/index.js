// import path from "path";
import path from "path";
import fs from "fs";
import deleteFilesInDirectory from "./node/deleteFilesInDirectory.js";
import getOCRTextFromImage from "./node/getOCRTextFromImage.js";
import pdftopng from "./node/pdf-to-pic.js";
import txtToMissionObject from "./node/txtToMissionObject.js";

async function ocrProcessFilesInDirectory(directoryPath) {
  let pagenumber = 0;
  try {
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const ocrText = await getOCRTextFromImage(filePath);
      const outputFilePath = path.join("output", `${pagenumber}.txt`);
      fs.writeFile(outputFilePath, ocrText, (err) => {
        if (err) throw err;
      });
      console.log(`OCR Text for ${file}:`, ocrText);
      pagenumber++;
    }
  } catch (err) {
    console.error("Error processing files:", err);
  }
}

async function getMissionDataFromDirectory(directoryPath) {
  let missions = [];
  try {
    const files = fs.readdirSync(directoryPath);
    for (const textfile of files) {
      const filePath = path.join(directoryPath, textfile);
      const missionData = await txtToMissionObject(filePath);
      missions.push(missionData);
    }
  } catch (err) {
    console.error("Error processing files:", err);
  }
  console.log(missions);
  return missions;
}

export default async function processPDF(req, res) {
  try {
    const pathtopdf = req.file.path;

    await pdftopng(pathtopdf);
    await ocrProcessFilesInDirectory("./images");
    deleteFilesInDirectory("./images");
    deleteFilesInDirectory("./pdfs");
    let missionData = await getMissionDataFromDirectory("./output");
    deleteFilesInDirectory("./output");
    res.json(missionData);
  } catch (e) {
    console.error(e);
  }
}

// getOCRFromPDF("./pdfs/5 Dec 23 MAG Brief.pdf");
// getMissionDataFromDirectory("output");
// await getOCRTextFromImage("./images/untitled.1.png");
