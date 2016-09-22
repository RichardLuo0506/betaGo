import { EventAggregator } from 'aurelia-event-aggregator';
import { InitGame } from './../event-hub';

export class Core {
	static inject = [EventAggregator];

	constructor(ea) {
		this.ea = ea;
	}

	initGame(num) {
		this.ea.publish(new InitGame(num));
		this.gameCreated = true;
	}
}
