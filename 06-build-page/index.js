const {
  readFile,
  writeFile,
  appendFile,
  copyFile,
  readdir,
  stat,
  mkdir,
  unlink,
  promises,
} = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'project-dist');
const baseAssets = path.join(__dirname, 'assets');
const distAssets = path.join(distPath, 'assets');

const baseStyles = path.join(__dirname, 'styles');
const baseComponents = path.join(__dirname, 'components');
const baseTemplate = path.join(__dirname, 'template.html');
const baseFonts = path.join(baseAssets, 'fonts');
const baseImg = path.join(baseAssets, 'img');
const baseSvg = path.join(baseAssets, 'svg');

const distStyles = path.join(distPath, 'style.css');
const distIndex = path.join(distPath, 'index.html');
const distFonts = path.join(distAssets, 'fonts');
const distImg = path.join(distAssets, 'img');
const distSvg = path.join(distAssets, 'svg');

const unlinkFiles = (files, toPath) => {
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

const copyFiles = (files, fromPath, toPath) => {
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

const addContent = (content) => {
  const data = `${content}${String.fromCharCode(0x0a, 0x0a)}`;

  appendFile(distStyles, data, (error) => {
    if (error) {
      throw error;
    }
  });
};

const isHtml = (name) => {
  return path.parse(name).ext === '.html';
};

const isCss = (name) => {
  return path.parse(name).ext === '.css';
};

const formatHtml = async (content) => {
  // const prettier = require('prettier');
  // return await prettier.format(content, {
  //   parser: 'html',
  //   printWidth: 120,
  //   singleQuote: true,
  //   tabWidth: 2,
  // });
  const emptyLineAfterTags = ['</head>', '</header>', '</main>', '</nav>'];

  let formattedHtml = '';
  let currentIndent = 0;

  const lines = content.split('\n');

  for (let line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      continue;
    }

    const closeTag = /^(<\/|\/>)/.test(trimmedLine);

    if (closeTag) {
      currentIndent -= 2;
    }

    let endOfLine = '\n';
    if (emptyLineAfterTags.includes(trimmedLine)) {
      endOfLine += '\n';
    }

    const currentLine =
      currentIndent > 0
        ? `${' '.repeat(currentIndent)}${trimmedLine}${endOfLine}`
        : `${trimmedLine}${endOfLine}`;

    formattedHtml += currentLine;

    if (
      trimmedLine.startsWith('<') &&
      !closeTag &&
      !/(\/>|<\/.*>)$/.test(trimmedLine)
    ) {
      currentIndent += 2;
    }
  }

  return formattedHtml;
};

const buildStyles = () => {
  readdir(baseStyles, { withFileTypes: true }, (err, files) => {
    if (err) {
      throw err;
    }

    files
      .filter((file) => file.isFile() && isCss(file.name))
      .map((file) => file.name)
      .forEach((name) => {
        stat(path.join(baseStyles, name), (err) => {
          if (err) {
            throw err;
          }

          readFile(path.join(baseStyles, name), 'utf-8', (err, content) => {
            if (err) {
              throw err;
            }

            addContent(content);
          });
        });
      });
  });
};

function copyFolder(fromPath, toPath) {
  mkdir(toPath, { recursive: true }, (err) => {
    if (err) {
      throw err;
    }

    readdir(toPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        throw err;
      }

      unlinkFiles(files, toPath);

      readdir(fromPath, { withFileTypes: true }, (err, files) => {
        if (err) {
          throw err;
        }

        copyFiles(files, fromPath, toPath);
      });
    });
  });
}

async function buildTemplate() {
  let data = await promises.readFile(baseTemplate, 'utf-8');
  const fileNames = await promises.readdir(baseComponents);

  const components = await Promise.all(
    fileNames
      .filter((name) => isHtml(name))
      .map((name) =>
        promises
          .readFile(path.join(baseComponents, name), 'utf-8')
          .then((fileData) => ({ name: path.parse(name).name, fileData })),
      ),
  );

  const indexContent = components.reduce(
    (content, { name, fileData }) => content.replace(`{{${name}}}`, fileData),
    data,
  );

  const formattedContent = await formatHtml(indexContent);
  writeFile(distIndex, formattedContent, (err) => {
    if (err) {
      throw err;
    }
  });
}

buildStyles();
copyFolder(baseFonts, distFonts);
copyFolder(baseImg, distImg);
copyFolder(baseSvg, distSvg);
buildTemplate();
