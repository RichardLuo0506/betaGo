import { EventAggregator } from 'aurelia-event-aggregator';
import { InitGame } from './../event-hub';

export class Control {
	static inject = [EventAggregator];

	constructor(ea) {
		this.ea = ea;
		this.ea.subscribe(InitGame, initOpts => this.init(initOpts));
	}

	init(initOpts) {
		if (initOpts.numOfPlayers === 1) {
			this.gameCreated = true;
		}
	}
}
