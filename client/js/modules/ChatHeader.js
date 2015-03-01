var ChatHeader = React.createClass({
	startVideo: function (event) {
		event.preventDefault();
		this.props.onStartCall();
	},
	signOut: function (event) {
		event.preventDefault();
		this.props.onSignOut();
	},
	render: function () {
		return (
			<div className="panel-heading">
				<span className="glyphicon glyphicon-comment"></span> Chat Room: {this.props.room}
				<div className="btn-group pull-right">
					<button type="button" className="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown">
						<span className="glyphicon glyphicon-chevron-down"></span>
					</button>
					<ul className="dropdown-menu slidedown">
						<li>
							<a href="#" onClick={this.startVideo}>
								<span className="glyphicon glyphicon-facetime-video"></span>Start Video
							</a>
						</li>
						<li className="divider"></li>
						<li>
							<a href="#" onClick={this.signOut}>
								<span className="glyphicon glyphicon-off"></span>Sign Out
							</a>
						</li>
					</ul>
				</div>
			</div>
		);
	}
});

