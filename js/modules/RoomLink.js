var RoomLink = React.createClass({
	render: function () {
		var Link = ReactRouter.Link;
		return (
			<li>
				<Link to="room" params={{roomId: this.props.id}}>{this.props.id}</Link>
			</li>
		);
	}
});

