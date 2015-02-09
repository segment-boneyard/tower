var Tower = require('../');
var assert = require('assert');

describe('Tower', function () {

  it('should broadcast to all sockets', function (done) {
    var tower = new Tower();
    var channel = tower.channel('news');
    var socket = channel.connect();
    socket.on('test', function(){
      done();
    });
    channel.broadcast('test');
  });

  it('should send data to the channel', function (done) {
    var tower = new Tower();
    var channel = tower.channel('news');
    channel.on('connection', function(socket){
      socket.on('test', function(){
        done();
      });
    });
    var socket = channel.connect();
    socket.emit('test');
  });

  it('should disconnect a socket from the channel', function (done) {
    var tower = new Tower();
    var channel = tower.channel('news');
    channel.on('connection', function(socket){
      socket.on('test', function(){
        done(false);
      });
    });
    var socket = channel.connect();
    assert.equal(1, channel.sockets.length);
    socket.disconnect();
    assert.equal(0, channel.sockets.length);
    channel.broadcast('test');
    done();
  });

  it('should disconnect a socket from the channel and fire an event', function (done) {
    var tower = new Tower();
    var channel = tower.channel('news');
    var test = channel.connect();
    channel.on('disconnect', function(socket){
      assert.equal(socket, test);
      done();
    });
    test.disconnect();
  });

  it('should close a channel and disconnect all sockets', function () {
    var tower = new Tower();
    var count = 0;
    var channel = tower.channel('news');
    channel.on('disconnect', function(socket){
      count += 1;
    });
    var one = channel.connect();
    var two = channel.connect();
    assert.equal(channel.sockets.length, 2);
    channel.close();
    assert.equal(count, 2);
    assert.equal(channel.sockets.length, 0);
  });

  it('should close all channels', function () {
    var tower = new Tower();
    var count = 0;
    var news = tower.channel('news');
    news.on('disconnect', function(socket){
      count += 1;
    });
    var sports = tower.channel('sports');
    sports.on('disconnect', function(socket){
      count += 1;
    });
    var one = news.connect();
    var two = sports.connect();
    tower.closeAll();
    assert.equal(count, 2);
    assert.equal(Object.keys(tower.channels).length, 0);
  });

  it('should send to all sockets on a channel', function (done) {
    var tower = new Tower();
    var channel = tower.channel('news');
    var sock = channel.connect();
    sock.on('delivery', function(data){
      assert(data.title === 'Extra Extra!');
      done();
    });
    tower.send('news', 'delivery', {
      title: 'Extra Extra!'
    });
  });

});