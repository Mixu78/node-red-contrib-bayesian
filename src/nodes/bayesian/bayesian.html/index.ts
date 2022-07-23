import { EditorRED } from "node-red";
import { BayesianEditorNodeProperties, BayesianEditorListData } from "./types";

declare const RED: EditorRED;

const rebuildObservations: (items: JQuery<HTMLElement>[]) => [number, number][] = (items) => {
	return items.map((i) => {
		const data: BayesianEditorListData = i.data("data");
		return [data.probGivenTrue ?? NaN, data.probGivenFalse ?? NaN];
	});
};

RED.nodes.registerType<BayesianEditorNodeProperties>("bayesian", {
	category: "function",
	color: "#3fadb5",
	defaults: {
		name: { value: "" },
		treshold: {
			value: 0,
			required: true,
			//Who decided that the validator function may return a string if and only if it takes exactly two arguments??
			validate: function (v: string, _stupidNodeRed: unknown) {
				return Number(v) >= 0 && Number(v) <= 1 ? true : `treshold: ${v} is not between 0 and 1`;
			} as never,
		},
		prior: {
			value: 0,
			required: true,
			validate: function (v: string, _stupidNodeRed: unknown) {
				return Number(v) >= 0 && Number(v) <= 1 ? true : `prior: ${v} is not between 0 and 1`;
			} as never,
		},
		observations: {
			value: [],
			validate: function (v: [number, number][], _stupidNodeRed: unknown) {
				if (v.length === 0) return "observations: must have at least one observation";
				let last = 0;
				return v.every(([a, b], i) => {
					last = i;
					return a >= 0 && b >= 0 && a <= 1 && b <= 1;
				})
					? true
					: `observations: observation #${last} is invalid`;
			} as never,
		},
	},
	inputs: 1,
	outputs: 1,
	icon: "font-awesome/fa-calculator",
	paletteLabel: "bayesian",
	label: function () {
		return this.name || "bayesian";
	},
	oneditprepare: function () {
		$("#node-input-treshold").typedInput({
			types: ["num"],
		});
		$("#node-input-prior").typedInput({
			types: ["num"],
		});
		$("#node-input-observations_").editableList<BayesianEditorListData>({
			addItem: function (item, i, data) {
				const rows = $("<div></div>").appendTo(item);
				const row1 = $("<div></div>", { style: "display: flex; align-items: center" }).appendTo(rows);
				const row2 = $("<div></div>", { style: "display: flex; align-items: center" }).appendTo(rows);
				$("<label></label>", { style: "flex-shrink: 0; width: 150px" })
					.appendTo(row1)
					.text("Probability given true");

				const probGivenTrue = $("<input>", {
					type: "text",
					style: "width: 100%",
				})
					.appendTo(row1)
					.typedInput({ types: ["num"] });
				$("<label></label>", { style: "flex-shrink: 0; width: 150px" })
					.appendTo(row2)
					.text("Probability given false");
				const probGivenFalse = $("<input>", {
					type: "text",
					style: "width: 100%",
				})
					.appendTo(row2)
					.typedInput({ types: ["num"] });

				if (data.probGivenTrue) probGivenTrue.typedInput("value", data.probGivenTrue.toString());
				if (data.probGivenFalse) probGivenFalse.typedInput("value", data.probGivenFalse.toString());

				probGivenTrue.on("change", (event, type, value) => {
					const num = Number(value);
					if (type !== "num" || isNaN(num) || num < 0 || num > 1) {
						data.probGivenTrue = undefined;
						return;
					}
					data.probGivenTrue = num;
					if (probGivenFalse.typedInput("value") === "") {
						probGivenFalse.typedInput("value", (1 - data.probGivenTrue).toString());
					}
				});
				probGivenFalse.on("change", (event, type, value) => {
					const num = Number(value);
					if (type !== "num" || isNaN(num) || num < 0 || num > 1) {
						data.probGivenFalse = undefined;
						return;
					}
					data.probGivenFalse = num;
					if (probGivenTrue.typedInput("value") === "") {
						probGivenTrue.typedInput("value", (1 - data.probGivenFalse).toString());
					}
				});
			},
			sortable: true,
			removable: true,
		});
		for (const [probGivenTrue, probGivenFalse] of this.observations) {
			$("#node-input-observations_").editableList("addItem", {
				probGivenTrue,
				probGivenFalse,
			});
		}
	},
	oneditsave: function () {
		const items = $("#node-input-observations_")
			.editableList("items")
			.toArray()
			.map((e) => $(e));
		this.observations = rebuildObservations(items);
	},
});
