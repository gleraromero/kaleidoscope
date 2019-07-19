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
    this.add_path_row(rows, "Screen output", obj, ["screen_output"], [this.textarea]);
    this.add_path_row(rows, "Time", obj, ["time"], [this.f2]);
    this.add_path_row(rows, "Status", obj, ["status"]);
    this.add_path_row(rows, "#Iterations", obj, ["simplex_iterations"]);
    this.add_path_row(rows, "Incumbent Value", obj, ["incumbent_value"], [this.f2]);
    this.add_path_row(rows, "Incumbent", obj, ["incumbent"], [this.jsonify, this.textinput]);
    this.add_path_row(rows, "#Variables", obj, ["variable_count"]);
    this.add_path_row(rows, "#Constraints", obj, ["constraint_count"]);
    this.add_path_row(rows, "Duals", obj, ["duals"], [this.jsonify, this.textinput]);
    return rows;
  }
}
kd.add_parser("lp", new LPParser());
