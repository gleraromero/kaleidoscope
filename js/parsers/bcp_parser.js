class BCPParser extends Parser
{
  get_attributes(obj)
  {
    const attributes = [];

    // Add BC attributes.
    attributes.push(...new BCParser().get_attributes(obj));

    attributes.push(...[
      new Attribute("Root time", this.f2(obj.root_time)),
      new Attribute("#Root constraints", obj.root_constraint_count),
      new Attribute("#Root variables", obj.root_variable_count),
      new Attribute("#Final constraints", obj.final_constraint_count),
      new Attribute("#Final variables", obj.final_variable_count),
      new Attribute("LP time", this.f2(obj.lp_time)),
      new Attribute("Pricing time", this.f2(obj.pricing_time)),
      new Attribute("Branching time", this.f2(obj.branching_time)),
    ]);
    return attributes;
  }

  detail_view_rows(obj, view_section) {
    const bc_parser = new BCParser();
    bc_parser.detail_view_rows(obj, view_section);
    view_section.add_table_row(
      ["#Root constraints", "#Root variables", "#Final constraints", "#Final variables"],
      [obj.root_constraint_count, obj.root_variable_count, obj.final_constraint_count, obj.final_variable_count]
    );

    view_section.add_table_row(
      ["Root time", "LP time", "Pricing time", "Branching time"],
      [obj.root_time, obj.lp_time, obj.pricing_time, obj.branching_time]
    );
    
    if (obj.root_log?.iterations)
    {
      view_section.add_label_row("Root column generation iterations",  " ");
      view_section.add_slider_row(
        obj.root_log.iterations,
        (index, iteration, slider_section) => {
          const iteration_name = iteration.iteration_name || "";
          slider_section.add_html_row(`<span class="slider_header">#${index+1} ${iteration_name}</span>`);
          slider_section.add_label_row("Pricing problem", this.textinput(this.jsonify(iteration.pricing_problem)));
          kd.get_parser(iteration.kd_type)?.detail_view_rows(iteration, slider_section);
        },
      );
    }
  }
}
kd.add_parser("bcp", new BCPParser());
