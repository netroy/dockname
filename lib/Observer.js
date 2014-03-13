"use strict";

var http = require('http');
var util = require('util');
var events = require('events');
var JSONStream = require('JSONStream');

var EventEmitter = events.EventEmitter;

function Observer (host, port) {

  this.config = {
    'host': host || 'localhost',
    'port': port || 4243
  };

  this.parser = JSONStream.parse();

  EventEmitter.call(this);
}

// extend EventEmitter
util.inherits(Observer, EventEmitter);

var proto = Observer.prototype;
proto.start = function () {
  var config = this.config;
  var options = {
    'host': config.host,
    'port': config.port,
    'path': '/events'
  };
  var request = http.request(options, onResponse.bind(this));
  request.end();
};

var onResponse = function (response) {
  var observer = this;
  // TODO: handle error & bad status codes
  response.setEncoding('utf8');
  response.pipe(this.parser).on('data', function (message) {
    observer.emit(message.status, message.id);
  });
};

// export
module.exports = Observer;
