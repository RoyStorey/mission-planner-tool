import path from "path";
import fs from "fs";

export default function deleteFilesInDirectory(directoryPath) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directoryPath, file), (err) => {
        if (err) throw err;
      });
    }
  });
}

// Usage
// deleteFilesInDirectory("./output");
