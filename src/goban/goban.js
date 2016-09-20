import $ from 'jquery';

export class Goban {
	constructor() {
		this.currentColor = 'black';
		this.board = this.createBoard(19);
		this.size = 19;
		this.lastMovePassed = false;
		this.suicide = false;
		this.history = [];
		this.prisoners = { white: 0, black: 0 };
	}

	createBoard(size) {
		let board = [];
		for (let i = 0; i < size; i++) {
			board[i] = [];
			for (let j = 0; j < size; j++) {
				board[i][j] = { stone: 'empty', i: i, j: j };
			}
		}
		return board;
	}

	endGame() {
		alert('Game has ended');
	}

	getGroup(i, j) {
		let color = this.board[i][j].stone;
		let checked = {};
		let checkedArray = [];
		let queue = [
			[i, j]
		];
		let liberties = 0;

		while (queue.length > 0) {
			let stone = queue.pop();
			if (checked[stone]) {
				continue;
			}

			let neighbors = this.getNeighbors(stone[0], stone[1]);
			let self = this;
			$.each(neighbors, function(key, val) {
				let state = self.board[val[0]][val[1]].stone;
				if (state === 'empty') {
					liberties++;
				} else if (state === color) {
					queue.push([val[0], val[1]]);
				}
			});
			checked[stone] = true;
			checkedArray.push(stone);
		}
		return { liberties: liberties, stones: checkedArray };
	}

	getNeighbors(i, j) {
		let neighbors = [];
		if (i > 0)
			neighbors.push([i - 1, j]);
		if (j < this.size - 1)
			neighbors.push([i, j + 1]);
		if (i < this.size - 1)
			neighbors.push([i + 1, j]);
		if (j > 0)
			neighbors.push([i, j - 1]);
		return neighbors;
	}

	pass() {
		if (this.lastMovePassed) {
			this.endGame();
		} else {
			this.lastMovePassed = true;
			this.switchPlayer();
		}
	}

	playMove(moku) {
		let i = moku.i;
		let j = moku.j;
		this.suicide = false;

		if (this.board[i][j].stone !== 'empty') {
			return false;
		}

		let color = this.currentColor;
		this.board[i][j].stone = color;
		let prisoners = [];
		let neighbors = this.getNeighbors(i, j);
		let self = this;

		$.each(neighbors, function(key, val) {
			let state = self.board[val[0]][val[1]].stone;
			if (state !== 'empty' && state !== color) {
				let group = self.getGroup(val[0], val[1]);
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

		$.each(prisoners, function(key, val) {
			$.each(val.stones, function(k, v) {
				let prisoner = self.board[v[0]][v[1]].stone;
				self.board[v[0]][v[1]].stone = 'empty';
				self.prisoners[prisoner]++;
			});
		});

		this.lastMovePassed = false;
		this.recordMove({ i: i, j: j, stone: color, boardSnapShot: this.board, prisoners: this.prisoners });
		this.switchPlayer();
	}

	recordMove(move) {
		this.history.push(move);
		console.log('', this.history);
	}

	switchPlayer() {
		this.currentColor = this.currentColor === 'black' ? 'white' : 'black';
	}
}
