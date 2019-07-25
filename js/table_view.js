class ExperimentRow
{
  constructor(experiment, attribute_descriptors)
  {
    this.experiment = experiment;
    this.html = $("<div class='attribute_row' />");
    this.title = $(`<span class='attribute_row_title' title='Experiment file: ${experiment.experiment_file.name}\nDate: ${experiment.experiment_file.date}\nTotal time: ${(experiment.time/3600.0).toFixed(2)}hs.'>${experiment.name}</span>: `);
    this.html.append(this.title);

    // Get attribute descriptors.
    this.attribute_descriptors = attribute_descriptors;

    // Create combo and associate attributes.
    this.combo = $(`<select id="exp_row_${experiment.id}" class="select_attributes" data-placeholder="Select the attributes" multiple class="chosen-select" />`);
    for (var desc_id of this.attribute_descriptors.keys())
    {
      var desc = this.attribute_descriptors.get(desc_id);
      var opt_group = this.combo.find(`optgroup[label='${desc.key}']`);
      if (!opt_group.length)
      {
        opt_group = $(`<optgroup label="${desc.key}" />`);
        this.combo.append(opt_group);
      }
      opt_group.append($("<option>", {value:desc.id, text:desc.text}));
    }
    this.html.append(this.combo);
  }

  append_to(container)
  {
    this.combo.chosen({ width:"100%", include_group_label_in_selected:true});
    container.append(this.html);
  }

  remove()
  {
    this.combo.chosen("destroy");
    this.html.remove();
  }

  get_attribute_descriptor(id)
  {
    return this.attribute_descriptors.get(id);
  }

  selected_descriptors_ids()
  {
    return chosen_selected_values(this.combo.attr("id"));
  }
}

class AttributeDescriptor
{
  constructor(id, key, text, header_tooltip)
  {
    this.id = id;
    this.key = key;
    this.text = text;
    this.header_tooltip = header_tooltip;
  }
}

class AnnotatedAttribute
{
  constructor(attribute, experiment_id, instance_id, key, parser_type)
  {
    Object.assign(this, attribute);
    this.descriptor_id = to_id(experiment_id + "__" + key + "__" + this.text);
    this.id = this.descriptor_id + "__" + instance_id;
    this.key = key;
    this.experiment_id = experiment_id;
    this.instance_id = instance_id;
    this.parser_type = parser_type;
  }

  descriptor()
  {
    return new AttributeDescriptor(this.descriptor_id, this.key, this.text, this.header_tooltip);
  }
}

class TableView
{
  constructor(container)
  {
    this.container = $("<div class='container' />");
    container.append(this.container);

    // Create row with the experiment selection.
    var experiments_row = $("<div class='row' />");
    var experiments_cell = $("<div class='col-md-12 d-flex flex-wrap' />");
    var experiments_div = $("<div />");
    var experiments_title = $("<span class='select_experiments_title'>Experiments:</span>");
    var experiments_combo = $(`<select id="select_experiment_combo" class="select_experiments" data-placeholder="Select the experiments" multiple class="chosen-select" />`);
    experiments_row.append(experiments_div);
    experiments_div.append(experiments_cell);
    experiments_cell.append(experiments_title);
    experiments_cell.append(experiments_combo);
    this.container.append(experiments_row);
    this.container.append($("<div class='row'><div class='col-md-12'><hr /></div></div>"));
    this.experiments_combo = experiments_combo;
    this.experiments_combo.chosen({width:"100%", include_group_label_in_selected:true});
    this.experiments_combo.on("change", this.update_experiments.bind(this));

    // Create row where attribute combos are placed.
    var attribute_row = $("<div class='row' />");
    var attribute_cell = $("<div class='col-md-12' />");
    attribute_row.append(attribute_cell);
    this.container.append(attribute_row);
    this.attribute_cell = attribute_cell;

    this.container.append($("<div class='row'><div class='col-md-12'><hr /></div></div>"));

    // Create row that will contain the table
    var table_row = $("<div class='row' />");
    var table_cell = $("<div class='col-md-12' />");
    table_row.append(table_cell);
    this.container.append(table_row);
    this.table_cell = table_cell;

    this.reload_table();

    this.experiment_rows = new Map();
    this.attributes = new Map(); // attributes[attr_id] = attribute with id attr_id.
    this.attribute_descriptors = new Map(); // attribute_descriptors[exp_id] = attribute descriptors of experiment with id exp_id.
  }

  parse_experiment_attributes(experiment)
  {
    this.attribute_descriptors.set(experiment.id, new Map());

    // Parse the attributes of the experiment.
    for (var parser of kd.parsers)
    {
      for (var output of experiment.outputs)
      {
        // Check that stdout exists and is a JSON object.
        if (output.stdout == undefined || output.stdout.constructor != {}.constructor) continue;
        var instance = new Instance(output.dataset_name, output.instance_name);
        for (var key of Object.keys(output.stdout))
        {
          // Check that parser type matches.
          var stdout = output.stdout[key];
          if (stdout.kd_type == undefined || stdout.kd_type != parser.type) continue;
          for (var attr of parser.parser.get_attributes(output.stdout[key]))
          {
            if (attr == undefined) continue;
            var annotated_attr = new AnnotatedAttribute(attr, experiment.id, instance.id, key, parser.type);
            this.attributes.set(annotated_attr.id, annotated_attr);
            this.attribute_descriptors.get(experiment.id).set(annotated_attr.descriptor().id, annotated_attr.descriptor());
          }
        }
      }
    }
  }

  add_experiment(experiment)
  {
    this.parse_experiment_attributes(experiment);

    // If option group for experiment file does not exists, create it.
    var opt_group = this.experiments_combo.find(`optgroup[efid=${experiment.experiment_file.id}]`);
    if (!opt_group.length)
    {
      opt_group = $(`<optgroup efid="${experiment.experiment_file.id}" label="${experiment.experiment_file.name} - ${experiment.experiment_file.date}" />`);
      this.experiments_combo.append(opt_group);
    }
    opt_group.append($("<option>", { value: experiment.id, text: experiment.name }));
    this.experiments_combo.trigger("chosen:updated");
    this.experiment_rows.set(experiment.id, new ExperimentRow(experiment, this.attribute_descriptors.get(experiment.id)));
  }

  update_experiments(e, actions)
  {
    if (actions.selected)
      for (var opt_id of actions.selected)
        this.experiment_rows.get(parseInt(opt_id)).append_to(this.attribute_cell);

    if (actions.deselected)
      for (var opt_id of actions.deselected)
        this.experiment_rows.get(parseInt(opt_id)).remove();
  }

  get_attribute(instance_id, desc_id)
  {
    if (!this.attributes.has(desc_id + "__" + instance_id)) return undefined;
    return this.attributes.get(desc_id + "__" + instance_id);
  }

  reload_table()
  {
    // Get selected experiments.
    var experiment_ids = chosen_selected_values(this.experiments_combo.attr("id"));
    for (var i = 0; i < experiment_ids.length; ++i) experiment_ids[i] = parseInt(experiment_ids[i]);

    var experiments = [];
    for (var id of experiment_ids) experiments.push(kd.get_experiment(id));

    // Get all selected attribute descriptors.
    var descriptor_ids = new Map();
    for (var id of experiment_ids)
      descriptor_ids.set(id, this.experiment_rows.get(id).selected_descriptors_ids())
    this.table_cell.empty();
    var grid = new Grid(this.table_cell);

    // Add columns.
    grid.addColumnGroup({id:"instance_group", text:"", columns:[{id:"instance", text: "Instance"}]});
    for (var experiment of experiments)
    {
      var experiment_row = this.experiment_rows.get(experiment.id);
      grid.addColumnGroup({id:experiment.id, text:experiment.name});
      grid.addColumn({column_group_id:experiment.id, id:to_id(experiment.id.toString() + "__detailview"), text: "", "className":"ignore_csv"});
      for (var desc_id of descriptor_ids.get(experiment.id))
      {
        var desc = experiment_row.get_attribute_descriptor(desc_id);
        grid.addColumn({column_group_id:experiment.id, id:desc.id, text: `<span title="(${desc.key}) ${desc.header_tooltip}">${desc.text}</span>`});
      }
    }

    // Add rows.
    for (var instance of kd.get_instances_of_experiments(experiment_ids))
    {
      var row = {instance_group:{instance:`<span title="${instance.dataset_name}">${instance.instance_name}</span>`}};
      for (var experiment of experiments)
      {
        row[experiment.id] = {};
        var detailview_id = to_id(experiment.id.toString() + "__detailview");
        row[experiment.id][detailview_id] = "";
        var exit_code = undefined;
        if (experiment.has_instance(instance.id))
        {
          row[experiment.id][detailview_id] = `<a href="javascript:show_detail_view(${experiment.id}, '${instance.id}');">+</a>`
          exit_code = experiment.get_output(instance.id).exit_code;
        }
        for (var desc_id of descriptor_ids.get(experiment.id))
        {
          var row_value = "-";
          if (exit_code == 0)
          {
            var attr = this.get_attribute(instance.id, desc_id);
            if (attr != undefined) row_value = `<span title="${attr.tooltip}">${attr.value}</span>`;
          }
          else if (exit_code == 6) // Out of memory.
          {
            row_value = "<span title='Out of memory'>MLim</span>";
          }
          else if (exit_code != undefined)
          {
            row_value = `<span title='Exit code: ${exit_code}'>X</span>`;
          }
          row[experiment.id][desc_id] = row_value;
        }
      }
      grid.addRow(row);
    }

    grid.addButton("Refresh", () => { this.reload_table(); });
    grid.addCSVButton();
    grid.render();
  }
}
