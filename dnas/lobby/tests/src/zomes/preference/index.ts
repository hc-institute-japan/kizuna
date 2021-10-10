// group CRUDs
import global from "./global/global";
import per_agent from "./per_agent/per_agent";
import per_group from "./per_group/per_group";

export default (config, installables) => {
  global(config, installables);
  per_group(config, installables);
  per_agent(config, installables);
};
