// Attributes:
//  - id: unique ID to identify the experiment in Kaleidoscope.
//  - experiment_file: {name, date, time} of the experiment file.
//  - outputs: the output objects that came from the experiment.
//  - experiment_name: name of the experiment.
class Experiment
{
  constructor(id, experiment_file, experiment_name)
  {
    // Id to identify the experiment.
    this.id = id;

    this.name = experiment_name;

    // Keep experiment file information.
    this.experiment_file = {id: experiment_file.id, name: experiment_file.experiment_file, date: experiment_file.date, time: experiment_file.time};

    // Get all outputs related to the experiment.
    this.outputs = [];
    for (var output of experiment_file.outputs)
      if (output.experiment_name == experiment_name)
        this.outputs.push(output);

    // Get all instances in a map.
    this.instances = new Map();
    this.output_by_instance = new Map();
    for (var output of this.outputs)
    {
      var instance = new Instance(output.dataset_name, output.instance_name);
      this.instances.set(instance.id, instance);
      this.output_by_instance.set(instance.id, output);
    }
  }

  has_instance(instance_id)
  {
    return this.instances.has(instance_id);
  }

  // Get all instances where the experiment was tested.
  get_instances()
  {
    return this.instances.values();
  }

  // Returns the i-th output of the experiment.
  get_output(instance_id)
  {
    return this.output_by_instance.get(instance_id);
  }
}
