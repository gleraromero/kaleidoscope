class BCParser extends Parser
{
  gap(lb, ub)
  {
    if (lb == undefined || ub == undefined) return undefined;
    return 100.0*(Math.abs(lb-ub)/Math.abs(lb+10e-6));
  }

  get_attributes(obj)
  {
    let attributes = [
      new Attribute("Time", this.f2(obj.time)),
      new Attribute("Status", obj.status),
      new Attribute("#Constraints", obj.constraint_count),
      new Attribute("#Variables", obj.variable_count),
      new Attribute("#Nodes open", obj.nodes_open),
      new Attribute("#Nodes closed", obj.nodes_closed),
      new Attribute("Root LP", this.f2(obj.root_lp_value)),
      new Attribute("%Root Gap", this.f2(this.gap(obj.root_lp_value, obj.best_int_value)), "", "100.0*|LB-UB|/|LB|"),
      new Attribute("Root Int", this.f2(obj.root_int_value)),
      new Attribute("Best Bound", this.f2(obj.best_bound)),
      new Attribute("%Final Gap", this.f2(this.gap(obj.best_bound, obj.best_int_value)), "", "100.0*|LB-UB|/|LB|"),
      new Attribute("Best Int", this.f2(obj.best_int_value)),
      new Attribute("#Cuts", obj.cut_count),
      new Attribute("#Cut time", this.f2(obj.cut_time))
    ];
    if (obj.cut_families)
    {
      for (var family of obj.cut_families)
      {
        if (!family.name) continue;
        attributes.push(new Attribute(`${family.name} (count)`, family.cut_count));
        attributes.push(new Attribute(`${family.name} (iter.)`, family.cut_iterations));
        attributes.push(new Attribute(`${family.name} (time)`, this.f2(family.cut_time)));
      }
    }
    return attributes;
  }

  detail_view_rows(obj, view_section) {
    if (obj.screen_output && obj.screen_output != "") {
      view_section.add_label_row("Screen output", this.textarea(obj.screen_output));
    }

    view_section.add_table_row(
      ["Root LP", "%Root gap", "Root Int", "Best bound", "Best Int", "%Final gap"],
      [obj.time, obj.status, obj.constraint_count, obj.variable_count, obj.nodes_open, obj.nodes_closed],
    );
    view_section.add_table_row(
      ["Time", "Status", "#Constraints", "#Variables", "#Nodes open", "#Nodes closed"],
      [obj.root_lp_value, this.gap(obj.root_lp_value, obj.best_int_value), obj.root_int_value, obj.best_bound, obj.best_int_value, this.gap(obj.best_bound, obj.best_int_value)],
    );
    view_section.add_label_row("Root Int solution", this.textarea(this.jsonify(obj.root_int_solution)));
    view_section.add_label_row("Best Int solution", this.textarea(this.jsonify(obj.best_int_solution)));
    view_section.add_table_row(
      ["Total #Cuts", "Total separation time"],
      [obj.cut_count, obj.cut_time],
    );
    if (obj.cut_families)
    {
      const cut_rows = [];
      for (const family of obj.cut_families)
      {
        if (!family.name) continue;
        cut_rows.push([family.name, family.cut_count, family.cut_iterations, family.cut_time]);
      }
      if (cut_rows.length > 0) {
        view_section.add_table_row(
          ["Cut family", "#Cuts", "#Iterations", "Separation time"],
          ...cut_rows,
        );
      }
    }
  }
}
kd.add_parser("bc", new BCParser());
