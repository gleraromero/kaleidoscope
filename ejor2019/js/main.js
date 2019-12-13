var kd = new Kaleidoscope();
var table_view = undefined;

function show_detail_view(experiment_id, instance_id) {
  var output = kd.get_output(experiment_id, instance_id);
  var view = new DetailView(`<span title="${output.dataset_name}">${output.instance_name}</span> - ${output.experiment_name}`);
  view.add_execution_section(output.stderr, output.exit_code);
  if (has_path(output, ["stdout"]) && output.stdout.constructor == {}.constructor)
  {
    Object.keys(output.stdout).forEach((key) => {
      var value = output.stdout[key];
      for (var parser of kd.parsers) {
          if (value["kd_type"] == undefined || value["kd_type"] != parser.type) continue;
          var section_name = value["kd_name"] == undefined ? key : value["kd_name"];
          var parser_view = parser.parser.detail_view(value);
          if (parser_view != undefined)
            view.add_section(section_name, parser_view);
      }
    });
  }
  view.show();
}

function experiment_file_added(content) {
  // Parse experiment file as JSON.
  json_content = JSON.parse(content);

  var experiment_ids = kd.add_experiment_file(json_content);
  for (var id of experiment_ids)
    table_view.add_experiment(kd.get_experiment(id));
}

$(document).ready(function() {
  // Set file input callback.
  add_file_loaded_callback("experiment_file_input", experiment_file_added,
    () => { $("#loading_experiment_file").css("visibility", "visible"); },
    () => { $("#loading_experiment_file").css("visibility", "hidden"); }
  );
  table_view = new TableView($("#table_view"));
});
