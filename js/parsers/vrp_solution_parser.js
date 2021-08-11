class VRPSolutionParser extends Parser
{
  get_attributes(obj)
  {
    return [
      new Attribute("Value", this.f2(obj.value)),
      new Attribute("#Routes", obj.routes?.length),
    ];
  }

  detail_view_rows(obj, view_section) {
    view_section.add_label_row("Value", this.f2(obj.value));
    view_section.add_label_row(`Routes (${obj.routes?.length})`, " ");
    const route_rows = [];
    for (const route of obj.routes) {
      route_rows.push([this.jsonify(route.path), this.f2(route.t0), this.f2(route.duration)]);
    }
    view_section.add_table_row(
      ["Path", "Departure", "Duration"],
      ...route_rows,
    );
  }
}
kd.add_parser("vrp_solution", new VRPSolutionParser());
