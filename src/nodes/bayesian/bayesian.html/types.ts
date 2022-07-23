import { EditorNodeProperties } from "node-red";
import { BayesianOptions } from "../types";

export interface BayesianEditorNodeProperties extends EditorNodeProperties, BayesianOptions {}

export interface BayesianEditorListData {
	probGivenTrue?: number;
	probGivenFalse?: number;
}
