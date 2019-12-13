class Kaleidoscope
{
  constructor()
  {
    this.experiment_file_count = 0;
    this.experiments = [];
    this.parsers = [];
  }

  add_experiment_file(experiment_file)
  {
    experiment_file.id = this.experiment_file_count++;
    var experiment_names = new Set();
    for (var output of experiment_file.outputs)
      experiment_names.add(output.experiment_name);

    var new_ids = [];
    for (var experiment_name of experiment_names)
      new_ids.push(this.add_experiment(experiment_file, experiment_name));
    return new_ids;
  }

  add_experiment(experiment_file, experiment_name)
  {
    var id = this.experiments.length;
    this.experiments.push(new Experiment(id, experiment_file, experiment_name));
    return id;
  }

  add_parser(type, parser)
  {
    this.parsers.push({type:type, parser:parser});
  }

  get_parser(type)
  {
    for (var p of this.parsers)
      if (p.type == type) return p.parser;
    return undefined;
  }

  get_experiment(id)
  {
    return this.experiments[id];
  }

  get_instances_of_experiments(experiment_ids)
  {
    var instances = new Map();
    for (var experiment_id of experiment_ids)
      for (var instance of this.experiments[experiment_id].get_instances())
        instances.set(instance.id, instance);
    return instances.values();
  }

  get_output(experiment_id, instance_id)
  {
    return this.experiments[experiment_id].get_output(instance_id);
  }
}
