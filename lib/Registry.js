'use strict';

function Registry (domain) {
  this.domain = domain;
  this.regexp = new RegExp('(^|\\.)' + domain + '$', 'i');
  this.cache = {};
}

var proto = Registry.prototype = {};
proto.register = function (id, name, address) {
  var domain = this.domain;
  name = name ? [name, domain].join('.') : domain;
  this.cache[id] = {
    'name': name,
    'address': address
  };
};

proto.unregister = function (id) {
  delete this.cache[id];
};

// proto.find = function (id) {
//   var record = this.cache[id];
//   return record && record.address;
// };

proto.isValid = function (name) {
  return this.regexp.test(name);
};

proto.resolve = function (name) {
  var addresses = [];
  if (!this.isValid(name)) {
    return addresses;
  }

  var cache = this.cache;
  var record;
  for (var id in cache) {
    record = cache[id];
    if (record.name === name) {
      addresses.push(record.address);
    }
  }
  return addresses;
};

module.exports = Registry;
