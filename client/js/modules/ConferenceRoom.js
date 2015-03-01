var ConferenceRoom = React.createClass({
	getInitialState: function () {
		return {videos: []};
	},
	componentDidMount: function () {
		var peer = this.props.peer;
		peer.on('call', function (call) {
			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
			navigator.getUserMedia({video: true, audio: true}, function (stream) {
				call.answer(stream);
				call.on('stream', function (remoteStream) {
					this.state.videos.push({url: URL.createObjectURL(remoteStream), caller: call.peer});
					this.setState(this.state);
				}.bind(this));
			}.bind(this), function (error) {
				console.log(error);
			});
		}.bind(this));

		GlobalEvents.on('start_video', this.startVideoConference);
	},
	getInactiveVideos: function (connections) {
		return _.transform(connections, function (result, value, key) {
			found = _.findWhere(value, {type: 'media'});
			if (_.isEmpty(found)) {
				result[key] = value;
			}
		});
	},
	startVideoConference: function () {
		var connections = this.props.peer.connections,
			users = this.getInactiveVideos(connections);
		if (!_.isEmpty(users)) {
			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia,
			navigator.getUserMedia({video: true, audio: true}, function (stream) {
				_.each(_.keys(users), function (user) {
					var call = this.props.peer.call(user, stream);
					call.on('stream', function (remoteStream) {
						this.state.videos.push({url: URL.createObjectURL(remoteStream), caller: user.peer});
						this.setState(this.state);
					}.bind(this));
				}.bind(this));
			}.bind(this), function (error) {
				console.log('Failed to get local stream', error);
			});
		}
	},
	render: function () {
		var Videos = this.state.videos.map(function (video) {
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

