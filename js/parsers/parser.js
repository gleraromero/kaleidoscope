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

class ViewSection
{
  constructor() {
    this.rows = [];
  }

  render() {
    if (this.rows.length == 0) return undefined;
    const container = $("<div class='container' />");
    for (const row of this.rows) {
      const row_dom = $("<div class='row' />");
      row_dom.append(row);
      container.append(row_dom);
    }
    return container;
  }

  add_html_row(html)
  {
    if (!html) return;
    this.rows.push($(`<div class='col-md-12'>${html}</div>`)); 
  }

  add_flex_row(cells)
  {
    if (cells.length === 0) return;
    var flex_container = $("<div class='col-md-12 d-flex flex-wrap' />");
    for (var cell of cells) if (cell) flex_container.append(cell);
    this.rows.push(flex_container);
  }

  add_label_row(label, value)
  {
    if (!value) return;
    this.add_html_row(`<span class="detail_label">${label}</span>: <span style="padding-right:15px;">${value}</span>`);
  }

  /** The first row is assumed to be a header */
  add_table_row(...rows)
  {
    if (rows.length === 0) return;
    // Create table.
    var table = $("<table class='table table-sm' />");

    // Add header.
    var header_row = $("<tr />");
    table.append(header_row);
    for (var col of rows[0])
    {
      var header_col = $("<th />");
      header_col.append(col);
      header_row.append(header_col);
    }

    // Add rows.
    for (let i = 1; i < rows.length; ++i)
    {
      let row = rows[i];
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

    this.add_flex_row([table]);
  }

  add_slider_row(objects, render_function)
  {
    if (!objects || objects.length === 0) return;
    var slider = $(`<input class="form-control-range" type="range" min="0" max="${objects.length-1}" value="0" class="slider" />`);
    if (objects.length == 1) slider.hide();
    var container = $(`<div class="slider_container"></div>`);
    slider.on('input', function () {
        container.height(container.height());
        container.empty();
        var slider_section = new ViewSection();
        render_function(parseInt(this.value), objects[this.value], slider_section);
        container.append(slider_section.rows);
        container.append();
        container.height("auto");
    });
    slider.trigger('input');
    this.add_flex_row([slider, container]);
  }
}

// Abstract class, you need to implement get_attributes(...) and detail_view_rows(...).
class Parser
{
  // Returns a list of Attribute instances with the attributes of the
  // object 'obj'.
  get_attributes(obj)
  {
    throw "Unimplemented function Parser::get_attributes(obj)";
  }

  // Populates the view section with rows
  detail_view_rows(obj, view_section)
  {
    throw "Unimplemented Parser::detail_view_rows(obj, view_section).";
  }

  detail_view(obj)
  {
    var section = new ViewSection();
    this.detail_view_rows(obj, section);
    return section.render();
  }

  // Formatter for keeping only two decimals.
  // It returns the value with only two decimals.
  // Precondition: value is a float.
  // Example: f2(12.12345) == 12.12.
  f2(value) {
    if (!value) return value;
    return value.toFixed(2);
  }

  // Formatter for printing a JSON serialization of a value.
  jsonify(value) {
    if (!value) return value;
    return JSON.stringify(value);
  }

  // Formatter for putting the value inside a textarea.
  textarea(value) {
    if (!value) return value;
    return `<textarea class="screen_output">${value}</textarea>`;
  }

  // Formatter for putting the value inside a text input.
  textinput(value) {
    if (!value) return value;
    return `<input type="text" value='${value}' />`;
  }
}
