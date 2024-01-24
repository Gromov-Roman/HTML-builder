const { readdir, stat } = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, 'secret-folder');

const colors = {
  default: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[94m',
  white: '\x1b[97m',
};

const colorsArr = [colors.yellow, colors.blue, colors.green, colors.white];

readdir(folderPath, { withFileTypes: true }, (error, files) => {
  if (error) {
    throw error;
  }

  const fileNames = files
    .filter((file) => file.isFile())
    .map((file) => file.name);

  let colorIndex = 0;
  fileNames.forEach((name) => {
    stat(path.join(folderPath, name), (error, stats) => {
      if (error) {
        throw error;
      }

      const extName = path.extname(name);
      const baseName = path.basename(name, extName);
      const hidden = name[0] === '.';

      const start = hidden ? '' : baseName;
      const ext = hidden ? baseName.slice(1) : extName.slice(1);
      const size = stats.size
        ? (stats.size / 1024).toFixed(2).toString() + 'kb'
        : '0kb';

      const color = colorsArr[colorIndex];
      colorIndex++;
      if (colorIndex > colorsArr.length - 1) {
        colorIndex = 0;
      }
      console.log(`${color}${start} - ${ext} - ${size}${colors.default}`);
    });
  });
});
