import { Config, NetworkType, TransportConfigType } from "@holochain/tryorama";
import aggregator from "./zomes/aggregator";
import contacts from "./zomes/contacts";
import group from "./zomes/group";
import preference from "./zomes/preference";

// QUIC
const network = {
  network_type: NetworkType.QuicBootstrap,
  transport_pool: [{ type: TransportConfigType.Quic }],
  bootstrap_service: "https://bootstrap-staging.holo.host/",
};

const config = Config.gen({ network });

group(config);
contacts(config);
preference(config);
aggregator(config);
// request(config); // not passing
