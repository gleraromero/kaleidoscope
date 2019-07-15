# Kaleidoscope
In every experimentation process we need to be able to quickly visualize the results in order to make progress faster.

## Overview
The main features of Kaleidoscope are:
- Load [Runner Framework](https://github.com/gleraromero/runner) experiment output files.
- Establishes output JSON standard formats called *ExecutionLog* types. It includes support for several common types (see Section **Execution Log Types**).
- Table View: Shows the results of the experiment output files in a table view, showing each instance as a row and each selected attribute as a column. Has a filter function integrated and a *Convert to CSV* function to convert the table to CSV to continue its analysis in other spreadsheet editors.
- Details View: Shows further details of an experiment execution on an instance by displaying a modal with graphics and more information.
- The **Table View** and **Details View** need to be implemented for each different type of *ExecutionLog*. Support for the most common output formats is already implemented.

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
- css
  - style.css: styles of the website.
- js
  - utils.js: file with util functions.
  - table_view.js: file with the table functionality.
  - detail_view.js: file with the detail modal functionality.
  - index.js: JS file that gets executed on load of the index.html. It initializes the web page functionality.
  - log_parsers (*each execution log parser has an implementation here*)
    - base.js: The base class that each ExecutionLogParser must implement in order to be able to be used in Kaleidoscope.
    - simplex.js: Support for the **Simplex execution** log.
    - colgen.js: Support for the **Column generation** execution log.
    - bc.js: Support for the **Branch and cut** execution log.
    - bcp.js: Support for the **Branch cut and price** execution log.
    - mlb.js: Support for the **Monodirectional labeling** execution log.
    - blb.js: Support for the **Bidirectional labeling** execution log.
  - solution_parsers (*each solution parser has an implementation here*)
    - base.js: The base class that each SolutionParser must implement in order to be able to be used in Kaleidoscope.
    - vrp.js: Support for the **VRP solution**.
    
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
    { "experiment_name": "preprocessing", "dataset_name": "dataset1", "instance_name": "easy_instance", exit_code: 0, stderr: "PREPROCESSING\nRUNNING\nFINISHED", stdout:{"solution": [0, 1, 3, 5], "value": 500}},
    { "experiment_name": "preprocessing", "dataset_name": "dataset2", "instance_name": "hard_instance", exit_code: 6, stderr: "PREPROCESSING\nRUNNING", stdout:""}
  ]
}
```
### stdout
In order to be compatible with Kaleidoscope, the **stdout** of each execution should contain two attributes 
- solutions: array of JSON objects with the solutions found in the execution.
  - solution_name: name of the solution (typically the stage where the solution was found).
  - solution_type: string identifying the solution type (used to select the parser in the *solution_parsers* directory).
  - *other information about the solution*.
- execution_logs: array of JSON objects for the execution logs of the different stages of the execution.
  - log_name: name of the execution log (typically the stage of execution).
  - log_type: string identifying the log type (used to select the parser in the *log_parsers* directory).
  - *other information about the execution*.

Example of a valid output from an executable file:
```javascript
{ 
  "solutions": [
    { "solution_name": "Greedy", "solution_type": "vrp", "value": 1500, "routes": [{"path":[0,1,4,5,0], "t0":0, "duration": 1500] },
    { "solution_name": "Exact", "solution_type": "vrp", "value": 1200, "routes": [{"path":[0,7,4,3,0], "t0":0, "duration": 1200] }
  ],
  "execution_logs": [
    {"log_name": "Greedy", "log_type": "bc", "time": 12.5, "nodes": 12},
    {"log_name": "Exact", "log_type": "bc", "time": 1357.23, "nodes": 5026}
  ]
}
```

## Table View
The main view of Kaleidoscope is a table with the selected experiments' instances as rows, and what we call experiment **attributes** as columns. An **attribute** is some piece of information from an experiment output that can be showed as a column.
> Example: the execution time of an experiment could be an **attribute** of some execution log.
> Example: the number of vertices in the path of a solution could be an **attriute** of some solution.

The *ExecutionLogParser* and *SolutionParser* are interfaces that have the following responsibilities:
- Identify the available attributes in a *(execution_log|solution)* JSON object.
- Parse the object to retrieve the specific values of the attributes selected by the user.

## Details View
The Details View is a dialog that appears if a user clicks on the + icon on the table. It contains more information about the selected experiment execution. The Details View contains a main *\<div\>* where the different *ExecutionLogParser* and *SolutionParser* will add the necessary information.
  
The *ExecutionLogParser* and *SolutionParser* are interfaces that have the following responsibilities:
- Write into a *<div>* the details of the *(execution_log|solution)* (including graphics and other visualization information).
