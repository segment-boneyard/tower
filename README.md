# Tower

Create groups of channels and connect to them with sockets.

```
npm install tower-channels
```

## Example

```js
var io = require('segmentio/tower');
var tower = new Tower();

var channel = tower.channel('news');

channel.on('connection', function(socket, options){
  console.log('new connection');
  socket.on('update', function(){
    console.log('socket called update');
  });
});

var first = channel.connect({ foo: 'bar' });
var second = channel.connect();

first.emit('update'); // socket called update
second.emit('update'); // socket called update

// We can push events to all sockets
second.on('foo', function(){
  console.log('foo called');
});

// Emit an event on all sockets in this channels
channel.broadcast('foo'); // foo called

// Disconnect from the channel
first.disconnect();

// Close all sockets on this channel
channel.close();

// Or close all channels
tower.close();
```