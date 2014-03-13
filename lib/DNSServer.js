var dns = require('native-dns');

function DNSServer (config) {
  this.config = config;
  this.registry = config.registry;
  this.server = dns.createServer();
  this.server.on('request', this.onRequest.bind(this));
}

var proto = DNSServer.prototype = {};

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
  server.serve(this.config.dns.port);
};

module.exports = DNSServer;