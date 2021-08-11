class MLBParser extends Parser
{
  // Returns \sum_{i=0}^{|A|} i*A[i].
  pondered_average(A) {
    if (A == undefined) return undefined;
    var tot = 0.0;
    var cnt = 0.0;
    for (var i = 0; i < A.length; ++i) {
      tot += A[i] * i;
      cnt += A[i];
    }
    return (tot / cnt);
  }

  get_attributes(obj)
  {
    return [
      new Attribute("Time", this.f2(obj.time)),
      new Attribute("Status", obj.status),
      new Attribute("#Enumerated", obj.enumerated_count),
      new Attribute("#Extended", obj.extended_count),
      new Attribute("#Dominated", obj.dominated_count),
      new Attribute("#Corrected", obj.corrected_count),
      new Attribute("#Processed", obj.processed_count),
      new Attribute("Queuing time", this.f2(obj.queuing_time)),
      new Attribute("Enumeration time", this.f2(obj.enumeration_time)),
      new Attribute("Extension time", this.f2(obj.extension_time)),
      new Attribute("Domination time", this.f2(obj.domination_time)),
      new Attribute("Correction time", this.f2(obj.correction_time)),
      new Attribute("Process time", this.f2(obj.process_time)),
      new Attribute("Bounding time", this.f2(obj.bounding_time)),
      new Attribute("Positive domination time", this.f2(obj.positive_domination_time)),
      new Attribute("Negative domination time", this.f2(obj.negative_domination_time)),
      new Attribute("Average length", this.f2(this.pondered_average(obj.count_by_length))),
    ];
  }

  detail_view_rows(obj, view_section) {
    if (obj.screen_output && obj.screen_output != "") {
      view_section.add_label_row("Screen output", this.textarea(obj.screen_output));
    }

    view_section.add_table_row(
      ["Time", "Status", "Average label length"],
      [obj.time, obj.status, this.pondered_average(obj.count_by_length)],
    );
    
    const add_bar = (data, title, value) => {
      if (value && value !== 0) {
        data.x.push(title);
        data.y.push(value);
      }
    };
    // #Labels plot.
    let data = {x:[], y:[]};
    add_bar(data, "Enumerated", obj.enumerated_count);
    add_bar(data, "Extended", obj.extended_count);
    add_bar(data, "Dominated", obj.dominated_count);
    add_bar(data, "Bounded", obj.bounded_count);
    add_bar(data, "Corrected", obj.corrected_count);
    add_bar(data, "Processed", obj.processed_count);
    const labels_plot = bar_plot("#Labels by stage", [data], {height:300, width:300});

    // Time plot.
    data = {x:[], y:[]};
    add_bar(data, "Queuing", obj.queuing_time);
    add_bar(data, "Enumeration", obj.enumeration_time);
    add_bar(data, "Extension", obj.extension_time);
    add_bar(data, "Domination", obj.domination_time);
    add_bar(data, "Bounding", obj.bounding_time);
    add_bar(data, "Correction", obj.correction_time);
    add_bar(data, "Processing", obj.process_time);
    const time_plot = bar_plot("Time by stage", [data], {height:300, width:300});

    // Count by length plot.
    data = {x:[], y:[]};
    if (obj.count_by_length) {
      for (let i = 0; i < obj.count_by_length.length; ++i) {
        add_bar(data, i, obj.count_by_length[i]);
      }
    }
    const length_plot = bar_plot("#Labels by length", [data], {height:300, width:300});

    // Positive-Negative domination plot.
    data = {x:[], y:[]};
    add_bar(data, "Positive", obj.positive_domination_time);
    add_bar(data, "Negative", obj.negative_domination_time);
    const domination_plot = bar_plot("Positive/Negative domination time", [data], {height:300, width:300});

    view_section.add_flex_row([labels_plot, time_plot, length_plot, domination_plot]);
  }
}
kd.add_parser("mlb", new MLBParser());
