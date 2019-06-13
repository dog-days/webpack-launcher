'use strict';

module.exports = function(mockApp) {
  mockApp.setBaseURL('/keeper/v1');

  mockApp.get('/topic', function(req, res) {
    res.send({ url: req.url, query: req.query });
  });
  mockApp.post('/topic', function(req, res) {
    res.send({ url: req.url, query: req.query, body: req.body });
  });
  mockApp.all('/topic', function(req, res) {
    // all 优先级低于 get post
    res.send({ all: true, url: req.url, query: req.query, body: req.body });
  });
  mockApp.patch('/topic/:id', function(req, res) {
    res.send({
      url: req.url,
      query: req.query,
      body: req.body,
      'data|10': [{ 'id|+1': 1 }],
    });
  });
  mockApp.delete('/topic/:id', function(req, res) {
    res.send({ url: req.url, query: req.query });
  });

  mockApp.setBaseURL('/keeper/v2');
  mockApp.delete('/topic/:id', function(req, res) {
    res.send({ url: req.url, query: req.query });
  });
};
