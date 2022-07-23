# node-red-contrib-bayesian

A bayesian binary sensor node for Node-RED, similar to the one
from Home Assistant.

The necessary values for configuration can be calculated using the spreadsheet found [here](https://docs.google.com/spreadsheets/d/1sV5WHM0GTG9oXGuO7QMOOHZDVdWVY0D9bTVLUmSM4co/edit#gid=0).

## Configuration

| Property             | Value                 | Description                                                                                             |
|----------------------|-----------------------|---------------------------------------------------------------------------------------------------------|
| Name                 | `string`              | The name of the node.                                                                                   |
| Probability treshold | `number`              | The probability at which the node should output `true`.                                                 |
| Prior                | `number`              | The prior probability of the event.                                                                     |
| Observations         | `list of two numbers` | Observations and their probabilities of occurring given the state of the observation is `true`/`false`. |

## Inputs and outputs

Input: The node expects an array of booleans as long as the observations list. Each boolean should correspond to the state of an observation. Missing values are treated as `false`, extra values are ignored.

Output: The node outputs either `true` or `false` depending on the observation states and probabilities.
