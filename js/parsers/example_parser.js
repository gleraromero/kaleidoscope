/** 
 * Copy this example class and extend it to create your own custom Parser. 
 *  get_attributes(obj): returns a list of attributes that are available for a given object so that they can be shown 
 *    in the TableView.
 *  detail_view_rows(obj, view_section): you must add all the rows to the view_section object that should get shown
 *    in the detail modal for the specified object.
 */
class ExampleParser extends Parser
{
  get_attributes(obj)
  {
    return [
      new Attribute("Time", obj.total_time, "Some tooltip", "Header tooltip"),
      new Attribute("Formatted time", this.f2(obj.total_time), "Some tooltip", "Header tooltip"),
    ];
  }

  detail_view_rows(obj, view_section) {
    // Types of rows for ViewSection
    view_section.add_html_row(this.textarea(this.jsonify(obj)));
    view_section.add_html_row("<b>some html</b>");
    view_section.add_flex_row([
      "This is the first cell", 
      "This is the second cell", 
      "This is the third cell"
    ]);
    view_section.add_label_row("Some label", "Some value");
    view_section.add_table_row(
      ["Header 1", "Header 2", "Header 3"],
      ["Value 1", "Value 2", "Value 3"],
      ["Value 4", "Value 5", "Value 6"],
    );
    view_section.add_slider_row(
      [{name: "item1", value: 25}, {name: "item2", value: 50}],
      (index, element, slider_section) => {
        slider_section.add_label_row(`${index} - Name`, element.name);
        slider_section.add_label_row(`${index} - Value`, element.value);
      }
    );

    // Plot rows
    let series1 = {x: [1, 2, 3, 4, 5], y: [10, 20, 30, 40, 50], name: "S1"};
    let series2 = {x: [1, 2, 3, 4, 5], y: [50, 40, 30, 20, 10], name: "S2"};
    view_section.add_flex_row([
      bar_plot("Bar title", [series1, series2], {width: 350, height: 300}),
      bar_plot("Another title", [series2], {width: 350, height: 300}),
    ]);

    // Types of value formatters
    view_section.add_label_row("f2(12.256)", this.f2(12.256));
    view_section.add_label_row("jsonify({a:'hello', b:'bye'})", this.jsonify({a:'hello', b:'bye'}));
    view_section.add_label_row("textarea('some text')", this.textarea("some text"));
    view_section.add_label_row("textinput('some text')", this.textinput("some text"));
  }
}

kd.add_parser("example", new ExampleParser());
