var Emitter = require('component/emitter');

module.exports = Tower;

/**
 * Create a new set of channels
 *
 * @return {Function}
 */

function Tower() {
  this.channels = {};
}

/**
 * Close all channels
 */

Tower.prototype.closeAll = function(){
  for (var key in this.channels) {
    var channel = this.channels[key];
    channel.close();
  }
};

/**
 * Get a channel
 *
 * @param {String} name
 *
 * @return {Channel}
 */

Tower.prototype.channel = function(name) {
  var channels = this.channels;
  if (channels[name]) return channels[name];
  var channel = new Channel();
  channel.on('close', function(){
    delete channels[name];
  });
  channels[name] = channel;
  return channel;
};

/**
 * A channel is a group of sockets using a name. We can create
 * new connections to the channel and disconnect them.
 *
 *   new Channel()
 *     .connect([options]) => Socket
 *     .broadcast(name, data)
 *     .close()
 */

function Channel() {
  this.sockets = [];
}

/**
 * Mixin
 */

Emitter(Channel.prototype);

/**
 * Connect to this channel by creating a new socket
 *
 * @param {Object} options
 *
 * @return {Emitter}
 */

Channel.prototype.connect = function(options){
  var self = this;
  var socket = new Emitter();
  socket.disconnect = function(){
    removeFromArray(socket, self.sockets);
    self.emit('disconnect', socket, options);
    socket.emit('disconnect', options);
    socket.off();
  };
  this.sockets.push(socket);
  this.emit('connection', socket, options);
  return socket;
};

/**
 * Broadcast an event to all connected sockets
 *
 * @param {String} name
 * @param {*} data
 *
 * @return {void}
 */

Channel.prototype.broadcast = function(name, data){
  this.sockets.forEach(function(socket){
    socket.emit(name, data);
  });
};

/**
 * Close this channel and close all connections
 *
 * @return {void}
 */

Channel.prototype.close = function(){
  while(this.sockets.length) {
    var socket = this.sockets.pop();
    socket.disconnect();
  }
  this.emit('close');
  this.off();
};

/**
 * Remove an item from an array
 *
 * @param {[type]} item
 * @param {[type]} array
 *
 * @return {[type]}
 */
function removeFromArray(item, array) {
  var index = array.indexOf(item);
  if (index === -1) return;
  array.splice(index, 1);
}