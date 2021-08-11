class BLBParser extends Parser
{
  get_attributes(obj)
  {
    const sum = (value1, value2) => {
      if (!value1 || !value2) return undefined;
      return value1 + value2; 
    };

    const attributes = [
      new Attribute("Time", this.f2(obj.time)),
      new Attribute("Status", obj.status),
      new Attribute("Merge time", this.f2(obj.merge_time)),
      new Attribute("#Enumerated", sum(obj.forward?.enumerated_count, obj.backward?.enumerated_count)),
      new Attribute("#Extended", sum(obj.forward?.extended_count, obj.backward?.extended_count)),
      new Attribute("#Dominated", sum(obj.forward?.dominated_count, obj.backward?.dominated_count)),
      new Attribute("#Corrected", sum(obj.forward?.corrected_count, obj.backward?.corrected_count)),
      new Attribute("#Processed", sum(obj.forward?.processed_count, obj.backward?.processed_count)),
      new Attribute("Queuing time", this.f2(sum(obj.forward?.queuing_time, obj.backward?.queuing_time))),
      new Attribute("Enumeration time", this.f2(sum(obj.forward?.enumeration_time, obj.backward?.enumeration_time))),
      new Attribute("Extension time", this.f2(sum(obj.forward?.extension_time, obj.backward?.extension_time))),
      new Attribute("Domination time", this.f2(sum(obj.forward?.domination_time, obj.backward?.domination_time))),
      new Attribute("Corrections time", this.f2(sum(obj.forward?.correction_time, obj.backward?.correction_time))),
      new Attribute("Process time", this.f2(sum(obj.forward?.process_time, obj.backward?.process_time))),
      new Attribute("Positive domination time", this.f2(sum(obj.forward?.positive_domination_time, obj.backward?.positive_domination_time))),
      new Attribute("Negative domination time", this.f2(sum(obj.forward?.negative_domination_time, obj.backward?.negative_domination_time))),
    ];

    var mlb_parser = new MLBParser();
    // Add forward attributes.
    if (obj.forward) {
      for (const attr of mlb_parser.get_attributes(obj.forward))
      {
        attr.text = `(F) ${attr.text}`;
        attributes.push(attr);
      }
    }

    // Add backward attributes.
    if (obj.backward) {
      for (const attr of mlb_parser.get_attributes(obj.backward))
      {
        attr.text = `(B) ${attr.text}`;
        attributes.push(attr);
      }
    }
    return attributes;
  }

  detail_view_rows(obj, view_section) {
    // Screen output.
    if (obj.screen_output && obj.screen_output != "") {
      view_section.add_label_row("Screen output", this.textarea(obj.screen_output));
    }

    view_section.add_table_row(
      ["Time", "Status"],
      [obj.time, obj.status],
    );

    const add_bar = (data, title, value) => {
      if (value && value !== 0) {
        data.x.push(title);
        data.y.push(value);
      }
    };

    // #Labels plot.
    var data_forward = {x:[], y:[], name:"FW"};
    var data_backward = {x:[], y:[], name:"BW"};
    add_bar(data_forward, "Enumerated", obj.forward?.enumerated_count);
    add_bar(data_forward, "Extended", obj.forward?.extended_count);
    add_bar(data_forward, "Dominated", obj.forward?.dominated_count);
    add_bar(data_forward, "Processed", obj.forward?.processed_count);
    add_bar(data_forward, "Corrected", obj.forward?.corrected_count);
    add_bar(data_backward, "Enumerated", obj.backward?.enumerated_count);
    add_bar(data_backward, "Extended", obj.backward?.extended_count);
    add_bar(data_backward, "Dominated", obj.backward?.dominated_count);
    add_bar(data_backward, "Processed", obj.backward?.processed_count);
    add_bar(data_backward, "Corrected", obj.backward?.corrected_count);
    const labels_plot = bar_plot("#Labels by stage", [data_forward, data_backward], {height:300, width:300});

    // Time plot.
    data_forward = {x:[], y:[], name: "FW"};
    data_backward = {x:[], y:[], name:"BW"};
    var data_merge = {x:[], y:[], name:"MG"};
    add_bar(data_forward, "Queuing", obj.forward?.queuing_time);
    add_bar(data_forward, "Enumeration", obj.forward?.enumeration_time);
    add_bar(data_forward, "Extension", obj.forward?.extension_time);
    add_bar(data_forward, "Domination", obj.forward?.domination_time);
    add_bar(data_forward, "Correction", obj.forward?.correction_time);
    add_bar(data_forward, "Processing", obj.forward?.process_time);
    add_bar(data_backward, "Queuing", obj.backward?.queuing_time);
    add_bar(data_backward, "Enumeration", obj.backward?.enumeration_time);
    add_bar(data_backward, "Extension", obj.backward?.extension_time);
    add_bar(data_backward, "Domination", obj.backward?.domination_time);
    add_bar(data_backward, "Correction", obj.backward?.correction_time);
    add_bar(data_backward, "Processing", obj.backward?.process_time);
    add_bar(data_merge, "Merge", obj.merge_time);
    const time_plot = bar_plot("Time by stage", [data_forward, data_backward, data_merge], {height:300, width:300});

    // Count by length plot.
    data_forward = {x:[], y:[], name: "FW"};
    data_backward = {x:[], y:[], name:"BW"};
    if (obj.forward?.count_by_length) {
      for (let i = 0; i < obj.forward.count_by_length.length; ++i) {
        add_bar(data_forward, i, obj.forward.count_by_length[i]);
      }
    }
    if (obj.backward?.count_by_length) {
      for (let i = 0; i < obj.backward.count_by_length.length; ++i) {
        add_bar(data_backward, i, obj.backward.count_by_length[i]);
      }
    }
    const length_plot = bar_plot("#Labels by length", [data_forward, data_backward], {height:300, width:300});

    // Positive-Negative domination plot.
    data_forward = {x:[], y:[], name: "FW"};
    data_backward = {x:[], y:[], name:"BW"};
    add_bar(data_forward, "Positive", obj.forward?.positive_domination_time);
    add_bar(data_forward, "Negative", obj.forward?.negative_domination_time);
    add_bar(data_backward, "Positive", obj.backward?.positive_domination_time);
    add_bar(data_backward, "Negative", obj.backward?.negative_domination_time);
    const domination_plot = bar_plot("Positive/Negative domination time", [data_forward, data_backward], {height:300, width:300});

    view_section.add_flex_row([labels_plot, time_plot, length_plot, domination_plot]);
  }
}
kd.add_parser("blb", new BLBParser());
