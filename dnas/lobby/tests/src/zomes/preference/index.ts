import global from "./global/global";
import per_agent from "./per_agent/per_agent";
import per_group from "./per_group/per_group";

export default (config) => {
  global(config);
  per_group(config);
  per_agent(config);
};
