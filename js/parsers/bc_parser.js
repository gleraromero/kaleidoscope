class BCParser extends Parser
{
  gap(lb, ub)
  {
    if (lb == undefined || ub == undefined) return undefined;
    return 100.0*(Math.abs(lb-ub)/Math.abs(lb+10e-6));
  }

  get_attributes(obj)
  {
    var A = [];
    A.push(...this.parse_attributes(obj, [
      {text:"Time", extract:this.path_extract(["time"]), formatters:[this.f2]},
      {text:"Status", extract:this.path_extract(["status"])},
      {text:"#Constraints", extract:this.path_extract(["constraint_count"])},
      {text:"#Variables", extract:this.path_extract(["variable_count"])},
      {text:"#Nodes open", extract:this.path_extract(["nodes_open"])},
      {text:"#Nodes closed", extract:this.path_extract(["nodes_closed"])},
      {text:"Root LP", extract:this.path_extract(["root_lp_value"]), formatters:[this.f2]},
      {text:"%Root Gap", extract:(obj) => this.gap(obj.root_lp_value, obj.best_int_value), formatters:[this.f2], header_tooltip:"100.0*|LB-UB|/|LB|"},
      {text:"Root Int", extract:this.path_extract(["root_int_value"]), formatters:[this.f2]},
      {text:"Best Bound", extract:this.path_extract(["best_bound"]), formatters:[this.f2]},
      {text:"%Final Gap", extract:(obj) => this.gap(obj.best_bound, obj.best_int_value), formatters:[this.f2], header_tooltip:"100.0*|LB-UB|/|LB|"},
      {text:"Best Int", extract:this.path_extract(["best_int_value"]), formatters:[this.f2]},
      {text:"#Cuts", extract:this.path_extract(["cut_count"])},
      {text:"Cut time", extract:this.path_extract(["cut_time"]), formatters:[this.f2]}
    ]));
    if (has_path(obj, ["cut_families"]))
    {
      for (var family of obj.cut_families)
      {
        if (!has_path(family, ["name"])) continue;
        A.push(...this.parse_attributes(family, [
          {text:`${family.name} (count)`, extract:this.path_extract(["cut_count"])},
          {text:`${family.name} (iter.)`, extract:this.path_extract(["cut_iterations"])},
          {text:`${family.name} (time)`, extract:this.path_extract(["cut_time"]), formatters:[this.f2]}
        ]));
      }
    }
    return A;
  }

  detail_view_rows(obj) {
    var rows = [];
    this.add_path_row(rows, "Screen output", obj, ["screen_output"], [this.textarea]);
    this.add_path_row(rows, "Time", obj, ["time"], [this.f2]);
    this.add_path_row(rows, "Status", obj, ["status"]);
    this.add_path_row(rows, "#Constraints", obj, ["constraint_count"]);
    this.add_path_row(rows, "#Variables", obj, ["variable_count"]);
    this.add_path_row(rows, "#Nodes open", obj, ["nodes_open"]);
    this.add_path_row(rows, "#Nodes closed", obj, ["nodes_closed"]);
    this.add_path_row(rows, "Root LP", obj, ["root_lp_value"], [this.f2]);
    if (has_path(obj, ["root_lp_value"]) && has_path(obj, ["best_int_value"]))
      this.add_flex_row(rows, [this.label_row("%Root gap", this.gap(obj.root_lp_value, obj.best_int_value), [this.f2])]);
    this.add_path_row(rows, "Root Int", obj, ["root_int_value"], [this.f2]);
    this.add_path_row(rows, "Root Int solution", obj, ["root_int_solution"], [this.jsonify, this.textinput]);
    this.add_path_row(rows, "Best bound", obj, ["best_bound"], [this.f2]);
    if (has_path(obj, ["best_bound"]) && has_path(obj, ["best_int_value"]))
      this.add_flex_row(rows, [this.label_row("%Final gap", this.gap(obj.best_bound, obj.best_int_value), [this.f2])]);
    this.add_path_row(rows, "Best Int", obj, ["best_int_value"], [this.f2]);
    this.add_path_row(rows, "Best solution", obj, ["best_int_solution"], [this.jsonify, this.textinput]);
    this.add_path_row(rows, "Total #Cuts", obj, ["cut_count"]);
    this.add_path_row(rows, "Total Separation time", obj, ["cut_time"], [this.f2]);
    if (has_path(obj, ["cut_families"]))
    {
      for (var family of obj.cut_families)
      {
        if (!has_path(family, ["name"])) continue;
        this.add_flex_row(rows, [this.label_row(family.name, `#Cuts: ${family.cut_count} - #Iterations: ${family.cut_iterations} - Time: ${family.cut_time}`)]);
      }
    }
    return rows;
  }
}
kd.add_parser("bc", new BCParser());
