var Home = React.createClass({
	render: function () {
		return (
			<div>
				Hello World!
			</div>
		);
	}
});

var RoomLink = React.createClass({
	render: function () {
		return (
			<div>
				Room available: <Link to="room" params={{roomId: this.props.id}}>{this.props.id}</Link>
			</div>
		);
	}
});

var RoomGenerator = React.createClass({
	generateRoom: function () {
		$.ajax({
			type: 'POST',
			url: '/rooms',
			contentType: 'application/json',
			success: function (response) {
				console.log(response);
				this.props.onSubmit();
			}.bind(this),
			error: function (xhr, status, err) {
				console.error(url, status, err.toString());
			}.bind(this)
		});
	},
	render: function () {
		return (
			<button onClick={this.generateRoom}>Create</button>
		);
	}
});

var PeerConnection = React.createClass({
	getInitialState: function () {
		return {connections: [], messages: [], chat: false};
	},
	getUsers: function () {
		$.get('/connections', function (response) {
			this.setState({connections: JSON.parse(response)}, this.connect);
		}.bind(this));
	},
	componentDidMount: function () {
		this.getUsers();
	},
	connect: function () {
		var peer = new Peer(this.props.user, {host: 'localhost', port: 9000, path: '/api', reliable: true}),
			users = this.state.connections,
			connections = [],
			messages = [];

		_.each(users, function (user) {
			var conn = peer.connect(user.peerID);
			connections.push(conn);
			conn.on('open', function () {
				conn.on('data', function (data) {
					this.getMessage(data);
				}.bind(this));
				this.setState({connections: connections, chat: true, messages: messages});
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
	},
	getMessage: function (msg) {
		if (msg.blob && msg.blob.constructor === ArrayBuffer) {
			var dataView = new Uint8Array(msg.blob);
			var dataBlob = new Blob([dataView]);
			var url = window.URL.createObjectURL(dataBlob);
			var message = _.extend(JSON.parse(msg.file), {url: url});
			this.state.messages.push(message);
		} else {
			try {
				var message = JSON.parse(msg);
				this.state.messages.push(message);
			} catch (e) {
				console.log(e);
			}
		}
		this.setState(this.state);
	},
	sendMessage: function (event) {
		event.preventDefault();
		var form = event.currentTarget,
			$message = $(form).find('#message'),
			message = {from: this.props.user, text: $message.val()};
		$message.val('');
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
	uploadFile: function (event) {
		event.preventDefault();
		var file = event.target.files[0];
		file.from = this.props.user;
		var blob = file.slice();
		this.eachActiveConnection({file: JSON.stringify(file), blob: blob});
	},
	render: function () {
		var messages = this.state.messages.map(function (message) {
			var element = message.text ?
				<Message from={message.from} text={message.text} /> :
				<File from={message.from} file={message} />;
			return element;
		});
		var chat = this.state.chat ?
			<div>
				<form name="chat" onSubmit={this.sendMessage}>
					<input type="text" id="message" />
					<input type="submit" name="submit" />
				</form>
				<input type="file" id="file" onChange={this.uploadFile} />
			</div> : '';
		return (
			<div>
				Welcome {this.props.user}
				{chat}
				{messages}
			</div>
		);
	}
});

var Message = React.createClass({
	render: function () {
		return (
			<p>{this.props.from}: {this.props.text}</p>
		);
	}
});

var File = React.createClass({
	componentDidMount: function () {
		//..
	},
	render: function () {
		return (
			<p> {this.props.from} just sent you the file: <a download={this.props.file.name} href={this.props.file.url}>{this.props.file.name}</a></p>
		);
	}
});

var Room = React.createClass({
	mixins: [ReactRouter.State],
	getInitialState: function () {
		return {username: ''};
	},
	setUsername: function (event) {
		event.preventDefault();
		var form = event.currentTarget;
		user = $(form).find('#username').val();
		this.setState({username: user});
	},
	render: function () {
		var loggedIn = this.state.username ?
			<PeerConnection user={this.state.username}/> :
			<form name="username" onSubmit={this.setUsername}>
				<input type="text" id="username" placeholder="Your name here"/>
				<input type="submit" name="submit" />
			</form> ;
		return (
			<div>
				Room number {this.getParams().roomId}
				{loggedIn}
			</div>
		);
	}
});

var Rooms = React.createClass({
	getInitialState: function () {
		return {data: []};
	},
	getRooms: function () {
		$.ajax({
			url: '/rooms',
			type: 'GET',
			dataType: 'json',
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	componentDidMount: function () {
		this.getRooms();
	},
	render: function () {
		var rooms = this.state.data.map(function (room) {
			return (<RoomLink id={room}></RoomLink>);
		});
		return (
			<div>
				{rooms}
				<RoomGenerator onSubmit={this.getRooms} />
			</div>
		);
	}
});

