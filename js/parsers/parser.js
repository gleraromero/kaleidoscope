class Attribute
{
  constructor(text, value, tooltip="", header_tooltip="")
  {
    this.text = text;
    this.value = value;
    this.tooltip = tooltip;
    this.header_tooltip = header_tooltip;
  }
}

class Parser
{
  // Initializes the parser with the 'type' and no attributes.
  constructor(type) {
    this.renderers = [];
  }

  // Returns a list of Attribute instances with the attributes of the
  // object 'obj'.
  get_attributes(obj)
  {
    throw "Unimplemented function Parser::get_attributes(obj)";
  }

  parse_attributes(obj, specs)
  {
    var attributes = [];
    for (var spec of specs)
    {
      var value = spec.extract(obj);
      if (value == undefined) continue;
      var formatters = spec.formatters == undefined ? [] : spec.formatters;
      var tooltip = spec.tooltip == undefined ? "" : spec.tooltip;
      var header_tooltip = spec.header_tooltip == undefined ? "" : spec.header_tooltip;
      value = this.apply_formatters(formatters, value);
      attributes.push(new Attribute(spec.text, value, tooltip, header_tooltip));
    }
    return attributes;
  }

  path_extract(path)
  {
    return (obj) => {
      if (!has_path(obj, path)) return undefined;
      return get_path(obj, path);
    };
  }

  detail_view(obj)
  {
    var rows = this.detail_view_rows(obj);
    if (rows.length == 0) return undefined;
    var container = $("<div class='container' />");
    for (var row of rows) {
      var row_dom = $("<div class='row' />");
      row_dom.append(row);
      container.append(row_dom);
    }
    return container;
  }

  detail_view_rows(obj)
  {
    throw "Unimplemented detail_view_rows(obj).";
    return [];
  }

  apply_formatters(formatters, value)
  {
    for (var f of formatters) value = f(value);
    return value;
  }

  label_row(label, value, formatters=[])
  {
    if (value == undefined) return undefined;
    return `<span class="detail_label">${label}</span>: <span style="padding-right:15px;">${this.apply_formatters(formatters, value)}</span>`;
  }

  path_row(obj, label, path, formatters=[])
  {
    if (!has_path(obj, path)) return undefined;
    return this.label_row(label, get_path(obj, path), formatters);
  }

  add_path_row(rows, label, obj, path, formatters=[])
  {
    if (!has_path(obj, path)) return;
    var formatted_value = get_path(obj, path);
    for (var f of formatters) formatted_value = f(formatted_value);
    rows.push(`<div class='col-md-12'>${this.label_row(label, get_path(obj, path), formatters)}</div>`);
  }

  add_flex_row(rows, cells)
  {
    if (cells.length == 0) return;
    var flex_container = $("<div class='col-md-12 d-flex flex-wrap' />");
    for (var cell of cells) if (cell != undefined) flex_container.append(cell);
    rows.push(flex_container);
    return flex_container;
  }

  add_table_row(rows, table_columns, table_rows)
  {
    // Create table.
    var table = $("<table class='table table-sm' />");

    // Add header.
    var header_row = $("<tr />");
    table.append(header_row);
    for (var col of table_columns)
    {
      var header_col = $("<th />");
      header_col.append(col);
      header_row.append(header_col);
    }

    // Add rows.
    for (var row of table_rows)
    {
      var table_row = $("<tr />");
      table.append(table_row);
      for (var cell of row)
      {
        var table_cell = $("<td />");
        if (is_float(cell)) cell = cell.toFixed(2);
        table_cell.append(cell == undefined ? "-" : cell);
        table_row.append(table_cell);
      }
    }

    this.add_flex_row(rows, [table]);
  }

  slider(objects, render_function)
  {
    if (objects == undefined || objects.length == 0) return "";
    var slider = $(`<input class="form-control-range" type="range" min="0" max="${objects.length-1}" value="0" class="slider" />`);
    if (objects.length == 1) slider.hide();
    var container = $(`<div class="slider_container"></div>`);
    slider.on('input', function () {
        container.height(container.height());
        container.empty();
        container.append(render_function(parseInt(this.value), objects[this.value]));
        container.height("auto");
    });
    slider.trigger('input');
    return [slider, container];
  }

  // Formatter for keeping only two decimals.
  // It returns the value with only two decimals.
  // Precondition: value is a float.
  // Example: f2(12.12345) == 12.12.
  f2(value) {
    return value.toFixed(2);
  }

  // Formatter for printing a JSON serialization of a value.
  jsonify(value) {
    return JSON.stringify(value);
  }

  // Formatter for putting the value inside a textarea.
  textarea(value) {
    return `<textarea class="screen_output">${value}</textarea>`;
  }

  // Formatter for putting the value inside a text input.
  textinput(value) {
    return `<input type="text" value='${value}' />`;
  }
}
