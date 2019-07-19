# Kaleidoscope
In every experimentation process we need to be able to quickly visualize the results in order to make progress faster.

## Overview
The main features of Kaleidoscope are:
- Load [Runner Framework](https://github.com/gleraromero/runner) experiment output files.
- Establishes output JSON standard formats called KD types. It includes support for several common types (see Section **KD Types**).
- Table View: Shows the results of the experiment output files in a table view, showing each instance as a row and each selected attribute as a column. Has a filter function integrated and a *Convert to CSV* function to convert the table to CSV to continue its analysis in other spreadsheet editors.
- Details View: Shows further details of an experiment execution on an instance by displaying a modal with graphics and more information.
- The **Table View** and **Details View** need to be implemented for each different KD type. Support for the most common output formats is already implemented.

## Requirements
- Google Chrome Browser

## Usage
1. Open the index.html file with a browser.
2. Add experiment files.
3. Select the attributes for each experiment.
4. Click on the + button for an experiment to see its details.

## Architecture
Kaleidoscope is a Javascript based project and has the following parts:
- index.html: web page visualizer.
- lib
  - [bootstrap](https://getbootstrap.com)
  - [datatables](https://datatables.net)
  - [jquery](https://jquery.com)
  - [plotly](https://plot.ly)
  - [chosen](https://harvesthq.github.io/chosen/)
- examples: folder with execution output examples to be visualized.
- css
  - style.css: styles of the website.
- js
  - utils.js: file with util functions.
  - table_view.js: file with the table view functionality.
  - detail_view.js: file with the detail view functionality.
  - main.js: JS file that gets executed on load of the index.html. It initializes the web page functionality.
  - plotter.js: Util functions for plotting graphs.
  - kaleidoscope.js: Class that represents the system state (handles experiments added, instances, etc).
  - grid.js: Class that uses DataTables to render a table on screen.
  - experiment.js: Class that represents an experiment execution (on many instances).
  - instance.js: Class that represents an instance.
  - parsers (each KD type must have a parser here).
    - parser.js: The base class that each parser must implement in order to be able to be used in Kaleidoscope.
    - ...
    
## Input files
The experiment files format accepted is the one defined by the [Runner Framework](https://github.com/gleraromero/runner). IT a JSON file with the following attributes:
- date: date when the experiment was started.
- time: total time (secs) spent running the experiments from the experimentation file.
- experiment_file: name of the experiment file executed.
- outputs: JSON array of Object with the following attributes for each experiment execution on an instance
  - dataset_name: name of the dataset used.
  - instance_name: name of the instance used.
  - experiment_name: name of the experiment executed.
  - stderr: string of the STDERR log of the execution.
  - stdout: JSON object result from the STDOUT of the execution.
  - exit_code: the execution exit_code (0 means successful, 6 means **OUTOFMEMORY**).
Example:
```javascript
{
  "date": "10-05-2019",
  "experiment_file": "experiment_easy",
  "outputs": [
    { "experiment_name": "preprocessing", "dataset_name": "dataset1", "instance_name": "easy_instance", exit_code: 0, stderr: "PREPROCESSING\nRUNNING\nFINISHED", stdout:{"solution": {"kd_type": "vrp_solution", "routes":[{"path":[0, 1, 3, 5], "t0":0, "duration":500}], "value": 500}}},
    { "experiment_name": "preprocessing", "dataset_name": "dataset2", "instance_name": "hard_instance", exit_code: 6, stderr: "PREPROCESSING\nRUNNING", stdout:""}
  ]
}
```
### stdout
The **stdout** of each execution may contain several keys and values. We consider a value for parsing if it has the __"kd_type"__ attribute. Depending on the value of that attribute is which parser will parse that specific value.

> Note: Not all attributes need to be present. The ones that exist will be parsed.

Following, we enumerate the supported types and their format:
## lp
The LP parser recognizes the "kd_type" == "lp". It represents the execution of an LP solver. The format of the object to be parseable is the following:
- kd_type: "lp"
- screen_output: string _// The output of the LP solver._
- time: number _// Execution time._
- status: string _// Status at the end of the execution._
- simplex_iterations: number _// If using a Simplex solver include de iterations._
- incumbent: json _// Object that represents the best solution._
- incumbent_value: number _// Value of the best solution._
- constraint_count: number _// Number of constraints in the LP._
- variable_count: number _// Number of variables in the LP._
- duals: array(number) _// Dual values of the rows in the dual LP._

**Example:**
```javascript
{
  "kd_type": "lp",
  "screen_output": "SOLVING LP\nITERATIONS 1500\nFINISHED",
  "time": 250.1234,
  "status": "TimeLimitReached",
  "simplex_iterations": 1500,
  "incumbent": {"x":1.0, "y":2.123, "z":3.56},
  "incumbent_value": 100.123,
  "variable_count": 3,
  "constraint_count": 5,
  "duals": [50.0, 60.123, 23.24, 56.0, 43.4]
}
```


# bc
The Branch and Cut parser recognizes the "kd_type" == "bc". It represents the execution of a Branch and Cut solver. The format of the object to be parseable is the following:
- kd_type: "bc"
- screen_output: string _// The output of the BC solver._
- time: number _// Execution time._
- status: string _// Status at the end of the execution._
- constraint_count: number _// Number of constraints in the formulation._
- variable_count: number _// Number of variables in the formulation._
- nodes_open: number _// Number of nodes open at the end of execution._
- nodes_closed: number _// Number of nodes closed at the end of execution._
- root_lp_value: number _// Bound of the LP after closing the root node (after cuts)._
- root_int_solution: json _// Object that represents the best int solution found at the root node._
- root_int_value: number _// Value of the best int solution found at the root node._
- best_bound: number _// Best bound found for the problem._
- best_int_solution: json _// Object that represents the best int solution found._
- best_int_value: number _// Value of the best int solution found._
- cut_count: number _// Total number of cuts added.
- cut_time: number _// Total time spent on separation algorithms.
- cut_families: array(family) // Cut family detailed information.

> Note: family is a JSON object {name:string, cut_count:number, cut_iterations:number, cut_time:number}.

**Example:**
```javascript
{
  "kd_type": "bc",
  "screen_output": "SOLVING BC\nNODES 1500\nFINISHED",
  "time": 250.1234,
  "status": "TimeLimitReached",
  "constraint_count": 100,
  "variable_count": 250,
  "nodes_open": 1200,
  "nodes_closed": 200050,
  "root_lp_value": 123.456,
  "root_int_solution": {"x":1, "y":2, "z":3},
  "root_int_value": 100.123,
  "best_bound": 450.678,
  "best_int_solution": {"x":2, "y":1, "z":5},
  "best_int_value": 500.00,
  "cut_count": 15,
  "cut_time": 50.123,
  "cut_families": [
    {"name": "clique", "cut_count":5, "cut_iterations":6, "cut_time":40.123},
    {"name": "subtour", "cut_count":10, "cut_iterations":3, "cut_time":10.00}
  ]
}
```

## cg
The Column Generation parser recognizes the "kd_type" == "cg". It represents the execution of a Column generation algorithm. The attributes are the following:
- kd_type: "cg"
- screen_output: string _// The output of the CG solver._
- time: number _// Execution time._
- status: string _// Status at the end of the execution._
- incumbent: json _// Object that represents the best solution._
- incumbent_value: number _// Value of the best solution._
- columns_added: number _// Number of columns added to the LP during the CG._
- iteration_count: number _// Number of pricing iterations solved.
- pricing_time: number _// Time spent the pricing problems._
- lp_time: number _// Time spent solving the LP relaxation._
- iterations: array(object) _// Pricing algorithm outputs._

> Note: the objects in the __iterations__ attribute may have an additional "iteration_name" attribute that gets displayed in the UI. 

**Example:**
```javascript
{
  "kd_type": "cg",
  "screen_output": "SOLVING CG\n#iter 1\n#iter 2\n#iter 3\nFINISHED",
  "time": 250.1234,
  "status": "Optimum",
  "incumbent": {"x":1, "y":2, "z":3},
  "incumbent_value": 123.456,
  "columns_added": 550,
  "iteration_count": 5,
  "pricing_time": 120.00,
  "lp_time": 12.345,
  "iterations": [
    {
      "kd_type": "lp",
      "iteration_name": "Heuristic",
      "time": 250.1234,
      "status": "Optimum"
    },
    {
      "kd_type": "bc",
      "iteration_name": "Exact",
      "time": 2050.1234,
      "status": "Optimum"
    }
  ]
}
```

## bcp
The Branch and Cut and Price parser recognizes the "kd_type" == "bcp". It represents the execution of a Branch and Cut and Price solver. This log type is an extension of the **bc** log type, so it contains all its attributes and also the following:
- kd_type: "bcp"
- root_log: json _// Object of kd_type **cg** with the column generation information of the root node._
- root_constraint_count: number _// Number of consatraints after closing the root node._
- root_variable_count: number _// Number of variables after closing the root node._
- final_constraint_count: number _// Number of consatraints after finishing the algorithm._
- final_variable_count: number _// Number of variables after finishing the algorithm._
- lp_time: number _// Time spent solving LP relaxations._
- pricing_time: number _// Time spent solving pricing instances._
- branching_time: number _// Time spent on branching._

**Example:**
```javascript
{
  "kd_type": "bcp",
  "screen_output": "SOLVING BCP\nNODES 1500\nFINISHED",
  "time": 250.1234,
  "status": "TimeLimitReached",
  "constraint_count": 100,
  "variable_count": 250,
  "nodes_open": 1200,
  "nodes_closed": 200050,
  "root_lp_value": 123.456,
  "root_log": {
    "kd_type": "cg",
    ...,
  },
  "root_int_solution": {"x":1, "y":2, "z":3},
  "root_int_value": 100.123,
  "best_bound": 450.678,
  "best_int_solution": {"x":2, "y":1, "z":5},
  "best_int_value": 500.00,
  "cut_count": 15,
  "cut_time": 50.123,
  "cut_families": [
    {"name": "clique", "cut_count":5, "cut_iterations":6, "cut_time":40.123},
    {"name": "subtour", "cut_count":10, "cut_iterations":3, "cut_time":10.00}
  ],
  "root_constraint_count": 120,
  "root_variable_count": 15023,
  "final_constraint_count": 125,
  "final_variable_count": 16058,
  "lp_time": 12.50,
  "pricing_time": 500.00,
  "branching_time": 23.123
}
```

## mlb
The Monodirectional Labeling parser recognizes the "kd_type" == "mlb". It represents the execution of a monodirectional labeling algorithm. The attributes are the following:
- kd_type: "mlb"
- screen_output: string _// The output of the MLB solver._
- time: number _// Execution time._
- status: string _// Status at the end of the execution._
- enumerated_count: number _// Number of labels enumerated._
- extended_count: number _// Number of feasible labels._
- dominated_count: number _// Number of labels dominated._
- processed_count: number _// Number of labels not dominated._
- count_by_length: array(number) _// count_by_length\[i\] = number of labels of length i processed._
- queuing_time: number _// Time spent in the push and pop operations of the queue._
- enumeration_time: number _// Time spent in the enumeration phase._
- extension_time: number _// Time spent in the extension phase._
- domination_time: number _// Time spent in the domination phase._
- process_time: number _// Time spent in the processing phase._
- positive_domination_time: number _// Time spent in the domination phase when the result was "DOMINATED"._
- negative_domination_time: number _// Time spent in the domination phase when the result was "NOT DOMINATED"._

**Example:**
```javascript
{
  "kd_type": "mlb",
  "screen_output": "SOLVING LB\nITERATIONS 1500\nFINISHED",
  "time": 250.1234,
  "status": "Optimum",
  "enumerated_count": 120000,
  "extended_count": 50000,
  "dominated_count": 40000,
  "processed_count": 10000,
  "count_by_length": [1, 1000, 5000, 4000, 999],
  "queuing_time": 10.123,
  "enumeration_time": 20.123,
  "extension_time": 30.123,
  "domination_time": 40.123,
  "process_time": 50.123,
  "positive_domination_time": 10.123,
  "negative_domination_time": 30.000
}
```

## blb
The Bidirectional Labeling parser recognizes the "kd_type" == "blb". It represents the execution of a bidirectional labeling algorithm. The attributes are the following:
- kd_type: "blb"
- screen_output: string _// The output of the BLB solver._
- time: number _// Execution time._
- status: string _// Status at the end of the execution._
- merge_time: number _// Time spent in the merging phase._
- forward: json _// JSON object of kd_type **mlb**_ representing the forward phase. 
- backward: json _// JSON object of kd_type **mlb**_ representing the backward phase. 

**Example:**
```javascript
{
  "kd_type": "blb",
  "screen_output": "SOLVING BLB\nITERATIONS 1500\nFINISHED",
  "time": 250.1234,
  "status": "Optimum",
  "merge_time": 100.123,
  "forward": {
    "kd_type": "mlb",
    "enumerated_count": 120000,
    "extended_count": 50000,
    ...
  },
  "backward": {
    "kd_type": "mlb",
    "enumerated_count": 220000,
    "extended_count": 150000,
    "dominated_count": 140000,
    ...
  }
}
```

## Table View
The main view of Kaleidoscope is a table with the selected experiments' instances as rows, and what we call experiment **attribute descriptors** as columns. An **attribute** is some piece of information from an experiment output that can be showed as a column.
> Example: the execution time could be an **attribute descriptor**.
> Example: the execution time of an experiment on an instance is an **attribute**.

## Details View
The Details View is a dialog that appears if a user clicks on the + icon on the table. It contains more information about the selected experiment execution.
