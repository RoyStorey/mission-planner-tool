import { createWorker } from "tesseract.js";
import path from "path";

export default async function getOCRTextFromImage(imagePath) {
  try {
    await worker.terminate();
  } catch {}
  const worker = createWorker({
    langPath: path.join("./lang-data"),
    logger: (m) => console.log(m),
  });

  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");

  const {
    data: { text },
  } = await worker.recognize(imagePath);
  // console.log(text);

  await worker.terminate();
  return text;
}

// Example usage
// getOCRTextFromImage("./images/untitled.1.png");
