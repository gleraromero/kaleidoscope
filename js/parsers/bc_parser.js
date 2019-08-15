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
    if (obj.screen_output && obj.screen_output != "")
      this.add_path_row(rows, "Screen output", obj, ["screen_output"], [this.textarea]);
    this.add_table_row(rows,
      ["Time", "Status", "#Constraints", "#Variables", "#Nodes open", "#Nodes closed"], [
      [obj.time, obj.status, obj.constraint_count, obj.variable_count, obj.nodes_open, obj.nodes_closed]
    ]);
    this.add_table_row(rows,
      ["Root LP", "%Root gap", "Root Int", "Best bound", "Best Int", "%Final gap"], [
      [obj.root_lp_value, this.gap(obj.root_lp_value, obj.best_int_value), obj.root_int_value, obj.best_bound, obj.best_int_value, this.gap(obj.best_bound, obj.best_int_value)]
    ]);
    this.add_path_row(rows, "Root Int solution", obj, ["root_int_solution"], [this.jsonify, this.textinput]);
    this.add_path_row(rows, "Best Int solution", obj, ["best_int_solution"], [this.jsonify, this.textinput]);
    this.add_table_row(rows,
      ["Total #Cuts", "Total separation time"], [
      [obj.cut_count, obj.cut_time]
    ]);
    if (has_path(obj, ["cut_families"]))
    {
      var cut_rows = [];
      for (var family of obj.cut_families)
      {
        if (!has_path(family, ["name"])) continue;
        cut_rows.push([family.name, family.cut_count, family.cut_iterations, family.cut_time]);
      }
      if (cut_rows.length > 0) this.add_table_row(rows, ["Cut family", "#Cuts", "#Iterations", "Separation time"], cut_rows);
    }
    return rows;
  }
}
kd.add_parser("bc", new BCParser());
