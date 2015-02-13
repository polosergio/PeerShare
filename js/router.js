var Router = ReactRouter,
	DefaultRoute = Router.DefaultRoute,
	Link = Router.Link;
	Route = Router.Route,
	RouteHandler = Router.RouteHandler,
	App = React.createClass({
	render: function () {
		return (
			<div>
				<ul>
					<li><Link to="app">Home</Link></li>
					<li><Link to="rooms">Rooms</Link></li>
				</ul>
				<RouteHandler/>
			</div>
		);
	}
	}),
	routes = (
	<Route name="app" handler={App} path="/">
		<Route name="rooms" handler={Rooms} />
		<Route name="room" path="/rooms/:roomId" handler={Room} />
		<DefaultRoute handler={Home} />
	</Route>
);

Router.run(routes, function (Handler) {
	React.render(<Handler/>, document.body);
});

