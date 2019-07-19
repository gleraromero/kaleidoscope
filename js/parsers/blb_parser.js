class BLBParser extends Parser
{
  get_attributes(obj)
  {
    var path_sum_extract = (field) => {
      return (obj) => {
        if (!has_path(obj, ["forward", field]) || !has_path(obj, ["backward", field])) return undefined;
        return get_path(obj, ["forward", field]) + get_path(obj, ["backward", field]);
      };
    };

    var A = [];
    A.push(...this.parse_attributes(obj, [
      {text:"Time", extract:this.path_extract(["time"]), formatters:[this.f2]},
      {text:"Status", extract:this.path_extract(["status"])},
      {text:"Merge time", extract:this.path_extract(["merge_time"]), formatters:[this.f2]},
      {text:"#Enumerated", extract:path_sum_extract("enumerated_count")},
      {text:"#Extended", extract:path_sum_extract("extended_count")},
      {text:"#Dominated", extract:path_sum_extract("dominated_count")},
      {text:"#Processed", extract:path_sum_extract("processed_count")},
      {text:"Queuing time", extract:path_sum_extract("queuing_time"), formatters:[this.f2]},
      {text:"Enumeration time", extract:path_sum_extract("enumeration_time"), formatters:[this.f2]},
      {text:"Extension time", extract:path_sum_extract("extension_time"), formatters:[this.f2]},
      {text:"Domination time", extract:path_sum_extract("domination_time"), formatters:[this.f2]},
      {text:"Process time", extract:path_sum_extract("process_time"), formatters:[this.f2]},
      {text:"Positive domination time", extract:path_sum_extract("positive_domination_time"), formatters:[this.f2]},
      {text:"Negative domination time", extract:path_sum_extract("negative_domination_time"), formatters:[this.f2]},
    ]));

    var mlb_parser = new MLBParser();
    // Add forward attributes.
    if (has_path(obj, ["forward"]))
    {
      for (var attr of mlb_parser.get_attributes(obj.forward))
      {
        attr.text = `(F) ${attr.text}`;
        A.push(attr);
      }
    }

    // Add backward attributes.
    if (has_path(obj, ["backward"]))
    {
      for (var attr of mlb_parser.get_attributes(obj.backward))
      {
        attr.text = `(B) ${attr.text}`;
        A.push(attr);
      }
    }

    return A;
  }

  detail_view_rows(obj) {
    var rows = [];
    // Screen output.
    this.add_path_row(rows, "Screen output", obj, ["screen_output"], [this.textarea]);
    this.add_path_row(rows, "Time", obj, ["time"], [this.f2]);
    this.add_path_row(rows, "Merge time", obj, ["merge_time"], [this.f2]);
    this.add_path_row(rows, "Status", obj, ["status"]);

    var add_bar = (data, title, path) => {
      if (has_path(obj, path)) {
        data.x.push(title);
        data.y.push(get_path(obj, path));
      }
    };
    // #Labels plot.
    var plot_row = [];
    var data_forward = {x:[], y:[], name:"FW"};
    var data_backward = {x:[], y:[], name:"BW"};
    add_bar(data_forward, "Enumerated", ["forward", "enumerated_count"]);
    add_bar(data_forward, "Extended", ["forward", "extended_count"]);
    add_bar(data_forward, "Dominated", ["forward", "dominated_count"]);
    add_bar(data_forward, "Processed", ["forward", "processed_count"]);
    add_bar(data_backward, "Enumerated", ["backward", "enumerated_count"]);
    add_bar(data_backward, "Extended", ["backward", "extended_count"]);
    add_bar(data_backward, "Dominated", ["backward", "dominated_count"]);
    add_bar(data_backward, "Processed", ["backward", "processed_count"]);
    var labels_plot = bar_plot("#Labels by stage", [data_forward, data_backward], {height:300, width:350});
    if (labels_plot != undefined) plot_row.push(labels_plot);

    // Time plot.
    data_forward = {x:[], y:[], name: "FW"};
    data_backward = {x:[], y:[], name:"BW"};
    var data_merge = {x:[], y:[], name:"MG"};
    add_bar(data_forward, "Queuing", ["forward", "queuing_time"]);
    add_bar(data_forward, "Enumeration", ["forward", "enumeration_time"]);
    add_bar(data_forward, "Extension", ["forward", "extension_time"]);
    add_bar(data_forward, "Domination", ["forward", "domination_time"]);
    add_bar(data_forward, "Processing", ["forward", "process_time"]);
    add_bar(data_backward, "Queuing", ["backward", "queuing_time"]);
    add_bar(data_backward, "Enumeration", ["backward", "enumeration_time"]);
    add_bar(data_backward, "Extension", ["backward", "extension_time"]);
    add_bar(data_backward, "Domination", ["backward", "domination_time"]);
    add_bar(data_backward, "Processing", ["backward", "process_time"]);
    add_bar(data_merge, "Merge", ["merge_time"]);
    var time_plot = bar_plot("Time by stage", [data_forward, data_backward, data_merge], {height:300, width:350});
    if (time_plot != undefined) plot_row.push(time_plot);

    // Count by length plot.
    data_forward = {x:[], y:[], name: "FW"};
    data_backward = {x:[], y:[], name:"BW"};
    if (has_path(obj, ["forward", "count_by_length"]))
      for (var i = 0; i < obj.forward.count_by_length.length; ++i)
        add_bar(data_forward, i, ["forward", "count_by_length", i]);
    if (has_path(obj, ["backward", "count_by_length"]))
      for (var i = 0; i < obj.forward.count_by_length.length; ++i)
        add_bar(data_backward, i, ["backward", "count_by_length", i]);
    var length_plot = bar_plot("#Labels by length", [data_forward, data_backward], {height:300, width:350});
    if (length_plot != undefined) plot_row.push(length_plot);

    // Positive-Negative domination plot.
    data_forward = {x:[], y:[], name: "FW"};
    data_backward = {x:[], y:[], name:"BW"};
    add_bar(data_forward, "Positive", ["forward", "positive_domination_time"]);
    add_bar(data_forward, "Negative", ["forward", "negative_domination_time"]);
    add_bar(data_backward, "Positive", ["backward", "positive_domination_time"]);
    add_bar(data_backward, "Negative", ["backward", "negative_domination_time"]);
    var domination_plot = bar_plot("Positive/Negative domination time", [data_forward, data_backward], {height:300, width:350});
    if (domination_plot != undefined) plot_row.push(domination_plot);

    this.add_flex_row(rows, plot_row);
    return rows;
  }
}
kd.add_parser("blb", new BLBParser());
