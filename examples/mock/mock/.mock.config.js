'use strict';

module.exports = function(mockApp) {
  mockApp.get('/keeper/v1/topic', function(req, res) {
    res.send({ url: req.url, query: req.query });
  });
  mockApp.post('/keeper/v1/topic', function(req, res) {
    res.send({ url: req.url, query: req.query, body: req.body });
  });
  mockApp.all('/keeper/v1/topic', function(req, res) {
    // all 优先级低于 get post
    res.send({ all: true, url: req.url, query: req.query, body: req.body });
  });
  mockApp.patch('/keeper/v1/topic/:id', function(req, res) {
    res.send({
      url: req.url,
      query: req.query,
      body: req.body,
      'data|10': [{ 'id|+1': 1 }],
    });
  });
  mockApp.delete('/keeper/v1/topic/:id', function(req, res) {
    res.send({ url: req.url, query: req.query });
  });
};
