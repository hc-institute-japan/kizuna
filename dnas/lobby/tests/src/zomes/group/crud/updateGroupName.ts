import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { installAgents } from "../../../install";
import { delay } from "../../../utils";
import { getGroupfromGroupOutput } from "../utils";
import {
  createGroup,
  getAllMyGroups,
  getLatestGroupVersion,
  updateGroupName,
} from "../zome_fns";

export default function updateGroupNameTest(config) {
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "update group name method test",
    async (s: ScenarioApi, t) => {
      const [alice, bobby, charlie] = await s.players([config, config, config]);
      const [alice_lobby_happ] = await installAgents(alice, ["alice"]);
      const [bobby_lobby_happ] = await installAgents(bobby, ["bobby"]);
      const [charlie_lobby_happ] = await installAgents(charlie, ["charlie"]);
      s.shareAllNodes([alice, bobby, charlie]);
      const [alice_conductor] = alice_lobby_happ.cells;
      const [bobby_conductor] = bobby_lobby_happ.cells;
      const [charlie_conductor] = charlie_lobby_happ.cells;

      const alicePubKey = alice_lobby_happ.agent;
      const bobbyPubKey = bobby_lobby_happ.agent;
      const charliePubKey = charlie_lobby_happ.agent;

      await delay(2000);

      // signal handlers assignment
      alice.setSignalHandler((signal) => {});
      bobby.setSignalHandler((signal) => {});
      charlie.setSignalHandler((signal) => {});

      // 1- create group
      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let {
        content: original_group_content,
        groupId,
        groupRevisionId,
      } = await createGroup(create_group_input)(alice_conductor);
      await delay(5000);

      // 2 - update group name
      let update_group_name_io = {
        name: "New Group Name",
        groupId,
        groupRevisionId,
      };

      await updateGroupName(update_group_name_io)(alice_conductor);
      await delay(5000);

      // 2.1 - update group name with the same name (err)
      // let update_group_name_io_same_name = {
      //   name: "New Group Name",
      //   group_id: group_id,
      //   group_revision_id: group_revision_id,
      // };
      // let err_update_group_name = await updateGroupName(update_group_name_io_same_name)(alice_conductor);
      // t.deepEqual(
      //   err_update_group_name.data.data,
      //   `Wasm error while working with Ribosome: Zome("inner function \\'update_group_name\\' failed: Wasm(Zome(\\"the new name and old name of the group are the same.\\"))")`,
      //   "cannot update group name with same name"
      // );

      // 3- check if the values has changed and the group state is as expected

      let updated_group = await getLatestGroupVersion(
        update_group_name_io.groupId
      )(alice_conductor);

      updated_group.created = original_group_content.created;

      await delay(5000);

      t.deepEqual(updated_group.latestName, update_group_name_io.name);
      t.deepEqual(updated_group.creator, alicePubKey);
      t.deepEqual(updated_group.members, [bobbyPubKey, charliePubKey]);

      // 4 - check if the group members they are members of the group

      let alice_group_list = (await getAllMyGroups(alice_conductor)).map(
        (group_output) => getGroupfromGroupOutput(group_output)
      );
      let bobby_group_list = (await getAllMyGroups(bobby_conductor)).map(
        (group_output) => getGroupfromGroupOutput(group_output)
      );
      let charlie_group_list = (await getAllMyGroups(charlie_conductor)).map(
        (group_output) => getGroupfromGroupOutput(group_output)
      );
      await delay(5000);

      t.deepEqual(alice_group_list.length, [updated_group].length);
      t.deepEqual(bobby_group_list.length, [updated_group].length);
      t.deepEqual(charlie_group_list.length, [updated_group].length);
    }
  );

  orchestrator.run();
}
