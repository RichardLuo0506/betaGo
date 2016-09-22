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
define('event-hub',["exports"], function (exports) {
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	var InitGame = exports.InitGame = function InitGame(num) {
		_classCallCheck(this, InitGame);

		this.numOfPlayers = num;
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
define('core/core',['exports', 'aurelia-event-aggregator', './../event-hub'], function (exports, _aureliaEventAggregator, _eventHub) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.Core = undefined;

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	var _class, _temp;

	var Core = exports.Core = (_temp = _class = function () {
		function Core(ea) {
			_classCallCheck(this, Core);

			this.ea = ea;
		}

		Core.prototype.initGame = function initGame(num) {
			this.ea.publish(new _eventHub.InitGame(num));
			this.gameCreated = true;
		};

		return Core;
	}(), _class.inject = [_aureliaEventAggregator.EventAggregator], _temp);
});
define('goban/control',['exports', 'aurelia-event-aggregator', './../event-hub'], function (exports, _aureliaEventAggregator, _eventHub) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.Control = undefined;

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	var _class, _temp;

	var Control = exports.Control = (_temp = _class = function () {
		function Control(ea) {
			var _this = this;

			_classCallCheck(this, Control);

			this.ea = ea;
			this.ea.subscribe(_eventHub.InitGame, function (initOpts) {
				return _this.init(initOpts);
			});
		}

		Control.prototype.init = function init(initOpts) {
			if (initOpts.numOfPlayers === 1) {
				this.gameCreated = true;
			}
		};

		return Control;
	}(), _class.inject = [_aureliaEventAggregator.EventAggregator], _temp);
});
define('goban/goban',['exports', 'jquery', 'aurelia-event-aggregator', './../event-hub'], function (exports, _jquery, _aureliaEventAggregator, _eventHub) {
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

	var _class, _temp;

	var Goban = exports.Goban = (_temp = _class = function () {
		function Goban(ea) {
			var _this = this;

			_classCallCheck(this, Goban);

			this.ea = ea;
			ea.subscribe(_eventHub.InitGame, function (initOpts) {
				return _this.init(initOpts);
			});
		}

		Goban.prototype.init = function init(initOpts) {
			if (initOpts.numOfPlayers === 1) {
				this.currentColor = 'black';
				this.size = 19;
				this.lastMovePassed = false;
				this.suicide = false;
				this.history = [];
				this.prisoners = { white: 0, black: 0 };
				this.board = this.createBoard(19);
				this.gameCreated = true;
			}
		};

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
			var _this2 = this;

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

				var neighbors = _this2.getNeighbors(stone[0], stone[1]);
				var self = _this2;
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
	}(), _class.inject = [_aureliaEventAggregator.EventAggregator], _temp);
});
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\n\t<require from=\"core/core\"></require>\n\t<require from=\"goban/goban\"></require>\n\t<require from=\"goban/control\"></require>\n    <require from=\"assets/css/app.css\"></require>\n    <div class=\"goban-container\">\n    \t<core></core>\n\t\t<goban></goban>\n\t\t<control></control>\n    </div>\n</template>\n"; });
define('text!core/core.html', ['module'], function(module) { module.exports = "<template class=\"core\" show.bind=\"!gameCreated\">\n\t<div class=\"menu-select\">\n\t\t<div class=\"menu-option\" click.delegate=\"initGame(1)\">1 Player</div>\n\t\t<div class=\"menu-option\" click.delegate=\"initGame(2)\">2 Players</div>\n\t</div>\n</template>"; });
define('text!goban/control.html', ['module'], function(module) { module.exports = "<template class=\"goban-control\" show.bind=\"gameCreated\">\n\t<div class=\"score-board\">\n\t    <div class=\"black-section\">\n\t    \t<div class=\"stone-label-container\">\n\t\t\t\t<div class=\"black-stone\"></div>\n\t    \t</div>\n\t    \t<div class=\"prisoner-label\">Prisoners</div>\n\t    \t<div class=\"prisoner-count\">0</div>\n\t    </div>\n\t    <div class=\"white-section\">\n\t    \t<div class=\"stone-label-container\">\n\t\t\t\t<div class=\"white-stone\"></div>\n\t    \t</div>\n\t    \t<div class=\"prisoner-label\">Prisoners</div>\n\t    \t<div class=\"prisoner-count\">0</div>\n\t    </div>\n\t</div>\n</template>\n"; });
define('text!goban/goban.html', ['module'], function(module) { module.exports = "<template show.bind=\"gameCreated\">\n    <div class=\"goban\">\n        <div class=\"goban-grid\">\n            <div class=\"goban-column\" repeat.for=\"column of board\">\n            \t<div class=\"moku\" repeat.for=\"moku of column\" click.delegate=\"playMove(moku)\">\n            \t\t<div class=\"stone black\" show.bind=\"moku.stone === 'black'\"></div>\n            \t\t<div class=\"stone white\" show.bind=\"moku.stone === 'white'\"></div>\n            \t</div>\n            </div>\n        </div>\n    </div>\n</template>\n"; });
define('text!assets/css/app.css', ['module'], function(module) { module.exports = "@charset \"UTF-8\";\n@import url(https://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700,800);\n@import url(https://fonts.googleapis.com/css?family=Roboto:400,100,300,500,700,900);\n@import url(https://fonts.googleapis.com/css?family=Raleway:400,100,200,300,500,600,700,800,900);\n@import url(https://fonts.googleapis.com/css?family=Lato:400,100,300,700,900);\n@import url(https://fonts.googleapis.com/css?family=Cormorant+Garamond:400,300,300italic,400italic,500,500italic,600,600italic,700,700italic);\n@import url(https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css);\n@import url(https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css);\n@import url(https://fonts.googleapis.com/icon?family=Material+Icons);\n@import url(https://cdnjs.cloudflare.com/ajax/libs/octicons/3.5.0/octicons.min.css);\n@import url(https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.1/animate.min.css);\nhtml {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  -o-box-sizing: border-box;\n  -ms-box-sizing: border-box;\n  box-sizing: border-box;\n  font-family: sans-serif;\n  -webkit-text-size-adjust: 100%;\n  -ms-text-size-adjust: 100%; }\n\n*, *:before, *:after {\n  -webkit-box-sizing: inherit;\n  -moz-box-sizing: inherit;\n  -o-box-sizing: inherit;\n  -ms-box-sizing: inherit;\n  box-sizing: inherit; }\n\nhtml, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, i, u, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, fieldset, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  vertical-align: baseline;\n  font: inherit;\n  font-size: 100%; }\n\nol, ul {\n  list-style: none; }\n\nblockquote, q {\n  quotes: none; }\n\nblockquote:before, blockquote:after, q:before, q:after {\n  content: \"\";\n  content: none; }\n\n[class*='col-'] {\n  -webkit-transition: all 300ms;\n  -o-transition: all 300ms;\n  -moz-transition: all 300ms;\n  transition: all 300ms; }\n\naudio:not([controls]) {\n  display: none;\n  height: 0; }\n\n[hidden], template {\n  display: none; }\n\nscript {\n  display: none !important; }\n\na {\n  text-decoration: none;\n  -webkit-user-drag: none;\n  -webkit-tap-highlight-color: transparent;\n  -webkit-tap-highlight-color: transparent; }\n  a[href]:hover {\n    cursor: pointer; }\n\na, button, :focus, a:focus, button:focus, a:active, a:hover {\n  outline: 0; }\n\nbody {\n  line-height: 1; }\n\nb, strong {\n  font-weight: bold; }\n\ndfn {\n  font-style: italic; }\n\ncode, kbd, pre, samp {\n  font-size: 1em;\n  font-family: monospace, serif; }\n\npre {\n  white-space: pre-wrap; }\n\nq {\n  quotes: \"“\" \"”\" \"‘\" \"’\"; }\n\nsmall {\n  font-size: 80%; }\n\nsub, sup {\n  position: relative;\n  vertical-align: baseline;\n  font-size: 75%;\n  line-height: 0; }\n\nsup {\n  top: -0.5em; }\n\nsub {\n  bottom: -0.25em; }\n\nfieldset {\n  margin: 0 2px;\n  padding: 0.35em 0.625em 0.75em;\n  border: 1px solid #c0c0c0; }\n\nlegend {\n  padding: 0;\n  border: 0; }\n\nbutton, input, select, textarea {\n  margin: 0;\n  font-size: 100%;\n  font-family: inherit;\n  outline-offset: 0;\n  outline-style: none;\n  outline-width: 0;\n  -webkit-font-smoothing: inherit;\n  background-image: none; }\n\nbutton, input {\n  line-height: normal; }\n\nbutton, html input[type=\"button\"], input[type=\"reset\"], input[type=\"submit\"] {\n  cursor: pointer;\n  -webkit-appearance: button; }\n\ninput[type=\"search\"] {\n  -webkit-box-sizing: content-box;\n  -moz-box-sizing: content-box;\n  box-sizing: content-box;\n  -webkit-appearance: textfield; }\n\ninput[type=\"search\"]::-webkit-search-cancel-button, input[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none; }\n\nbutton::-moz-focus-inner, input::-moz-focus-inner {\n  padding: 0;\n  border: 0; }\n\ntextarea {\n  overflow: auto;\n  vertical-align: top; }\n\nimg {\n  -webkit-user-drag: none; }\n\ntable {\n  border-spacing: 0;\n  border-collapse: collapse; }\n\nh1, h2, h3, h4, h5, h6 {\n  color: black;\n  font-weight: 500;\n  line-height: 1.2;\n  margin-bottom: 9.5px; }\n  h1 small, h2 small, h3 small, h4 small, h5 small, h6 small {\n    font-weight: normal;\n    line-height: 1; }\n\nh1 {\n  font-size: 36px; }\n\nh2 {\n  font-size: 30px; }\n\nh3 {\n  font-size: 24px; }\n\nh4 {\n  font-size: 18px; }\n\nh5 {\n  font-size: 14px; }\n\nh6 {\n  font-size: 12px; }\n\n.stagger-transition.ng-enter-stagger {\n  -moz-transition-delay: 50ms;\n    -o-transition-delay: 50ms;\n       transition-delay: 50ms;\n  -webkit-transition-delay: 50ms;\n  -moz-transition-duration: 0;\n    -o-transition-duration: 0;\n       transition-duration: 0;\n  -webkit-transition-duration: 0; }\n\n.stagger-transition.ng-enter {\n  -o-transition: 200ms cubic-bezier(0.4, 0, 1, 1) all;\n  -moz-transition: 200ms cubic-bezier(0.4, 0, 1, 1) all;\n  transition: 200ms cubic-bezier(0.4, 0, 1, 1) all;\n  -webkit-transition: 200ms cubic-bezier(0.4, 0, 1, 1) all;\n  opacity: 0; }\n\n.stagger-transition.ng-enter-active {\n  opacity: 1; }\n\n.loader {\n  position: absolute;\n  top: 50px;\n  right: 0;\n  bottom: 0;\n  left: 60px;\n  background-color: rgba(0, 0, 0, 0.15);\n  z-index: 30; }\n  @media screen and (min-width: 768px) {\n    .loader {\n      top: 80px;\n      bottom: 30px; } }\n  .loader.ng-hide-remove {\n    -webkit-animation: 500ms fadeIn;\n       -moz-animation: 500ms fadeIn;\n         -o-animation: 500ms fadeIn;\n            animation: 500ms fadeIn; }\n  .loader.ng-hide-add {\n    -webkit-animation: 500ms fadeOut;\n       -moz-animation: 500ms fadeOut;\n         -o-animation: 500ms fadeOut;\n            animation: 500ms fadeOut; }\n  .loader .sk-cube-grid {\n    width: 40px;\n    height: 40px;\n    margin: 100px auto; }\n    .loader .sk-cube-grid .sk-cube {\n      width: 33%;\n      height: 33%;\n      background-color: #2196F3;\n      float: left;\n      -webkit-animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;\n      -moz-animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;\n        -o-animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;\n           animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out; }\n    .loader .sk-cube-grid .sk-cube1 {\n      -webkit-animation-delay: 0.2s;\n      -moz-animation-delay: 0.2s;\n        -o-animation-delay: 0.2s;\n           animation-delay: 0.2s; }\n    .loader .sk-cube-grid .sk-cube2 {\n      -webkit-animation-delay: 0.3s;\n      -moz-animation-delay: 0.3s;\n        -o-animation-delay: 0.3s;\n           animation-delay: 0.3s; }\n    .loader .sk-cube-grid .sk-cube3 {\n      -webkit-animation-delay: 0.4s;\n      -moz-animation-delay: 0.4s;\n        -o-animation-delay: 0.4s;\n           animation-delay: 0.4s; }\n    .loader .sk-cube-grid .sk-cube4 {\n      -webkit-animation-delay: 0.1s;\n      -moz-animation-delay: 0.1s;\n        -o-animation-delay: 0.1s;\n           animation-delay: 0.1s; }\n    .loader .sk-cube-grid .sk-cube5 {\n      -webkit-animation-delay: 0.2s;\n      -moz-animation-delay: 0.2s;\n        -o-animation-delay: 0.2s;\n           animation-delay: 0.2s; }\n    .loader .sk-cube-grid .sk-cube6 {\n      -webkit-animation-delay: 0.3s;\n      -moz-animation-delay: 0.3s;\n        -o-animation-delay: 0.3s;\n           animation-delay: 0.3s; }\n    .loader .sk-cube-grid .sk-cube7 {\n      -webkit-animation-delay: 0s;\n      -moz-animation-delay: 0s;\n        -o-animation-delay: 0s;\n           animation-delay: 0s; }\n    .loader .sk-cube-grid .sk-cube8 {\n      -webkit-animation-delay: 0.1s;\n      -moz-animation-delay: 0.1s;\n        -o-animation-delay: 0.1s;\n           animation-delay: 0.1s; }\n    .loader .sk-cube-grid .sk-cube9 {\n      -webkit-animation-delay: 0.2s;\n      -moz-animation-delay: 0.2s;\n        -o-animation-delay: 0.2s;\n           animation-delay: 0.2s; }\n\n@-webkit-keyframes sk-cubeGridScaleDelay {\n  0%, 70%, 100% {\n    -webkit-transform: scale3D(1, 1, 1);\n    transform: scale3D(1, 1, 1); }\n  35% {\n    -webkit-transform: scale3D(0, 0, 1);\n    transform: scale3D(0, 0, 1); } }\n\n@-moz-keyframes sk-cubeGridScaleDelay {\n  0%, 70%, 100% {\n    -webkit-transform: scale3D(1, 1, 1);\n    -moz-transform: scale3D(1, 1, 1);\n         transform: scale3D(1, 1, 1); }\n  35% {\n    -webkit-transform: scale3D(0, 0, 1);\n    -moz-transform: scale3D(0, 0, 1);\n         transform: scale3D(0, 0, 1); } }\n\n@-o-keyframes sk-cubeGridScaleDelay {\n  0%, 70%, 100% {\n    -webkit-transform: scale3D(1, 1, 1);\n    -o-transform: scale3D(1, 1, 1);\n       transform: scale3D(1, 1, 1); }\n  35% {\n    -webkit-transform: scale3D(0, 0, 1);\n    -o-transform: scale3D(0, 0, 1);\n       transform: scale3D(0, 0, 1); } }\n\n@keyframes sk-cubeGridScaleDelay {\n  0%, 70%, 100% {\n    -webkit-transform: scale3D(1, 1, 1);\n    -moz-transform: scale3D(1, 1, 1);\n      -o-transform: scale3D(1, 1, 1);\n         transform: scale3D(1, 1, 1); }\n  35% {\n    -webkit-transform: scale3D(0, 0, 1);\n    -moz-transform: scale3D(0, 0, 1);\n      -o-transform: scale3D(0, 0, 1);\n         transform: scale3D(0, 0, 1); } }\n\n.card-1 {\n  -webkit-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24); }\n\n.card-2, .fg-modal, .goban-control {\n  -webkit-box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23); }\n\n.card-3, .menu-select {\n  -webkit-box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23); }\n\n.card-4 {\n  -webkit-box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22); }\n\n.card-5 {\n  -webkit-box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n          box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22); }\n\n.flex-xy, .loader, .fg-backdrop, .core, .menu-option, .stone-label-container, .goban-container {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -moz-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n  -webkit-justify-content: center;\n     -moz-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n     -moz-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n\n.aspect-square {\n  position: relative; }\n  .aspect-square:before {\n    display: block;\n    content: \"\";\n    width: 100%;\n    padding-top: 100%; }\n  .aspect-square > .content {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0; }\n\n.aspect-hd {\n  position: relative; }\n  .aspect-hd:before {\n    display: block;\n    content: \"\";\n    width: 100%;\n    padding-top: 56.25%; }\n  .aspect-hd > .content {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0; }\n\n.aspect-phi {\n  position: relative; }\n  .aspect-phi:before {\n    display: block;\n    content: \"\";\n    width: 100%;\n    padding-top: 61.8047%; }\n  .aspect-phi > .content {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0; }\n\n.inline-block {\n  display: inline-block; }\n\n.pointer-events-off {\n  pointer-events: none; }\n\n.pointer-events-on {\n  pointer-events: auto; }\n\n.fg-row, .fg-row-padded {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -moz-box;\n  display: -ms-flexbox;\n  display: flex;\n  width: 100%; }\n  .fg-row.wrap, .wrap.fg-row-padded {\n    -webkit-flex-wrap: wrap;\n        -ms-flex-wrap: wrap;\n            flex-wrap: wrap; }\n\n.fg-row-padded {\n  padding: 0 5px; }\n  .fg-row-padded.wrap {\n    -webkit-flex-wrap: wrap;\n        -ms-flex-wrap: wrap;\n            flex-wrap: wrap; }\n  .fg-row-padded > [class*='fg-col'] {\n    padding: 0 5px; }\n\n.fg-col, .fg-col-10, .fg-col-20, .fg-col-25, .fg-col-33, .fg-col-38, .fg-col-40, .fg-col-50, .fg-col-60, .fg-col-62, .fg-col-66, .fg-col-75, .fg-col-80, .fg-col-90, .fg-col-100 {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 100%;\n     -moz-box-flex: 0;\n      -ms-flex: 0 0 100%;\n          flex: 0 0 100%;\n  display: block;\n  width: 100%; }\n\n.fg-col-10 {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 10%;\n     -moz-box-flex: 0;\n      -ms-flex: 0 0 10%;\n          flex: 0 0 10%;\n  max-width: 10%; }\n\n.fg-col-20 {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 20%;\n     -moz-box-flex: 0;\n      -ms-flex: 0 0 20%;\n          flex: 0 0 20%;\n  max-width: 20%; }\n\n.fg-col-25 {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 25%;\n     -moz-box-flex: 0;\n      -ms-flex: 0 0 25%;\n          flex: 0 0 25%;\n  max-width: 25%; }\n\n.fg-col-33 {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 33.3333%;\n     -moz-box-flex: 0;\n      -ms-flex: 0 0 33.3333%;\n          flex: 0 0 33.3333%;\n  max-width: 33.3333%; }\n\n.fg-col-38 {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 38%;\n     -moz-box-flex: 0;\n      -ms-flex: 0 0 38%;\n          flex: 0 0 38%;\n  max-width: 38%; }\n\n.fg-col-40 {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 40%;\n     -moz-box-flex: 0;\n      -ms-flex: 0 0 40%;\n          flex: 0 0 40%;\n  max-width: 40%; }\n\n.fg-col-50 {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 50%;\n     -moz-box-flex: 0;\n      -ms-flex: 0 0 50%;\n          flex: 0 0 50%;\n  max-width: 50%; }\n\n.fg-col-60 {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 60%;\n     -moz-box-flex: 0;\n      -ms-flex: 0 0 60%;\n          flex: 0 0 60%;\n  max-width: 60%; }\n\n.fg-col-62 {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 62%;\n     -moz-box-flex: 0;\n      -ms-flex: 0 0 62%;\n          flex: 0 0 62%;\n  max-width: 62%; }\n\n.fg-col-66 {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 66.6666%;\n     -moz-box-flex: 0;\n      -ms-flex: 0 0 66.6666%;\n          flex: 0 0 66.6666%;\n  max-width: 66.6666%; }\n\n.fg-col-75 {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 75%;\n     -moz-box-flex: 0;\n      -ms-flex: 0 0 75%;\n          flex: 0 0 75%;\n  max-width: 75%; }\n\n.fg-col-80 {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 80%;\n     -moz-box-flex: 0;\n      -ms-flex: 0 0 80%;\n          flex: 0 0 80%;\n  max-width: 80%; }\n\n.fg-col-90 {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 90%;\n     -moz-box-flex: 0;\n      -ms-flex: 0 0 90%;\n          flex: 0 0 90%;\n  max-width: 90%; }\n\n.fg-backdrop {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 110;\n  background-color: rgba(0, 0, 0, 0.4); }\n  .fg-backdrop.ng-hide-remove {\n    -webkit-animation: 300ms fadeIn cubic-bezier(0.4, 0, 0.2, 1);\n       -moz-animation: 300ms fadeIn cubic-bezier(0.4, 0, 0.2, 1);\n         -o-animation: 300ms fadeIn cubic-bezier(0.4, 0, 0.2, 1);\n            animation: 300ms fadeIn cubic-bezier(0.4, 0, 0.2, 1); }\n  .fg-backdrop.ng-hide-add {\n    -webkit-animation: 300ms fadeOut cubic-bezier(0.4, 0, 0.2, 1);\n       -moz-animation: 300ms fadeOut cubic-bezier(0.4, 0, 0.2, 1);\n         -o-animation: 300ms fadeOut cubic-bezier(0.4, 0, 0.2, 1);\n            animation: 300ms fadeOut cubic-bezier(0.4, 0, 0.2, 1); }\n\n.fg-modal {\n  min-height: 62vh;\n  max-height: 100vh;\n  width: 100%;\n  z-index: 111; }\n  @media screen and (min-width: 768px) {\n    .fg-modal {\n      width: 62vw; } }\n  .fg-modal.ng-hide-remove {\n    -webkit-animation: 300ms zoomIn cubic-bezier(0, 0, 0.2, 1);\n       -moz-animation: 300ms zoomIn cubic-bezier(0, 0, 0.2, 1);\n         -o-animation: 300ms zoomIn cubic-bezier(0, 0, 0.2, 1);\n            animation: 300ms zoomIn cubic-bezier(0, 0, 0.2, 1); }\n  .fg-modal.ng-hide-add {\n    -webkit-animation: 300ms zoomOut cubic-bezier(0.4, 0, 1, 1);\n       -moz-animation: 300ms zoomOut cubic-bezier(0.4, 0, 1, 1);\n         -o-animation: 300ms zoomOut cubic-bezier(0.4, 0, 1, 1);\n            animation: 300ms zoomOut cubic-bezier(0.4, 0, 1, 1); }\n\n[ng\\:cloak], [ng-cloak], [data-ng-cloak], [x-ng-cloak], .ng-cloak, .x-ng-cloak {\n  visibility: hidden !important; }\n\n.core {\n  position: absolute;\n  z-index: 100;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0; }\n\n.menu-select {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -moz-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: justify;\n  -webkit-justify-content: space-between;\n     -moz-box-pack: justify;\n      -ms-flex-pack: justify;\n          justify-content: space-between;\n  width: 400px;\n  height: 160px;\n  border-radius: 2px;\n  padding: 20px;\n  background-color: rgba(63, 81, 181, 0.8); }\n\n.menu-option {\n  font-family: \"Open Sans\", sans-serif;\n  font-size: 24px;\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 170px;\n     -moz-box-flex: 0;\n      -ms-flex: 0 0 170px;\n          flex: 0 0 170px;\n  background-color: rgba(0, 0, 0, 0.12);\n  border-radius: 2px;\n  -webkit-transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);\n  -o-transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);\n  -moz-transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);\n  transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);\n  font-weight: bold; }\n  .menu-option:hover {\n    cursor: pointer;\n    background-color: #3F51B5; }\n\n.goban {\n  z-index: 50;\n  width: 760px;\n  height: 760px;\n  background: url(src/assets/img/goban.svg) center center no-repeat;\n  -webkit-background-size: cover;\n          background-size: cover; }\n\n.goban-grid {\n  z-index: 60;\n  padding: 4px;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -moz-box;\n  display: -ms-flexbox;\n  display: flex; }\n\n.goban-column {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -moz-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: column;\n     -moz-box-orient: vertical;\n     -moz-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  height: 752px;\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 -webkit-calc(100%/19);\n     -moz-box-flex: 0;\n      -ms-flex: 0 0 calc(100%/19);\n          flex: 0 0 calc(100%/19); }\n\n.moku {\n  position: relative;\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 -webkit-calc(100%/19);\n     -moz-box-flex: 0;\n      -ms-flex: 0 0 calc(100%/19);\n          flex: 0 0 calc(100%/19); }\n  .moku:hover {\n    cursor: pointer; }\n\n.stone {\n  z-index: 70;\n  border-radius: 100%;\n  position: absolute;\n  top: 1px;\n  right: 1px;\n  bottom: 1px;\n  left: 1px;\n  -webkit-box-shadow: 2px 2px 4px 0px rgba(0, 0, 0, 0.2), 4px 4px 10px 0px rgba(0, 0, 0, 0.2);\n          box-shadow: 2px 2px 4px 0px rgba(0, 0, 0, 0.2), 4px 4px 10px 0px rgba(0, 0, 0, 0.2); }\n  .stone.black {\n    background-color: black;\n    background: url(src/assets/img/black-stone.png) center center no-repeat;\n    -webkit-background-size: cover;\n            background-size: cover; }\n  .stone.white {\n    background-color: white;\n    background: url(src/assets/img/white-stone.png) center center no-repeat;\n    -webkit-background-size: cover;\n            background-size: cover; }\n\n.goban-control {\n  -webkit-box-flex: 1;\n  -webkit-flex: 1;\n     -moz-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  height: 760px;\n  margin-left: 20px; }\n\n.score-board {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -moz-box;\n  display: -ms-flexbox;\n  display: flex;\n  min-width: 400px;\n  height: 290px; }\n\n.black-section {\n  -webkit-box-flex: 1;\n  -webkit-flex: 1;\n     -moz-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  background-color: white;\n  color: rgba(0, 0, 0, 0.8);\n  border: 2px solid transparent; }\n  .black-section.turn-to-play {\n    border-color: #3F51B5; }\n\n.white-section {\n  -webkit-box-flex: 1;\n  -webkit-flex: 1;\n     -moz-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  background-color: black;\n  color: white;\n  border: 2px solid transparent; }\n  .white-section.turn-to-play {\n    border-color: #3F51B5; }\n\n.stone-label-container {\n  height: 100px; }\n\n.black-stone {\n  width: 50px;\n  height: 50px;\n  border-radius: 100%;\n  background-color: black;\n  background: url(src/assets/img/black-stone.png) center center no-repeat;\n  -webkit-background-size: cover;\n          background-size: cover; }\n\n.white-stone {\n  width: 50px;\n  height: 50px;\n  border-radius: 100%;\n  background-color: white;\n  background: url(src/assets/img/white-stone.png) center center no-repeat;\n  -webkit-background-size: cover;\n          background-size: cover; }\n\n.prisoner-label {\n  text-align: center;\n  font-weight: bold; }\n\n.prisoner-count {\n  text-align: center;\n  font-size: 24px;\n  margin: 10px; }\n\nbody {\n  font-family: \"Lato\", sans-serif;\n  color: white;\n  background-color: #111;\n  width: 100vw;\n  height: 100vh; }\n\n.goban-container {\n  width: 100%;\n  height: 100%;\n  padding: 20px;\n  position: relative; }\n"; });
//# sourceMappingURL=app-bundle.js.map