class VRPSolutionParser extends Parser
{
  get_attributes(obj)
  {
    var A = [];
    A.push(...this.parse_attributes(obj, [
      {text:"Value", extract:this.path_extract(["value"]), formatters:[this.f2]},
      {text:"#Routes", extract:this.path_extract(["routes", "length"])}
    ]));
    return A;
  }

  detail_view_rows(obj) {
    var rows = [];
    this.add_path_row(rows, "Value", obj, ["value"], [this.f2]);
    this.add_flex_row(rows, ["<span class='detail_label'>Routes</span>:"]);
    for (var route of obj.routes)
      this.add_flex_row(rows, [`${JSON.stringify(route.path)} - Departure: ${route.t0} - Duration: ${route.duration}`]);
    return rows;
  }
}
kd.add_parser("vrp_solution", new VRPSolutionParser());
