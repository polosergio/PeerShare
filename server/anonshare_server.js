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

server.listen(80);

peerServer.on('connection', function (id) {
	connections.push({peerID: id});
});

peerServer.on('disconnect', function (id) {
	connections.splice(connections.indexOf(_.findWhere(connections, {peerID: id})), 1);
});

app.get('/connections', function (req, res) {
	var response = [],
		roomID = req.query.room,
		room = _.findWhere(rooms, {id: parseInt(roomID)});;
	if (!_.isEmpty(roomID) && !_.isEmpty(room)) {
		_.each(connections, function (peer) {
			if (room.conn.indexOf(peer.peerID) !== -1) {
				response.push(peer);
			}
		});
	} else {
		response = {message: "Invalid Room"};
	}
	res.send(JSON.stringify(response));
});

app.get('/rooms', function (req, res) {
	res.send(JSON.stringify(_.pluck(rooms, 'id')));
});

app.post('/rooms', function (req, res) {
	var id = generateID();
	rooms.push({id: id, conn: []});
	res.send(JSON.stringify({id: id}));
});

app.post('/rooms/:id', function (req, res) {
	var id = req.params.id,
		user = req.body.user,
		room = _.findWhere(rooms, {id: parseInt(id)});
	if (!_.isEmpty(room)) {
		room.conn.push(user);
		res.send(JSON.stringify(room));
	} else {
		res.send(JSON.stringify({error: 'Invalid Room'}));
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

