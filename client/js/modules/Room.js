var Room = React.createClass({
	mixins: [ReactRouter.State],
	getInitialState: function () {
		return {username: ''};
	},
	componentDidMount: function () {
		document.title = 'AnonShare - Room: ' + this.getParams().roomId;
	},
	signOut: function () {
		this.setState({username: ''});
	},
	setUsername: function (event) {
		event.preventDefault();
		var form = event.currentTarget;
		user = $(form).find('#username').val();
		$.ajax({
			url: '/rooms/' + this.getParams().roomId,
			data: JSON.stringify({user: user}),
			contentType: 'application/json',
			type: 'POST',
			dataType: 'json',
			success: function (response) {
				this.setState({username: user});
			}.bind(this),
			error: function (xhr, status, err) {
				console.log(status, err.toString());
			}
		});
	},
	render: function () {
		var roomLocation = this.getParams().roomId;
		var loggedIn = this.state.username ?
			<div>
				<PeerConnection user={this.state.username} room={roomLocation} onSignOut={this.signOut}/>
			</div> :
			<div>
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

