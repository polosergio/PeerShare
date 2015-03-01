var Video = React.createClass({
	render: function () {
		return (
			<div className="col-sm-6">
				<div className="embed-responsive embed-responsive-4by3">
					<video className="embed-responsive-item" src={this.props.url} autoPlay controls></video>
				</div>
				<span className="label label-primary">{this.props.caller}</span>
			</div>
		);
	}
});

