'use strict';

function Registry (config) {
  this.zone = config.dns.zone;
  this.regexp = new RegExp('(^|\\.)' + this.zone + '$', 'i');
  this.cache = {};
}

var proto = Registry.prototype = {};
proto.register = function (id, name, address) {
  var zone = this.zone;
  var cache = this.cache;
  name = name ? [name, zone].join('.') : zone;
  var records = cache[name] || (cache[name] = []);
  var record = {
    'id': id,
    'address': address
  };
  var exists = records.some(function (r) {
    return r.id == id;
  });
  if (!exists) {
    records.push(record);
  }
};

proto.unregister = function (id) {
  var cache = this.cache;
  var filterFn = function (record) {
    return (record.id !== id);
  };
  for (var name in cache) {
    cache[name] = cache[name].filter(filterFn);
  }
};

// proto.find = function (id) {
//   var record = this.cache[id];
//   return record && record.address;
// };

proto.isValid = function (name) {
  return this.regexp.test(name);
};

proto.resolve = function (name) {
  var cache = this.cache;
  if (this.isValid(name) && (name in cache)) {
    var records = cache[name];
    return records.map(function (record) {
      return record.address;
    });
  } else {
    return [];
  }
};

module.exports = Registry;
