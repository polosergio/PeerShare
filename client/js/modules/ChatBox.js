var ChatBox = React.createClass({
	getInitialState: function () {
		return {messages: [], connections: []};
	},
	componentDidMount: function () {
		var users = this.props.users,
			peer = this.props.peer,
			currentUser = this.props.currentUser,
			connections = [],
			self = this;

		peer.on('connection', function (conn) {
			this.updateConnections(conn);
			conn.on('data', this.getMessage);
		}.bind(this));

		peer.on('close', function () {
			this.setState(this.getInitialState());
		}.bind(this));

		_.each(users, function (user) {
			var connection = peer.connect(user.peerID, {reliable: true});
			connections.push(connection);

			connection.on('open', function () {
				connection.on('data', self.getMessage);
			});

			connection.on('close', function () {
				var newState = {
						connections: self.state.connections,
					},
					found = _.findWhere(newState.connections, {id: connection.id});
				if (!_.isEmpty(found)) {
					_.pull(newState.connections, found);
				}
				if (!newState.connections.length) {
					newState.messages = [];
				}
				self.setState(newState);
			});
		});
		this.setState({connections: connections, message: this.state.messages});
	},
	updateConnections: function (conn) {
		var connections = this.state.connections;
		if (connections.indexOf(conn) === -1) {
			connections.push(conn);
		}
		this.setState({connections: connections, messages: this.state.messages});
	},
	getMessage: function (msg) {
		if (msg.blob && msg.blob.constructor === ArrayBuffer) {
			var dataView = new Uint8Array(msg.blob),
				dataBlob = new Blob([dataView]),
				url = window.URL.createObjectURL(dataBlob),
				message = _.extend(JSON.parse(msg.file), {url: url});
			this.state.messages.push(message);
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
	startCall: function () {
		this.props.onStartVideo();
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
	sendMessage: function (message) {
		var message = _.extend(message, {from: this.props.currentUser});
		this.state.messages.push(message);
		this.eachActiveConnection(message);
		this.setState(this.state);
	},
	sendFile: function (event) {
		event.preventDefault();
		var file = event.target.files[0];
		_.extend(file, {
			from: this.props.user,
			timestamp: (new Date()).toString()
		});
		this.state.messages.push(file);
		this.setState(this.state);
		this.eachActiveConnection({file: JSON.stringify(file), blob: file.slice()});
	},
	signOut: function () {
		_.each(this.state.peer.connections, function (connections) {
			_.each(connections, function (conn) {
				conn.close();
			});
		});
		this.props.onSignOut();
	},
	render: function () {
		var Chat = this.state.connections.length ?
			<div className="panel panel-primary">
				<ChatHeader onStartCall={this.startCall} room={this.props.room} onSignOut={this.signOut}/>
				<ChatBody messages={this.state.messages} currentUser={this.props.currentUser} />
				<ChatFooter onChatSubmit={this.sendMessage} onFileChange={this.sendFile}/>
			</div> :
			'Waiting for people to join...';
		return (
			<div className="container pull-left">
				<div className="row">
					<div className="col-md-5 chatBox">{Chat}</div>
				</div>
			</div>
		);
	}
});

