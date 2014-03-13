'use strict';

var Registry = require('../lib/Registry');
var DNSServer = require('../lib/DNSServer');
var Observer = require('../lib/Observer');
var Inquirer = require('../lib/Inquirer');

var host = 'localhost';
var port = 4243;

function Dockname () {
  this.registry  = new Registry('wunder.dev');
  this.dnsServer = new DNSServer(this.registry);
  this.observer  = new Observer(host, port);
  this.inquirer  = new Inquirer(host, port);
  this.register = this.register.bind(this);
}

var proto = Dockname.prototype = {};

proto.register = function  (err, container) {
  var registry = this.registry;
  var id = container.ID;
  var address = container.NetworkSettings.IPAddress;
  var imageName = container.Config.Image.split(':')[0];
  var containerName = container.Name.substr(1);
  var subdomains = [imageName];
  if (containerName !== imageName) {
    subdomains.push(containerName);
  }
  subdomains.forEach(function (subdomain) {
    registry.register(id, subdomain, address);
  });
};

proto.startObserving = function () {
  var self = this;
  var observer = self.observer;
  var inquirer = self.inquirer;
  observer.on('start', function onStart (id) {
    inquirer.inquire(id, self.register);
  }).on('die', function onDeath (id) {
    console.log('%s died', id);
  }).start();
};

var forEach = Array.prototype.forEach;
proto.registerRunning = function () {
  var self = this;
  var inquirer = self.inquirer;
  inquirer.inquireRunning(function (err, containers) {
    forEach.call(containers, function (container) {
      inquirer.inquire(container.Id, self.register);
    });
  });
};

proto.start = function () {
  var self = this;
  self.startObserving();
  self.registerRunning();
  self.dnsServer.on('listening', function (port) {
    console.info('dns server started on %d', port);
  }).listen();
};

module.exports = Dockname;
