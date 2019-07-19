class CGParser extends Parser
{
  get_attributes(obj)
  {
    var A = [];
    A.push(...this.parse_attributes(obj, [
      {text:"Time", extract:this.path_extract(["time"]), formatters:[this.f2]},
      {text:"Status", extract:this.path_extract(["status"])},
      {text:"Incumbent", extract:this.path_extract(["incumbent_value"]), formatters:[this.f2]},
      {text:"#Columns added", extract:this.path_extract(["columns_added"])},
      {text:"Pricing time", extract:this.path_extract(["pricing_time"]), formatters:[this.f2]},
      {text:"LP time", extract:this.path_extract(["lp_time"]), formatters:[this.f2]}
    ]));
    return A;
  }

  detail_view_rows(obj) {
    var rows = [];
    this.add_path_row(rows, "Screen output", obj, ["screen_output"], [this.textarea]);
    this.add_path_row(rows, "Time", obj, ["time"], [this.f2]);
    this.add_path_row(rows, "Status", obj, ["status"]);
    this.add_path_row(rows, "Incumbent Value", obj, ["incumbent_value"], [this.f2]);
    this.add_path_row(rows, "Incumbent", obj, ["incumbent"], [this.jsonify, this.textinput]);
    this.add_path_row(rows, "#Columns added", obj, ["columns_added"]);
    this.add_path_row(rows, "Pricing time", obj, ["pricing_time"], [this.f2]);
    this.add_path_row(rows, "LP time", obj, ["lp_time"], [this.f2]);
    this.add_flex_row(rows, [this.label_row("Iterations",  "")]);
    this.add_flex_row(rows, this.slider(obj.iterations, (index, iteration) => {
      var container = $("<div class='container' />");
      container.append($(`<div class='row'><div class='col-md-12'><span class="slider_header">#${index+1}</span></div></div>`));
      var iteration_parser = kd.get_parser(iteration.kd_type);
      if (iteration_parser != undefined) container.append(iteration_parser.detail_view(iteration));
      return container
    }));
    return rows;
  }
}
kd.add_parser("cg", new CGParser());
