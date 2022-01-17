import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { installAgents } from "../../../install";
import { delay } from "../../../utils";
import { getGroupfromGroupOutput } from "../utils";
import {
  AddGroupMebers,
  createGroup,
  getAllMyGroups,
  getLatestGroupVersion,
  removeGroupMembers,
  signalHandler,
} from "../zome_fns";

export default function addAndRemoveMembersTest(config) {
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "add members method and remove members methods test",
    async (s: ScenarioApi, t) => {
      const [alice, bobby, charlie, david] = await s.players([
        config,
        config,
        config,
        config,
      ]);
      const [alice_lobby_happ] = await installAgents(alice, ["alice"]);
      const [bobby_lobby_happ] = await installAgents(bobby, ["bobby"]);
      const [charlie_lobby_happ] = await installAgents(charlie, ["charlie"]);
      const [david_lobby_happ] = await installAgents(david, ["david"]);
      s.shareAllNodes([alice, bobby, charlie, david]);
      const [alice_conductor] = alice_lobby_happ.cells;
      const [bobby_conductor] = bobby_lobby_happ.cells;
      const [charlie_conductor] = charlie_lobby_happ.cells;
      const [david_conductor] = david_lobby_happ.cells;

      const alicePubKey = alice_lobby_happ.agent;
      const bobbyPubKey = bobby_lobby_happ.agent;
      const charliePubKey = charlie_lobby_happ.agent;
      const davidPubKey = david_lobby_happ.agent;

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
      let david_signal_listener = {
        counter: 0,
        payload: null,
      };

      // set signal handlers
      alice.setSignalHandler((signal) => {
        signalHandler(signal, alice_signal_listener);
      });
      bobby.setSignalHandler((signal) => {
        signalHandler(signal, bobby_signal_listener);
      });
      charlie.setSignalHandler((signal) => {
        signalHandler(signal, charlie_signal_listener);
      });
      david.setSignalHandler((signal) => {
        signalHandler(signal, david_signal_listener);
      });

      await delay(2000);

      // 1 - create one group with a set of members
      let create_group_input = {
        name: "Group_name",
        members: [charliePubKey, davidPubKey],
      };

      let {
        content: original_group_content,
        groupId,
        groupRevisionId,
      } = await createGroup(create_group_input)(alice_conductor);
      await delay();

      t.deepEqual(original_group_content.members, [charliePubKey, davidPubKey]);
      t.equal(charlie_signal_listener.counter, 1);
      t.deepEqual(charlie_signal_listener.payload, {
        type: "ADDED_TO_GROUP",
        payload: {
          groupId: groupId,
          groupRevisionId: groupRevisionId,
          latestName: original_group_content.name,
          members: original_group_content.members,
          creator: original_group_content.creator,
          created: original_group_content.created,
        },
      });

      // 2 - add a new member to the group we created. we send a list with members already are added to test all the method
      let update_members_io = {
        members: [bobbyPubKey],
        groupId,
        groupRevisionId,
      };

      await AddGroupMebers(update_members_io)(alice_conductor);
      await delay();

      // 2.1 - call add_member with empty members input
      // let add_members_io_empty_members = {
      //   members: [],
      //   group_id: group_id,
      //   group_revision_id: group_revision_id,
      // };

      // let err_empty_members_add_members = await AddGroupMebers(add_members_io_empty_members)(alice_conductor);
      // t.deepEqual(
      //   err_empty_members_add_members.data.data,
      //   `Wasm error while working with Ribosome: Zome("inner function \\'add_members\\' failed: Wasm(Zome(\\"members field is empty\\"))")`,
      //   "cannot add group with empty members"
      // );

      // 2.2 - add blocked members
      // await blockContacts([davidPubKey])(alice_conductor);
      // let update_members_io_blocked_members = {
      //   members: [davidPubKey],
      //   group_id: group_id,
      //   group_revision_id: group_revision_id,
      // };
      // let err_add_members_blocked_agent = await AddGroupMebers(update_members_io_blocked_members)(alice_conductor);
      // t.deepEqual(
      //   err_add_members_blocked_agent.data.data,
      //   `Wasm error while working with Ribosome: Zome("inner function \\'add_members\\' failed: Wasm(Zome(\\"cannot create group with blocked agents\\"))")`,
      //   "cannot add group with blocked members"
      // );

      // 3 - check if the values has changed and the group state is at an expected state
      let updated_group = await getLatestGroupVersion(groupId)(alice_conductor);
      await delay();

      t.deepEqual(updated_group.latestName, create_group_input.name);
      t.deepEqual(updated_group.creator, alicePubKey);
      t.deepEqual(updated_group.members, [
        charliePubKey,
        davidPubKey,
        bobbyPubKey,
      ]);
      t.equal(bobby_signal_listener.counter, 1);
      t.deepEqual(bobby_signal_listener.payload, {
        type: "ADDED_TO_GROUP",
        payload: {
          groupId,
          groupRevisionId,
          latestName: updated_group.latestName,
          members: updated_group.members,
          creator: updated_group.creator,
          created: updated_group.created,
        },
      });

      /*
        4 - check if the group members know they are members of the group and
        if the group list contains the latest version of the group entries
      */
      let alice_group_list = (await getAllMyGroups(alice_conductor)).map(
        (group_output) => getGroupfromGroupOutput(group_output)
      );
      let bobby_group_list = (await getAllMyGroups(bobby_conductor)).map(
        (group_output) => getGroupfromGroupOutput(group_output)
      );
      let charlie_group_list = (await getAllMyGroups(charlie_conductor)).map(
        (group_output) => getGroupfromGroupOutput(group_output)
      );
      await delay();

      updated_group.created = original_group_content.created;

      t.deepEqual(alice_group_list.length, [updated_group].length);
      t.deepEqual(bobby_group_list.length, [updated_group].length);
      t.deepEqual(charlie_group_list.length, [updated_group].length);

      // 5 - remove group members

      update_members_io = {
        members: [bobbyPubKey],
        groupId,
        groupRevisionId,
      };

      await removeGroupMembers(update_members_io)(alice_conductor);
      await delay();

      // 5.1 - remove members with empty members input
      // let update_members_io_empty_members = {
      //   members: [],
      //   group_id: group_id,
      //   group_revision_id: group_revision_id,
      // };

      // let err_empty_members_remove_members = await removeGroupMembers(update_members_io_empty_members)(alice_conductor);
      // t.deepEqual(
      //   err_empty_members_remove_members.data.data,
      //   `Wasm error while working with Ribosome: Zome("inner function \\'remove_members\\' failed: Wasm(Zome(\\"members field is empty\\"))")`,
      //   "cannot remove group with empty members"
      // );

      // 6 - check if the values has changed and the group state is the expected

      updated_group = await getLatestGroupVersion(groupId)(alice_conductor);
      updated_group.created = original_group_content.created;
      await delay();

      t.deepEqual(updated_group.members, [charliePubKey, davidPubKey]);

      // 7 - check if the remaining group members still know they are part of the group and whether the group entry is the latest version

      alice_group_list = (await getAllMyGroups(alice_conductor)).map(
        (group_output) => getGroupfromGroupOutput(group_output)
      );
      bobby_group_list = (await getAllMyGroups(bobby_conductor)).map(
        (group_output) => getGroupfromGroupOutput(group_output)
      );
      charlie_group_list = (await getAllMyGroups(charlie_conductor)).map(
        (group_output) => getGroupfromGroupOutput(group_output)
      );
      let david_group_list = (await getAllMyGroups(david_conductor)).map(
        (group_output) => getGroupfromGroupOutput(group_output)
      );
      await delay();

      t.deepEqual(alice_group_list.length, [updated_group].length);
      t.deepEqual(bobby_group_list, []);
      t.deepEqual(charlie_group_list.length, [updated_group].length);
      t.deepEqual(david_group_list.length, [updated_group].length);
    }
  );

  orchestrator.run();
}
