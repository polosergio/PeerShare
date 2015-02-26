var Home = React.createClass({
	componentDidMount: function () {
		document.title = 'AnonShare';
	},
	render: function () {
		return (
			<div>
				<h4>Demo Instructions</h4>
				<ul>
					<li>Create or join room</li>
					<li>Input username</li>
					<li>Start sharing!</li>
				</ul>
			</div>
		);
	}
});

