const express = require('express');
const createMockMiddleware = require('restful-mock-middleware');
const app = express();

app.use(createMockMiddleware());

const port = 3000;
app.listen(port, function() {
  const localUrlForTerminal = `http://localhost:${port}`;
  console.log(localUrlForTerminal);
});
