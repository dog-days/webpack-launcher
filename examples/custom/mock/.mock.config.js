'use strict';

module.exports = function(mockApp) {
  mockApp.get('keeper/v1/topic/:id', function(req, res) {
    res.send({ url: req.url, query: req.query });
  });
  mockApp.post('keeper/v1/topic/:id', function(req, res) {
    res.send({ url: req.url, query: req.query });
  });
  mockApp.post('keeper/v1/topic/add/:id', function(req, res) {
    res.send({ url: req.url, query: req.query, body: req.body });
  });
  mockApp.patch('keeper/v1/topic/edit/:id', function(req, res) {
    res.send({
      url: req.url,
      query: req.query,
      body: req.body,
      'data|10': [{ 'id|+1': 1 }],
    });
  });
};
