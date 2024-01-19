const fs = require('fs');
const path = require('path');

const fromPath = path.join(__dirname, 'files');
const toPath = path.join(__dirname, 'files-copy');

const getFileNames = (files) => {
  return files.filter((file) => file.isFile()).map((file) => file.name);
};

const unlinkFiles = (files) => {
  const fileNames = getFileNames(files);

  fileNames.forEach((name) => {
    fs.unlink(path.join(toPath, name), (err) => {
      if (err) {
        throw err;
      }
    });
  });
};

const copyFiles = (files) => {
  const fileNames = getFileNames(files);

  fileNames.forEach((name) => {
    fs.copyFile(path.join(fromPath, name), path.join(toPath, name), (err) => {
      if (err) {
        throw err;
      }
    });
  });
};

fs.mkdir(toPath, { recursive: true }, (err) => {
  if (err) {
    throw err;
  }

  fs.readdir(toPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      throw err;
    }

    unlinkFiles(files);

    fs.readdir(fromPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        throw err;
      }

      copyFiles(files);
    });
  });
});
