var RoomGenerator = React.createClass({
	generateRoom: function () {
		$.ajax({
			type: 'POST',
			url: '/rooms',
			contentType: 'application/json',
			success: function (response) {
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

