import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { installAgents } from "../../../install";
import { delay } from "../../../utils";
import { createGroup, signalHandler } from "../zome_fns";

export default function createGroupTest(config) {
  let orchestrator = new Orchestrator();
  orchestrator.registerScenario(
    "create group method test",
    async (s: ScenarioApi, t) => {
      const [alice, bobby, charlie] = await s.players([config, config, config]);
      const [alice_lobby_happ] = await installAgents(alice, ["alice"]);
      const [bobby_lobby_happ] = await installAgents(bobby, ["bobby"]);
      const [charlie_lobby_happ] = await installAgents(charlie, ["charlie"]);
      s.shareAllNodes([alice, bobby, charlie]);
      const [alice_conductor] = alice_lobby_happ.cells;

      const alicePubKey = alice_lobby_happ.agent;
      const bobbyPubKey = bobby_lobby_happ.agent;
      const charliePubKey = charlie_lobby_happ.agent;

      // listeners: This listener is used to keep track of the signals received for each agent
      let alice_signal_listener = {
        counter: 0,
        payload: null,
      };
      let bobby_signal_listener = {
        counter: 0,
        payload: null,
      };
      let charlie_signal_listener = {
        counter: 0,
        payload: null,
      };
      // signal handlers assignment
      alice.setSignalHandler((signal) => {
        signalHandler(signal, alice_signal_listener);
      });
      bobby.setSignalHandler((signal) => {
        signalHandler(signal, bobby_signal_listener);
      });
      charlie.setSignalHandler((signal) => {
        signalHandler(signal, charlie_signal_listener);
      });

      await delay(5000);

      // 1 - create one group with a set of members
      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let {
        content: create_group_content,
        groupId,
        groupRevisionId,
      } = await createGroup(create_group_input)(alice_conductor);

      await delay(8000);

      /*
        test error case for blocked agent
        block david
      */
      // await blockContacts([davidPubKey])(alice_conductor);
      // let err_create_group_input = {
      //     name: "group_name 2",
      //     members: [bobbyPubKey, charliePubKey, davidPubKey]
      // };

      /*
        this returns the expected error, however tryorama currently does not handle error 
        and simply panics so this test is commented out.
      */
      // let err_create_group_result = await createGroup(err_create_group_input)(alice_conductor);
      // t.deepEqual(
      //   err_create_group_result.data,
      //   `Wasm error while working with Ribosome: Zome("inner function \\'create_group\\' failed: Wasm(Zome(\\"cannot create group with blocked agents\\"))")`,
      //   "the group cannot be created with blocked agent."
      // );

      // t.equal(actual, expected, msg)

      t.deepEqual(create_group_content.name, create_group_input.name);
      t.deepEqual(create_group_content.creator, alicePubKey);
      t.deepEqual(create_group_content.members, [bobbyPubKey, charliePubKey]);
      t.equal(bobby_signal_listener.counter, 1);
      t.deepEqual(bobby_signal_listener.payload, {
        type: "ADDED_TO_GROUP",
        payload: {
          groupId: groupId,
          groupRevisionId: groupRevisionId,
          latestName: create_group_content.name,
          members: create_group_content.members,
          creator: create_group_content.creator,
          created: create_group_content.created,
        },
      });

      t.equal(charlie_signal_listener.counter, 1);
      t.deepEqual(charlie_signal_listener.payload, {
        type: "ADDED_TO_GROUP",
        payload: {
          groupId: groupId,
          groupRevisionId: groupRevisionId,
          latestName: create_group_content.name,
          members: create_group_content.members,
          creator: create_group_content.creator,
          created: create_group_content.created,
        },
      });
    }
  );

  orchestrator.run();
}
