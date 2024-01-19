const { createReadStream } = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'text.txt');

createReadStream(filePath, 'utf8').on('data', (chunk) => console.log(chunk));
