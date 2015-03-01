var ChatFooter = React.createClass({
	submitMessage: function (event) {
		event.preventDefault();
		var $input = $(event.currentTarget).find('input'),
			message = {
			timestamp: (new Date()).toString(),
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

