var Link = ReactRouter.Link;

var Home = React.createClass({
	render: function () {
		return (
			<div>
				<h4>Hope it works</h4>
			</div>
		);
	}
});

var Header = React.createClass({
	render: function () {
		var subText = 'For Annette\'s use only ',
			imgStyle = {
				height: '30px',
				width: '30px'
			};
		return (
			<div className="page-header">
				<h1>Movie Sharing <small>{subText} <img src="http://apps.timwhitlock.info/static/images/emoji/emoji-apple/1f602.png" style={imgStyle}/></small></h1>
			</div>
		);
	}
});

var NavigationBar = React.createClass({
	mixins: [ReactRouter.State],
	getInitialState: function () {
		return {
			brand: {
				url: 'app',
				title: 'Home'
			},
			locations: [{
				url: 'rooms',
				title: 'Rooms',
				id: 'rooms',
				active: '',
			}]
		};
	},
	setActive: function (e) {
		var id = e.target.id;
		_.each(this.state.locations, function (location) {
			location.active = (location.id === id) ? 'active' : '';
		});
		this.setState(this.state);
	},
	render: function () {
		var Locations = this.state.locations.map(function (location) {
			var active = !_.isEmpty(location.active) || this.isActive(location.url) ? 'active' : '';
			return (
				<li className={active}><Link to={location.url} id={location.id}>{location.title}</Link></li>
			);
		}.bind(this));
		return (
			<nav className="navbar navbar-default">
				<div className="container-fluid">
					<div className="navbar-header">
						<Link to={this.state.brand.url} className="navbar-brand">{this.state.brand.title}</Link>
					</div>
					<div className="collapse navbar-collapse">
						<ul className="nav navbar-nav">
							{Locations}
						</ul>
					</div>
				</div>
			</nav>
		);
	}
});

var RoomLink = React.createClass({
	render: function () {
		return (
			<li>
				<Link to="room" params={{roomId: this.props.id}}>{this.props.id}</Link>
			</li>
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
			<button className="btn btn-default" onClick={this.generateRoom}>Create</button>
		);
	}
});

var PeerConnection = React.createClass({
	getInitialState: function () {
		return {connections: [], messages: [], chat: false};
	},
	getUsers: function () {
		$.get('/connections', function (response) {
			console.log(response);
			this.setState({connections: JSON.parse(response)}, this.connect);
		}.bind(this));
	},
	componentDidMount: function () {
		this.getUsers();
	},
	connect: function () {
		var peer = new Peer(this.props.user, {host: window.location.hostname, port: 9000, path: '/api', reliable: true}),
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
	uploadFile: function (event) {
		event.preventDefault();
		var file = event.target.files[0], blob;
		file.from = this.props.user;
		blob = file.slice();
		this.eachActiveConnection({file: JSON.stringify(file), blob: blob});
	},
	render: function () {
		var chatBox = this.state.chat ?
			<ChatBox messages={this.state.messages} currentUser={this.props.user} onChatMessage={this.sendMessage} onFileSubmit={this.uploadFile} /> :
			<div>
				<span>Waiting for other people to join session...</span>
			</div> ;
		return (
			<div>
				{chatBox}
			</div>
		);
	}
});

var ChatBox = React.createClass({
	sendMessage: function (message) {
		this.props.onChatMessage(message);
	},
	sendFile: function (event) {
		this.props.onFileSubmit(event);
	},
	render: function () {
		return (
			<div className="container pull-left">
				<div className="row">
					<div className="col-md-5 chatBox">
						<div className="panel panel-primary">
							<ChatHeader />
							<ChatBody messages={this.props.messages} currentUser={this.props.currentUser} />
							<ChatFooter onChatSubmit={this.sendMessage} onFileChange={this.sendFile}/>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

var ChatHeader = React.createClass({
	render: function () {
		return (
			<div className="panel-heading">
				<span className="glyphicon glyphicon-comment"></span> Chat
				<div className="btn-group pull-right">
					<button type="button" className="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown">
						<span className="glyphicon glyphicon-chevron-down"></span>
					</button>
					<ul className="dropdown-menu slidedown">
						<li>
							<a href="#">
								<span className="glyphicon glyphicon-off"></span>Sign Out
							</a>
						</li>
					</ul>
				</div>
			</div>
		);
	}
});

var ChatBody = React.createClass({
	render: function () {
		var Messages = this.props.messages.map(function (message) {
			var align = this.props.currentUser === message.from ? 'right' : 'left';
			return (
				<Message align={align} from={message.from} timestamp={message.timestamp} text={message.text} fileName={message.name} fileUrl={message.url}/>
			);
		}.bind(this));
		return (
			<div className="panel-body">
				<ul className="chat">
					{Messages}
				</ul>
			</div>
		);
	}
});

var ChatFooter = React.createClass({
	submitMessage: function (event) {
		event.preventDefault();
		var $input = $(event.currentTarget).find('input'),
			message = {
			timestamp: new Date().toString(),
			text: $input.val()
		};
		$input.val('');
		this.props.onChatSubmit(message);
	},
	uploadFile: function (event) {
		this.props.onFileChange(event);
	},
	render: function () {
		return (
			<div className="panel-footer">
				<form onSubmit={this.submitMessage}>
					<div className="input-group">
						<input id="btn-input" type="text" className="form-control input-sm" placeholder="Type your message here..." autoFocus required />
						<span className="input-group-btn">
							<button className="btn btn-primary btn-sm" id="btn-chat" type="submit">Send</button>
						</span>
						<span className="input-group-btn">
							<button className="btn btn-default btn-sm btn-file">
								<span className="glyphicon glyphicon-upload"></span>
								<input type="file" id="file" onChange={this.uploadFile} />
							</button>
						</span>
					</div>
				</form>
			</div>
		);
	}
});

var Message = React.createClass({
	render: function () {
		var liClass = this.props.align + ' clearfix',
			glyphClass = 'pull-' + this.props.align + ' chat-img',
			userClass = (this.props.align === 'right' ? 'pull-right' : '') + ' primary-font',
			dateClass = (this.props.align === 'right' ? '' : 'pull-right') + ' text-muted',
			date = moment(this.props.timestamp).fromNow(),
			message = (_.isEmpty(this.props.text)) ? <File name={this.props.fileName} url={this.props.fileUrl} /> : this.props.text;
		return (
			<li className={liClass}>
				<span className={glyphClass}>
					<span className="glyphicon glyphicon-user"></span>
				</span>
				<div className="chat-body clearfix">
					<div className="header">
						<strong className={userClass}>{this.props.from}</strong>
						<small className={dateClass}>
							<span className="glyphicon glyphicon-time"></span>{date}
						</small>
					</div>
					<p>{message}</p>
				</div>
			</li>
		);
	}
});

var File = React.createClass({
	render: function () {
		return (
			<span>File sent:
				<a download={this.props.name} href={this.props.url}>
					{this.props.name}
				</a>
			</span>
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
		var roomLocation = 'You are in room ' + this.getParams().roomId;
		var loggedIn = this.state.username ?
			<div>
				<h4>Welcome {this.state.username}! {roomLocation}</h4>
				<PeerConnection user={this.state.username}/>
			</div> :
			<div>
				<h4>{roomLocation}</h4>
				<form name="username" onSubmit={this.setUsername} className="form-inline">
					<div className="form-group">
						<label for="username" className="sr-only">Username</label>
						<input className="form-control" type="text" id="username" placeholder="Enter username" autoFocus required/>
					</div>
					<button className="btn btn-primary" type="submit">Connect</button>
				</form>
			</div> ;
		return (
			<div className="row-fluid">
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
		return (
			<div>
				<RoomList data={this.state.data} />
				<RoomGenerator onSubmit={this.getRooms} />
			</div>
		);
	}
});

var RoomList = React.createClass({
	render: function () {
		var rooms = this.props.data.map(function (room) {
			return (<RoomLink id={room}></RoomLink>);
		});
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Private Rooms Available</h3>
				</div>
				<div className="panel-body">
					<ul className="nav nav-pills nav-stacked">
						{rooms}
					</ul>
				</div>
			</div>
		);
	}
});

