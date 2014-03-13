'use strict';

var Registry = require('../lib/Registry');
var DNSServer = require('../lib/DNSServer');
var Observer = require('../lib/Observer');
var Inquirer = require('../lib/Inquirer');

var ENV = process.env;
var dockerHost = ENV.DOCKER_IP || '127.0.0.1';
var dockerPort = ENV.DOCKER_PORT || 4243;
var dnsZone = ENV.DEV_DNSZONE || 'wunder.dev';
var dnsPort = ENV.DNS_PORT || 10053;


var config = {
  'docker': {
    'host': dockerHost,
    'port': dockerPort
  },
  'dns': {
    'zone': dnsZone,
    'port': dnsPort
  }
};

function Dockname () {
  this.registry  = new Registry(config);
  config.registry = this.registry;
  this.dnsServer = new DNSServer(config);
  this.observer  = new Observer(config);
  this.inquirer  = new Inquirer(config);
  this.register = this.register.bind(this);
}

var proto = Dockname.prototype = {};

proto.register = function  (error, container) {
  if (error) {
    return console.error(error);
  }
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
    // console.info(subdomain, address);
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
  this.startObserving();
  this.registerRunning();
  this.dnsServer.listen();
  console.info('dockman started');
};

module.exports = Dockname;
