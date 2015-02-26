var Message = React.createClass({
	render: function () {
		var liClass = this.props.align + ' clearfix',
			glyphClass = 'pull-' + this.props.align + ' chat-img',
			userClass = (this.props.align === 'right' ? 'pull-right' : '') + ' primary-font',
			dateClass = (this.props.align === 'right' ? '' : 'pull-right') + ' text-muted',
			date = moment(this.props.timestamp).fromNow(),
			message = (_.isEmpty(this.props.text)) ? <File name={this.props.fileName} url={this.props.fileUrl} /> : this.props.text;
		return (
			<li className={liClass}>
				<span className={glyphClass}>
					<span className="glyphicon glyphicon-user"></span>
				</span>
				<div className="chat-body clearfix">
					<div className="header">
						<strong className={userClass}>{this.props.from}</strong>
						<small className={dateClass}>
							<span className="glyphicon glyphicon-time"></span>{date}
						</small>
					</div>
					<p>{message}</p>
				</div>
			</li>
		);
	}
});

