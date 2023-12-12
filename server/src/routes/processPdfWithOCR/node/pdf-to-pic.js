import { fromPath } from "pdf2pic";
import { mkdirsSync } from "fs-extra";
import { rimraf } from "rimraf";

export default async function pdftopng(pdfpath) {
  const specimen1 = pdfpath;

  const outputDirectory = "./images";

  rimraf.sync(outputDirectory);

  mkdirsSync(outputDirectory);

  const baseOptions = {
    width: 4000,
    height: 2650,
    density: 600,
    savePath: outputDirectory,
  };

  const convert = fromPath(specimen1, baseOptions);

  return convert.bulk(-1);
}

// pdftopng("./pdfs/test.pdf");
