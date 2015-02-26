var NavigationBar = React.createClass({
	mixins: [ReactRouter.State],
	getInitialState: function () {
		return {
			brand: {
				url: 'app',
				title: 'Home'
			},
			locations: [{
				url: 'rooms',
				title: 'Rooms',
				id: 'rooms',
				active: '',
			}]
		};
	},
	setActive: function (e) {
		var id = e.target.id;
		_.each(this.state.locations, function (location) {
			location.active = (location.id === id) ? 'active' : '';
		});
		this.setState(this.state);
	},
	render: function () {
		var Link = ReactRouter.Link,
			Locations = this.state.locations.map(function (location) {
				var active = !_.isEmpty(location.active) || this.isActive(location.url) ? 'active' : '';
				return (
					<li className={active}><Link to={location.url} id={location.id}>{location.title}</Link></li>
				);
			}.bind(this));
		return (
			<nav className="navbar navbar-default">
				<div className="container-fluid">
					<div className="navbar-header">
						<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-locations">
							<span className="sr-only">Toggle navigation</span>
							<span className="icon-bar"></span>
							<span className="icon-bar"></span>
							<span className="icon-bar"></span>
						</button>
						<Link to={this.state.brand.url} className="navbar-brand">{this.state.brand.title}</Link>
					</div>
					<div className="collapse navbar-collapse" id="navbar-locations">
						<ul className="nav navbar-nav">
							{Locations}
						</ul>
					</div>
				</div>
			</nav>
		);
	}
});

