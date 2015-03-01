var PeerConnection = React.createClass({
	queue: [],
	getInitialState: function () {
		return {users: [], peer: undefined};
	},
	componentDidMount: function () {
		this.getUsers();
	},
	componentWillUnmount: function () {
		this.signOut();
	},
	getUsers: function () {
		var url = '/connections?room=' + this.props.room;
		$.get(url, function (response) {
			this.connect(JSON.parse(response));
		}.bind(this));
	},
	connect: function (users) {
		var peer = new Peer(this.props.user.replace(" ", "_"), {
			host: window.location.hostname,
			port: 80,
			path: '/api',
			debug: 3
		});
		this.setState({users: users, peer: peer});
	},
	signOut: function () {
		this.state.peer.destroy();
		this.props.onSignOut();
	},
	startVideo: function () {
		GlobalEvents.trigger('start_video');
	},
	render: function () {
		var Layout = this.state.peer ?
			<div className="row">
				<div className="col-sm-4 col-xs-12">
					<ChatBox peer={this.state.peer} currentUser={this.props.user} room={this.props.room} users={this.state.users}
						onSignOut={this.signOut}
						onStartVideo={this.startVideo} />
					</div>
				<div className="col-sm-8 col-xs-12">
					<ConferenceRoom peer={this.state.peer} />
				</div>
			</div> :
			<span>Establishing connection with peer server...</span>;
		return (Layout);
	}
});

