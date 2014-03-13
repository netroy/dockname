var dns = require('native-dns');
var events = require('events');
var util = require('util');

var EventEmitter = events.EventEmitter;

function DNSServer (registry) {

  this.registry = registry;

  var server = this.server = dns.createServer();
  server.on('request', this.onRequest.bind(this));

  EventEmitter.call(this);
}

// extend EventEmitter
util.inherits(DNSServer, EventEmitter);
var proto = DNSServer.prototype;

// proto.lookup = function (domain, callback) {

//   var request = dns.Request({
//     'question': dns.Question({
//       'name': domain,
//       'type': 'A',
//     }),
//     'server': { address: '8.8.8.8', port: 53, type: 'udp' },
//     'timeout': 2000,
//   });

//   request.on('timeout', function () {
//     callback(new Error('Timed out'));
//   });

//   request.on('message', function (error, response) {
//     if (error) {
//       return callback(error);
//     }
//     callback(null, response.answer);
//   });

//   request.send();
// };

proto.onRequest = function (request, response) {
  var questions = request.question;
  var answers = response.answer;
  var registry = this.registry;

  questions.forEach(function (question) {
    var name = question.name;
    if (question.type === 1 && registry.isValid(name)) {
      var addresses = registry.resolve(name);
      addresses.forEach(function (address) {
        answers.push(dns.A({
          'name': name,
          'address': address,
          'ttl': 150,
        }));
      });
    }
  });

  response.send();
};

proto.listen = function (port) {
  var server = this.server;
  port = port || 10053;
  var self = this;
  server.on('listening', function () {
    self.emit('listening', port);
  });
  server.serve(port || 10053);
};

module.exports = DNSServer;