var ConferenceRoom = React.createClass({
	render: function () {
		var Videos = this.props.videos.map(function (video) {
			if (video.url) {
				return (
					<Video url={video.url} caller={video.caller} />
				);
			} else {
				return <span>Not supported</span>
			}
		});
		return (
			<div>{Videos}</div>
		);
	}
});

