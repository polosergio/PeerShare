var GlobalEvents = (function() {
	var _events = {};

	return {
		on: function(name, cb) {
			_events[name] || (_events[name] = []);
			_events[name].push(cb);
		},

		trigger: function(name, data) {
			if (!_events[name]) {
				return;
			}

			// if you want canceling or anything else, add it in to this cb loop
			_events[name].forEach(function(cb) {
				cb(data);
			});
		}
	}
})();
