



var express = require('express'),
    path = require('path'),
    fs = require('fs');
   

    var app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    chat = require('./chat/ge-chat.js').init(io);

     

	 app.configure(function(){
      app.engine('.html', require('ejs').__express);
      app.set('port', process.env.NODE_ENV || 3000);
      app.set('views', __dirname + '/views');
      app.set('view engine', 'html');
      app.use(express.logger('dev'));
      app.use(express.json());
      app.use(express.urlencoded());
      app.use(express.methodOverride());
      app.use(express.static(path.join(__dirname, 'public')));
      app.use('/resources', express.static(path.join(__dirname, '/resources')))
	  
    });

	
// Listen for incoming connections from clients
	io.sockets.on('connection', function (socket) {

	// Start listening for mouse move events
	socket.on('mousemove', function (data) {
		
		// This line sends the event (broadcasts it)
		// to everyone except the originating client.
		socket.broadcast.emit('moving', data);
	});
});	

    http.listen(app.get('port'), function(){
      console.log('Node Server Started at port number: '+app.get('port'));
    });
	
	

    fs.readdirSync(__dirname+'/viewController').forEach(function (file) {
      if(file.substr(-3) == '.js') {
        route = require(__dirname+'/viewController/' + file);
        route.controller(app);
      }
    
    });

