'use strict';

var http = require('http');

function Inquirer (host, port) {

  this.config = {
    'host': host || 'localhost',
    'port': port || 4243
  };
}

var proto = Inquirer.prototype = {};

proto._inquire = function (url, callback) {
  var config = this.config;
  var options = {
    'host': config.host,
    'port': config.port,
    'path': url
  };

  var chunks = [];
  var request = http.request(options, function (response) {
    // TODO: handle error, bad status codes & bad json
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      chunks.push(chunk);
    }).on('end', function () {
      var data = JSON.parse(chunks.join(''));
      callback(null, data);
    });
  });

  request.end();
};

proto.inquire = function (id, callback) {
  this._inquire('/containers/' + id + '/json', callback);
};

proto.inquireRunning = function (callback) {
  this._inquire('/containers/json', callback);
};

module.exports = Inquirer;
