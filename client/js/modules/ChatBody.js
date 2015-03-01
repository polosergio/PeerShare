var ChatBody = React.createClass({
	componentDidUpdate: function () {
		var body = this.getDOMNode();
		body.scrollTop = body.scrollHeight;
	},
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

