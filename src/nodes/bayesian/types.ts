import { Node, NodeDef } from "node-red";

export interface BayesianOptions {
	treshold: number;
	prior: number;
	observations: [probGivenTrue: number, probGivenFalse: number][];
}

export interface BayesianNodeDef extends NodeDef, BayesianOptions {}

// export interface BayesianNode extends Node {}
export type BayesianNode = Node;
