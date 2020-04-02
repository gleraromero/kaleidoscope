function bar_plot(title, data_array, plot_layout={}) {
  var all_empty_datasets = true;
  for (var data of data_array) if (data.x.length > 0) all_empty_datasets = false;
  if (all_empty_datasets) return undefined;
  plot_layout.title = title;
  plot_layout.showlegend = data_array.length > 1;
  var plot_config = {displayModeBar:false, displaylogo:false, showTips:true};
  for (var data of data_array) {
    data.hoverinfo = "label+value";
    data.type = "bar";
  }
  var container_dom = document.createElement("div");
  Plotly.purge(container_dom);
  Plotly.plot(container_dom, data_array, plot_layout, plot_config);
  return $(container_dom);
}
