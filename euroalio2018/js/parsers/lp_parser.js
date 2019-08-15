class LPParser extends Parser
{
  get_attributes(obj)
  {
    var A = [];
    A.push(...this.parse_attributes(obj, [
      {text:"Time", extract:this.path_extract(["time"]), formatters:[this.f2]},
      {text:"Status", extract:this.path_extract(["status"])},
      {text:"#Iterations", extract:this.path_extract(["simplex_iterations"])},
      {text:"Incumbent", extract:this.path_extract(["incumbent_value"]), formatters:[this.f2]},
      {text:"#Variables", extract:this.path_extract(["variable_count"])},
      {text:"#Constraints", extract:this.path_extract(["constraint_count"])}
    ]));
    return A;
  }

  detail_view_rows(obj) {
    var rows = [];
    if (obj.screen_output && obj.screen_output != "")
      this.add_path_row(rows, "Screen output", obj, ["screen_output"], [this.textarea]);

    this.add_table_row(rows,
      ["Time", "Status", "#Iterations", "Incumbent value","#Variables", "#Constraints"], [
      [obj.time, obj.status, obj.simplex_iterations, obj.incumbent_value, obj.variable_count, obj.constraint_count]
    ]);
    this.add_path_row(rows, "Duals", obj, ["duals"], [this.jsonify, this.textinput]);
    return rows;
  }
}
kd.add_parser("lp", new LPParser());
