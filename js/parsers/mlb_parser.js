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
    var A = [];
    A.push(...this.parse_attributes(obj, [
      {text:"Time", extract:this.path_extract(["time"]), formatters:[this.f2]},
      {text:"Status", extract:this.path_extract(["status"])},
      {text:"#Enumerated", extract:this.path_extract(["enumerated_count"])},
      {text:"#Extended", extract:this.path_extract(["extended_count"])},
      {text:"#Dominated", extract:this.path_extract(["dominated_count"])},
      {text:"#Corrected", extract:this.path_extract(["corrected_count"])},
      {text:"#Processed", extract:this.path_extract(["processed_count"])},
      {text:"Queuing time", extract:this.path_extract(["queuing_time"]), formatters:[this.f2]},
      {text:"Enumeration time", extract:this.path_extract(["enumeration_time"]), formatters:[this.f2]},
      {text:"Extension time", extract:this.path_extract(["extension_time"]), formatters:[this.f2]},
      {text:"Domination time", extract:this.path_extract(["domination_time"]), formatters:[this.f2]},
      {text:"Correction time", extract:this.path_extract(["domination_time"]), formatters:[this.f2]},
      {text:"Process time", extract:this.path_extract(["process_time"]), formatters:[this.f2]},
      {text:"Positive domination time", extract:this.path_extract(["positive_domination_time"]), formatters:[this.f2]},
      {text:"Negative domination time", extract:this.path_extract(["negative_domination_time"]), formatters:[this.f2]},
      {text:"Average length", extract:(obj) => this.pondered_average(obj.count_by_length), formatters:[this.f2]}
    ]));
    return A;
  }

  detail_view_rows(obj) {
    var rows = [];
    // Screen output.
    if (obj.screen_output && obj.screen_output != "")
      this.add_path_row(rows, "Screen output", obj, ["screen_output"], [this.textarea]);

    this.add_table_row(rows,
      ["Time", "Status", "Average label length"], [
      [obj.time, obj.status, this.pondered_average(obj.count_by_length)]
    ]);
    
    var add_bar = (data, title, path) => {
      if (has_path(obj, path)) {
        data.x.push(title);
        data.y.push(get_path(obj, path));
      }
    };
    // #Labels plot.
    var plot_row = [];
    var data = {x:[], y:[]};
    add_bar(data, "Enumerated", ["enumerated_count"]);
    add_bar(data, "Extended", ["extended_count"]);
    add_bar(data, "Dominated", ["dominated_count"]);
    add_bar(data, "Corrected", ["corrected_count"]);
    add_bar(data, "Processed", ["processed_count"]);
    var labels_plot = bar_plot("#Labels by stage", [data], {height:300, width:350});
    if (labels_plot != undefined) plot_row.push(labels_plot);

    // Time plot.
    data = {x:[], y:[]};
    add_bar(data, "Queuing", ["queuing_time"]);
    add_bar(data, "Enumeration", ["enumeration_time"]);
    add_bar(data, "Extension", ["extension_time"]);
    add_bar(data, "Domination", ["domination_time"]);
    add_bar(data, "Correction", ["correction_time"]);
    add_bar(data, "Processing", ["process_time"]);
    var time_plot = bar_plot("Time by stage", [data], {height:300, width:350});
    if (time_plot != undefined) plot_row.push(time_plot);

    // Count by length plot.
    data = {x:[], y:[]};
    if (has_path(obj, ["count_by_length"]))
      for (var i = 0; i < obj.count_by_length.length; ++i)
        add_bar(data, i, ["count_by_length", i]);
    var length_plot = bar_plot("#Labels by length", [data], {height:300, width:350});
    if (length_plot != undefined) plot_row.push(length_plot);

    // Positive-Negative domination plot.
    data = {x:[], y:[]};
    add_bar(data, "Positive", ["positive_domination_time"]);
    add_bar(data, "Negative", ["negative_domination_time"]);
    var domination_plot = bar_plot("Positive/Negative domination time", [data], {height:300, width:350});
    if (domination_plot != undefined) plot_row.push(domination_plot);

    this.add_flex_row(rows, plot_row);
    return rows;
  }
}
kd.add_parser("mlb", new MLBParser());
