var express = require('express');
var _ = require('lodash');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var ExpressPeerServer = require('peer').ExpressPeerServer;
var peerServer = ExpressPeerServer(server, {debug: true});
var rooms = [];
var connections = [];

app.use('/', express.static(__dirname));
app.use('/api', peerServer);
app.use(bodyParser.json());

server.listen(9000);

peerServer.on('connection', function (id) {
	connections.push({peerID: id});
});

peerServer.on('disconnect', function (id) {
	connections.splice(connections.indexOf({peerID: id}), 1);
});

app.get('/rooms', function (req, res) {
	res.send(JSON.stringify(_.pluck(rooms, 'id')));
});

app.get('/connections', function (req, res) {
	res.send(JSON.stringify(connections));
});

app.post('/rooms', function (req, res) {
	var id = generateID();
	rooms.push({id: id, conn: []});
	res.send(JSON.stringify({id: id}));
});

app.post('/rooms/:id', function (req, res) {
	var id = req.params.id,
		peerId = req.body.peerId,
		room = _.findWhere(rooms, {id: parseInt(id)});
	if (!_.isEmpty(room)) {
		room.conn.push(peerId);
		res.send(JSON.stringify(room));
	} else {
		res.send(JSON.stringify({error: 'invalid room'}));
	}
});

function generateID () {
	var id = _.random(10000, 99999),
		exists = _.findWhere(rooms, {id: id});

	if (_.isEmpty(exists)) {
		return id;
	} else {
		return generateID();
	}
}


/*
 var express = require('express'),
	bodyParser = require('body-parser'),
	_ = require('lodash'),
	app = express(),
	ExpressPeerServer = require('peer').ExpressPeerServer,
	connections = [],
	server;

server = app.listen(9000);


app.use('/', express.static(__dirname));
app.use(bodyParser.json());
app.use('/api', ExpressPeerServer(server, {debug: true}));

server.on('connection', function (req, id) {
	console.log('peer connected', id);
});

server.on('disconnect', function (id) {
	console.log(id);
});

*/
