const { readFile, writeFile, appendFile, readdir, stat } = require('fs');
const path = require('path');

const fromPath = path.join(__dirname, 'styles');
const toPath = path.join(__dirname, 'project-dist', 'bundle.css');

writeFile(toPath, '', (error) => {
  if (error) {
    throw error;
  }
});

const addContent = (content) => {
  const data = `${content}${String.fromCharCode(0x0a, 0x0a)}`;

  appendFile(toPath, data, (error) => {
    if (error) {
      throw error;
    }
  });
};

readdir(fromPath, { withFileTypes: true }, (err, files) => {
  if (err) {
    throw err;
  }

  files
    .filter((file) => file.isFile())
    .map((file) => file.name)
    .forEach((name) => {
      stat(path.join(fromPath, name), (err) => {
        if (err) {
          throw err;
        }

        if (path.extname(name).slice(1) !== 'css') {
          return;
        }

        readFile(path.join(fromPath, name), 'utf-8', (err, content) => {
          if (err) {
            throw err;
          }

          addContent(content);
        });
      });
    });
});
