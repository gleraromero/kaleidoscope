class LPParser extends Parser
{
  get_attributes(obj)
  {
    return [
      new Attribute("Time", this.f2(obj.time)),
      new Attribute("Status", obj.status),
      new Attribute("#Iterations", obj.simplex_iterations),
      new Attribute("Incumbent", this.f2(obj.incumbent_value)),
      new Attribute("#Variables", obj.variable_count),
      new Attribute("#Constraints", obj.constraint_count),
    ];
  }

  detail_view_rows(obj, view_section) {
    if (obj.screen_output && obj.screen_output != "") {
      view_section.add_label_row("Screen output", this.textarea(obj.screen_output));
    }

    view_section.add_table_row(
      ["Time", "Status", "#Iterations", "Incumbent value","#Variables", "#Constraints"],
      [obj.time, obj.status, obj.simplex_iterations, obj.incumbent_value, obj.variable_count, obj.constraint_count]
    );
    view_section.add_label_row("Duals", this.textinput(this.jsonify(obj.duals)));
  }
}
kd.add_parser("lp", new LPParser());
