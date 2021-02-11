export function init(conductor) {
  conductor.call("group", "init");
}
export function createGroup(create_group_input) {
  return (conductor) =>
    conductor.call("group", "create_group", create_group_input);
}
