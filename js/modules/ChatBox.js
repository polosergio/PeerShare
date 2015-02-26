var ChatBox = React.createClass({
	startCall: function () {
		this.props.onStartVideo();
	},
	sendMessage: function (message) {
		this.props.onChatMessage(message);
	},
	sendFile: function (event) {
		this.props.onFileSubmit(event);
	},
	signOut: function () {
		this.props.onSignOut();
	},
	render: function () {
		return (
			<div className="container pull-left">
				<div className="row">
					<div className="col-md-5 chatBox">
						<div className="panel panel-primary">
							<ChatHeader onStartCall={this.startCall} room={this.props.room} onSignOut={this.signOut}/>
							<ChatBody messages={this.props.messages} currentUser={this.props.currentUser} />
							<ChatFooter onChatSubmit={this.sendMessage} onFileChange={this.sendFile}/>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

