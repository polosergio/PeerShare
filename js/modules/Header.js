var Header = React.createClass({
	render: function () {
		var subText = ' WebRTC interface',
			imgStyle = {
				height: '30px',
				width: '30px'
			};
		return (
			<div className="page-header">
				<h1>Instant Sharing
					<small>{subText}</small>
				</h1>
			</div>
		);
	}
});

