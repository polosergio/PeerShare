var Router = ReactRouter,
	DefaultRoute = Router.DefaultRoute,
	Route = Router.Route,
	RouteHandler = Router.RouteHandler;

var App = React.createClass({
	render: function () {
		return (
			<div className="container-fluid">
				<Header />
				<NavigationBar />
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

