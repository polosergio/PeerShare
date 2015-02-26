var PeerConnection = React.createClass({
	queue: [],
	getInitialState: function () {
		return {connections: [], messages: [], chat: false, files: {}, videos: [], peer: undefined};
	},
	getUsers: function () {
		var url = '/connections?room=' + this.props.room;
		$.get(url, function (response) {
			this.setState({connections: JSON.parse(response)}, this.connect);
		}.bind(this));
	},
	componentDidMount: function () {
		this.getUsers();
	},
	componentWillUnmount: function () {
		this.signOut();
	},
	connect: function () {
		var peer = new Peer(this.props.user.replace(" ", "_"), {host: window.location.hostname, port: 80, path: '/api', debug: 3}),
			users = this.state.connections,
			connections = [],
			messages = [];
		this.state.peer = peer;
		this.setState(this.state);
		_.each(users, function (user) {
			var conn = peer.connect(user.peerID, {reliable: true});
			connections.push(conn);

			conn.on('error', function (error) {
				console.log(error);
			});

			conn.on('open', function () {
				conn.on('data', this.getMessage);
				this.setState({connections: connections, chat: true, messages: messages, peer: peer});
			}.bind(this));

			conn.on('close', function () {
				var newState = {
						connections: this.state.connections,
						peer: this.state.peer
					},
					found = _.findWhere(newState.connections, {id: conn.id});
				if (!_.isEmpty(found)) {
					_.pull(newState.connections, found);
				}
				if (!newState.connections.length) {
					newState.chat = false;
					newState.messages = [];
					newState.files = {};
					newState.videos = [];
				}
				this.setState(newState);
			}.bind(this));

		}.bind(this));

		peer.on('connection', function (conn) {
			this.state.chat = true;
			if (this.state.connections.indexOf(conn) === -1) {
				this.state.connections.push(conn);
			}
			this.setState(this.state);
			conn.on('data', function (data) {
				this.getMessage(data);
			}.bind(this));
		}.bind(this));

		peer.on('close', function () {
			this.setState(this.getInitialState());
			this.props.onSignOut();
		}.bind(this));

		peer.on('disconnected', function (conn) {
			console.log('disconnected', conn);
		}.bind(this));

		peer.on('call', function (call) {
			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
			navigator.getUserMedia({video: true, audio: true}, function (stream) {
				call.answer(stream);
				call.on('stream', function (remoteStream) {
					this.state.videos.push({url: URL.createObjectURL(remoteStream), caller: call.peer});
					this.setState(this.state);
				}.bind(this));
			}.bind(this), function (error) {
				console.log(error);
			});
		}.bind(this));
	},
	signOut: function () {
		this.disconnectPeer();
	},
	disconnectPeer: function () {
		_.each(this.state.peer.connections, function (connections) {
			_.each(connections, function (conn) {
				conn.close();
			});
		});
		this.state.peer.destroy();
	},
	getMessage: function (msg) {
		if (msg.blob && msg.blob.constructor === ArrayBuffer) {
			if (_.isUndefined(this.state.files[msg.id])) {
				this.state.files = {};
				this.state.files[msg.id] = {
					file: msg.file,
					blob: {}
				}
				this.state.files[msg.id].blob[msg.chunkId] = new Uint8Array(msg.blob);
			} else {
				this.state.files[msg.id].blob[msg.chunkId] = new Uint8Array(msg.blob);//.push(new Uint8Array(msg.blob));
				console.log('chunk #', _.keys(this.state.files[msg.id].blob).length);
				if (msg.chunks === _.keys(this.state.files[msg.id].blob).length) {
					var dataView = _.values(this.state.files[msg.id].blob);
					var dataBlob = new Blob(dataView);
					var url = window.URL.createObjectURL(dataBlob);
					var message = _.extend(JSON.parse(msg.file), {url: url});
					this.state.messages.push(message);
				}
			}
		} else {
			try {
				var message = _.extend(JSON.parse(msg), {timestamp: (new Date).toString()});
				this.state.messages.push(message);
			} catch (e) {
				console.log(e);
			}
		}
		this.setState(this.state);
	},
	sendMessage: function (message) {
		var message = _.extend(message, {from: this.props.user});
		this.state.messages.push(message);
		this.eachActiveConnection(message);
		this.setState(this.state);
	},
	eachActiveConnection: function (data) {
		_.each(this.state.connections, function (conn) {
			if (data.text) {
				conn.send(JSON.stringify(data));
			} else {
				conn.send(data);
			}
		});
	},
	addToQueue: function (data) {
		if (_.isUndefined(this.worker)) {
			this.startWorker();
		}
		this.queue.push(data);
	},
	startWorker: function () {
		this.worker = setInterval(function (self) {
			self.pickUpJob();
		}, 50, this);
	},
	pickUpJob: function () {
		if (this.queue.length) {
			this.eachActiveConnection(this.queue.shift());
		} else {
			clearInterval(this.worker);
			this.worker = undefined;
		}
	},
	uploadFile: function (event) {
		event.preventDefault();
		var file = event.target.files[0],
			id = this.generateID(),
			chunkSize = 16000,
			totalChunks = Math.ceil(file.size / chunkSize),
			payload = {};
		_.extend(file, {
			from: this.props.user,
			timestamp: (new Date()).toString()
		});
		this.state.messages.push(file);
		this.setState(this.state);
		for (var i = 0; i < totalChunks; i++) {
			var end = ((i + 1) * chunkSize > file.size) ? file.size : (i + 1) * chunkSize,
				start = i * chunkSize,
				blob = file.slice(start, end);
			payload = {
				id: id,
				chunks: totalChunks,
				chunkId: i,
				file: JSON.stringify(file),
				blob: blob
			};
			console.log('chunk #', i, 'from:', start, 'to:', end, ' of total:', totalChunks, 'file size: ', file.size, payload);
			this.addToQueue(payload);
		}
	},
	getInactiveVideos: function (connections) {
		return _.transform(connections, function (result, value, key) {
			found = _.findWhere(value, {type: 'media'});
			if (_.isEmpty(found)) {
				result[key] = value;
			}
		});
	},
	startVideo: function (ignore) {
		var connections = this.state.peer.connections,
			users = this.getInactiveVideos(connections);
		if (!_.isEmpty(users)) {
			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia,
			navigator.getUserMedia({video: true, audio: true}, function (stream) {
				_.each(_.keys(users), function (user) {
					var call = this.state.peer.call(user, stream);
					call.on('stream', function (remoteStream) {
						this.state.videos.push({url: URL.createObjectURL(remoteStream), caller: user.peer});
						this.setState(this.state);
					}.bind(this));
				}.bind(this));
			}.bind(this), function (error) {
				console.log('Failed to get local stream', error);
			});
		}
	},
	generateID: function () {
		return _.random(10000, 99999);
	},
	render: function () {
		var chatBox = this.state.chat ?
			<ChatBox messages={this.state.messages} currentUser={this.props.user} room={this.props.room}
				onChatMessage={this.sendMessage}
				onFileSubmit={this.uploadFile}
				onSignOut={this.signOut}
				onStartVideo={this.startVideo}/> :
			<div>
				<span>Waiting for other people to join session...</span>
			</div> ;
		var conferenceRoom = this.state.videos.length ? <ConferenceRoom videos={this.state.videos} /> : '';
		return (
			<div className="row">
				<div className="col-sm-4 col-xs-12">{chatBox}</div>
				<div className="col-sm-8 col-xs-12">{conferenceRoom}</div>
			</div>
		);
	}
});

