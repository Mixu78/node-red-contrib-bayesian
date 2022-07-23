import { NodeInitializer } from "node-red";
import { BayesianNode, BayesianNodeDef } from "./types";

const isBoolArray = (a: unknown): a is boolean[] => Array.isArray(a) && a.every((b) => typeof b === "boolean");

const calculatePredicate = (probT: number, probF: number, prior: number) =>
	probT / (prior * probT + (1 - prior) * probF);

const nodeInit: NodeInitializer = (RED): void => {
	function BayesianNodeConstructor(this: BayesianNode, config: BayesianNodeDef): void {
		RED.nodes.createNode(this, config);

		this.on("input", ({ payload }, send, done) => {
			if (!isBoolArray(payload)) {
				return done(new Error("msg.payload must be an array of bools"));
			}
			if (payload.length !== config.observations.length) {
				const tooMany = payload.length > config.observations.length;
				this.warn(
					`msg.payload has too ${tooMany ? "many" : "few"} items, expected ${
						config.observations.length
					} but got ${payload.length}`,
				);
			}
			let prior = config.prior;
			for (let i = 0; i < config.observations.length; i++) {
				const state = payload[i] ?? false;
				const [probGivenTrue, probGivenFalse] = config.observations[i];
				const predicate = calculatePredicate(probGivenTrue, probGivenFalse, prior);
				const posterior = state ? predicate * prior : prior;
				prior = posterior;
			}
			send({ payload: prior > config.treshold });
		});
	}

	RED.nodes.registerType("bayesian", BayesianNodeConstructor);
};

export = nodeInit;
