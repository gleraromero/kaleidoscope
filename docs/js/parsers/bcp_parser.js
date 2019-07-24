class BCPParser extends Parser
{
  get_attributes(obj)
  {
    var A = [];

    // Add BC attributes.
    var bc_parser = new BCParser();
    for (var attr of bc_parser.get_attributes(obj)) A.push(attr);

    A.push(...this.parse_attributes(obj, [
      {text:"#Root constraints", extract:this.path_extract(["root_constraint_count"])},
      {text:"#Root variables", extract:this.path_extract(["root_variable_count"])},
      {text:"#Final constraints", extract:this.path_extract(["final_constraint_count"])},
      {text:"#Final variables", extract:this.path_extract(["final_variable_count"])},
      {text:"LP time", extract:this.path_extract(["lp_time"]), formatters:[this.f2]},
      {text:"Pricing time", extract:this.path_extract(["pricing_time"]), formatters:[this.f2]},
      {text:"Branching time", extract:this.path_extract(["branching_time"]), formatters:[this.f2]}
    ]));
    return A;
  }

  detail_view_rows(obj) {
    var bc_parser = new BCParser();
    var rows = bc_parser.detail_view_rows(obj);
    this.add_path_row(rows, "#Root constraints", obj, ["root_constraint_count"]);
    this.add_path_row(rows, "#Root variables", obj, ["root_variable_count"]);
    this.add_path_row(rows, "#Final constraints", obj, ["final_constraint_count"]);
    this.add_path_row(rows, "#Final variables", obj, ["final_variable_count"]);
    this.add_path_row(rows, "LP time", obj, ["lp_time"], [this.f2]);
    this.add_path_row(rows, "Pricing time", obj, ["lp_time"], [this.f2]);
    this.add_path_row(rows, "Branching time", obj, ["lp_time"], [this.f2]);
    if (has_path(obj, ["root_log", "iterations"]))
    {
      this.add_flex_row(rows, [this.label_row("Root column generation iterations",  "")]);
      this.add_flex_row(rows, this.slider(obj.root_log.iterations, (index, iteration) => {
        var container = $("<div class='container' />");
        var iteration_name = iteration.iteration_name != undefined ? iteration.iteration_name : "";
        container.append($(`<div class='row'><div class='col-md-12'><span class="slider_header">#${index+1} ${iteration_name}</span></div></div>`));
        var iteration_parser = kd.get_parser(iteration.kd_type);
        if (iteration_parser != undefined) container.append(iteration_parser.detail_view(iteration));
        return container
      }));
    }
    return rows;
  }
}
kd.add_parser("bcp", new BCPParser());
