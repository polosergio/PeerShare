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
		document.title = 'AnonShare - Rooms';
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

