const { unlink, copyFile, mkdir, readdir } = require('fs');
const path = require('path');

const fromPath = path.join(__dirname, 'files');
const toPath = path.join(__dirname, 'files-copy');

const unlinkFiles = (files) => {
  files
    .filter((file) => file.isFile())
    .map((file) => file.name)
    .forEach((name) => {
      unlink(path.join(toPath, name), (err) => {
        if (err) {
          throw err;
        }
      });
    });
};

const copyFiles = (files) => {
  files
    .filter((file) => file.isFile())
    .map((file) => file.name)
    .forEach((name) => {
      copyFile(path.join(fromPath, name), path.join(toPath, name), (err) => {
        if (err) {
          throw err;
        }
      });
    });
};

mkdir(toPath, { recursive: true }, (err) => {
  if (err) {
    throw err;
  }

  readdir(toPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      throw err;
    }

    unlinkFiles(files);

    readdir(fromPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        throw err;
      }

      copyFiles(files);
    });
  });
});
