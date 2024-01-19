const { writeFile, appendFile } = require('fs');
const path = require('path');

const { stdin, stdout } = process;

const colors = {
  default: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[94m',
  white: '\x1b[97m',
};
const fileName = 'text.txt';
const intro = `${colors.green}The entered text will be added to text.txt file.
${colors.yellow}To exit press CTRL+C, or type .exit <${colors.default}\n`;
const goodbye = `\n${colors.blue}Have a good day!${colors.default}`;
const continueStart = `\n${colors.green}The text:${colors.white}`;
const continueEnd = `${colors.green}have written to a file, you can continue typing:${colors.default}\n`;

writeFile(path.join(__dirname, fileName), '', (error) => {
  if (error) {
    throw error;
  }
  stdout.write(intro);
});

process.on('SIGINT', () => {
  stdout.write(goodbye);
  process.exit();
});

stdin.on('data', (data) => {
  if (data.toString().trim() === 'exit') {
    stdout.write(goodbye);
    process.exit();
    return;
  }

  appendFile(path.join(__dirname, fileName), data, (error) => {
    if (error) {
      throw error;
    }
  });

  stdout.write(`${continueStart} ${data.toString().trim()} ${continueEnd}`);
});
