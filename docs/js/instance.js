// Represents an instance of an experimentation.
// Attributes:
//  - id: unique id of the instance.
//  - dataset_name: name of the dataset of the instance.
//  - instance_name: name of the instance.
class Instance
{
  constructor(dataset_name, instance_name)
  {
    this.id = to_id(dataset_name + "_" + instance_name);
    this.dataset_name = dataset_name;
    this.instance_name = instance_name;
  }
}
