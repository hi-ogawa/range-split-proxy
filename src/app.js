const express = require('express');
const morgan = require('morgan');
const handler = require('./handler.js');

const app = express();

if (process.env.APP_ENV !== 'test') {
  app.use(morgan('short'))
}
app.get('/', handler);

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 7070;
  app.listen(port, () => {
    console.log(':: Listening on port ', port);
  });
}
