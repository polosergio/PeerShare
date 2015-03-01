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

