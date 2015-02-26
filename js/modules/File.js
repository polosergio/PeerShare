var File = React.createClass({
	render: function () {
		var fileDiv = _.isEmpty(this.props.url) ? <span>{this.props.name}</span> :
			<a download={this.props.name} href={this.props.url}>{this.props.name}</a>;
		return (
			<div>File sent: {fileDiv}</div>
		);
	}
});

