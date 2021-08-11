class CGParser extends Parser
{
  get_attributes(obj)
  {
    return [
      new Attribute("Time", this.f2(obj.time)),
      new Attribute("Status", obj.status),
      new Attribute("Incumbent", this.f2(obj.incumbent_value)),
      new Attribute("#Columns added", obj.columns_added),
      new Attribute("Pricing time", this.f2(obj.pricing_time)),
      new Attribute("LP time", this.f2(obj.lp_time)),
    ];
  }

  detail_view_rows(obj, view_section) {
    // Screen output.
    if (obj.screen_output && obj.screen_output != "") {
      view_section.add_label_row("Screen output", this.textarea(obj.screen_output));
    }

    view_section.add_table_row(
      ["Time", "Status", "Incumbent value", "#Columns added", "Pricing time", "LP time"],
      [obj.time, obj.status, obj.incumbent_value, obj.columns_added, obj.pricing_time, obj.lp_time],
    );
    view_section.add_label_row("Incumbent", this.textinput(this.jsonify(obj.incumbent)));
    view_section.add_label_row("Iterations", " ");
    view_section.add_slider_row(
      obj.iterations,
      (index, iteration, slider_section) => {
        slider_section.add_html_row(`<span class="slider_header">#${index+1}</span>`);
        kd.get_parser(iteration.kd_type)?.detail_view_rows(iteration, slider_section);
      },
    );
  }
}
kd.add_parser("cg", new CGParser());
