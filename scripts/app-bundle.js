define('app',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var App = exports.App = function App() {
    _classCallCheck(this, App);
  };
});
define('environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  Promise.config({
    warnings: {
      wForgottenReturn: false
    }
  });

  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('goban/goban',['exports', 'jquery'], function (exports, _jquery) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.Goban = undefined;

	var _jquery2 = _interopRequireDefault(_jquery);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	var Goban = exports.Goban = function () {
		function Goban() {
			_classCallCheck(this, Goban);

			this.currentColor = 'black';
			this.board = this.createBoard(19);
			this.size = 19;
			this.lastMovePassed = false;
			this.suicide = false;
			this.history = [];
			this.prisoners = { white: 0, black: 0 };
		}

		Goban.prototype.createBoard = function createBoard(size) {
			var board = [];
			for (var i = 0; i < size; i++) {
				board[i] = [];
				for (var j = 0; j < size; j++) {
					board[i][j] = { stone: 'empty', i: i, j: j };
				}
			}
			return board;
		};

		Goban.prototype.endGame = function endGame() {
			alert('Game has ended');
		};

		Goban.prototype.getGroup = function getGroup(i, j) {
			var _this = this;

			var color = this.board[i][j].stone;
			var checked = {};
			var checkedArray = [];
			var queue = [[i, j]];
			var liberties = 0;

			var _loop = function _loop() {
				var stone = queue.pop();
				if (checked[stone]) {
					return 'continue';
				}

				var neighbors = _this.getNeighbors(stone[0], stone[1]);
				var self = _this;
				_jquery2.default.each(neighbors, function (key, val) {
					var state = self.board[val[0]][val[1]].stone;
					if (state === 'empty') {
						liberties++;
					} else if (state === color) {
						queue.push([val[0], val[1]]);
					}
				});
				checked[stone] = true;
				checkedArray.push(stone);
			};

			while (queue.length > 0) {
				var _ret = _loop();

				if (_ret === 'continue') continue;
			}
			return { liberties: liberties, stones: checkedArray };
		};

		Goban.prototype.getNeighbors = function getNeighbors(i, j) {
			var neighbors = [];
			if (i > 0) neighbors.push([i - 1, j]);
			if (j < this.size - 1) neighbors.push([i, j + 1]);
			if (i < this.size - 1) neighbors.push([i + 1, j]);
			if (j > 0) neighbors.push([i, j - 1]);
			return neighbors;
		};

		Goban.prototype.pass = function pass() {
			if (this.lastMovePassed) {
				this.endGame();
			} else {
				this.lastMovePassed = true;
				this.switchPlayer();
			}
		};

		Goban.prototype.playMove = function playMove(moku) {
			var i = moku.i;
			var j = moku.j;
			this.suicide = false;

			if (this.board[i][j].stone !== 'empty') {
				return false;
			}

			var color = this.currentColor;
			this.board[i][j].stone = color;
			var prisoners = [];
			var neighbors = this.getNeighbors(i, j);
			var self = this;

			_jquery2.default.each(neighbors, function (key, val) {
				var state = self.board[val[0]][val[1]].stone;
				if (state !== 'empty' && state !== color) {
					var group = self.getGroup(val[0], val[1]);
					if (group['liberties'] === 0) {
						prisoners.push(group);
					}
				}
			});

			if (!prisoners.length && this.getGroup(i, j)['liberties'] === 0) {
				this.board[i][j].stone = 'empty';
				this.suicide = true;
				return false;
			}

			_jquery2.default.each(prisoners, function (key, val) {
				_jquery2.default.each(val.stones, function (k, v) {
					var prisoner = self.board[v[0]][v[1]].stone;
					self.board[v[0]][v[1]].stone = 'empty';
					self.prisoners[prisoner]++;
				});
			});

			this.lastMovePassed = false;
			this.recordMove({ i: i, j: j, stone: color, boardSnapShot: this.board, prisoners: this.prisoners });
			this.switchPlayer();
		};

		Goban.prototype.recordMove = function recordMove(move) {
			this.history.push(move);
			console.log('', this.history);
		};

		Goban.prototype.switchPlayer = function switchPlayer() {
			this.currentColor = this.currentColor === 'black' ? 'white' : 'black';
		};

		return Goban;
	}();
});
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\n\t<require from=\"goban/goban\"></require>\n\t<goban></goban>\n</template>\n"; });
define('text!goban/goban.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"goban\">\n        <div class=\"goban-grid\">\n            <div class=\"goban-column\" repeat.for=\"column of board\">\n            \t<div class=\"moku\" repeat.for=\"moku of column\" click.delegate=\"playMove(moku)\">\n            \t\t<div class=\"stone black\" show.bind=\"moku.stone === 'black'\"></div>\n            \t\t<div class=\"stone white\" show.bind=\"moku.stone === 'white'\"></div>\n            \t</div>\n            </div>\n        </div>\n    </div>\n</template>\n"; });
//# sourceMappingURL=app-bundle.js.map