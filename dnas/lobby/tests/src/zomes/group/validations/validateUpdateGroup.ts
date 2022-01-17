import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { installAgents } from "../../../install";
import { delay } from "../../../utils";
import {
  createGroup,
  updateGroupName,
  removeGroupMembers,
  AddGroupMebers,
} from "../zome_fns";

export default function validateCreateGroupTest(config) {
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "validate_update_group method test",
    async (s: ScenarioApi, t) => {
      const [alice, bobby, charlie] = await s.players([config, config, config]);
      const [alice_lobby_happ] = await installAgents(alice, ["alice"]);
      const [bobby_lobby_happ] = await installAgents(bobby, ["bobby"]);
      const [charlie_lobby_happ] = await installAgents(charlie, ["charlie"]);
      s.shareAllNodes([alice, bobby, charlie]);
      const [alice_conductor] = alice_lobby_happ.cells;
      const [bobby_conductor] = bobby_lobby_happ.cells;

      await delay(2000);

      const alicePubKey = alice_lobby_happ.agent;
      const bobbyPubKey = bobby_lobby_happ.agent;
      const charliePubKey = charlie_lobby_happ.agent;

      // signal handlers assignment
      alice.setSignalHandler((signal) => {});
      bobby.setSignalHandler((signal) => {});
      charlie.setSignalHandler((signal) => {});

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let { content, groupId, groupRevisionId } = await createGroup(
        create_group_input
      )(alice_conductor);
      await delay(1000);

      let update_members_io = {
        members: [charliePubKey],
        groupId,
        groupRevisionId,
      };

      let update_group_name_io = {
        name: "",
        groupId,
        groupRevisionId,
      };

      // cannot have groups less than 3 members
      try {
        await removeGroupMembers(update_members_io)(alice_conductor);
      } catch (e) {
        t.deepEqual(e, {
          type: "error",
          data: {
            type: "internal_error",
            data: "Source chain error: InvalidCommit error: groups cannot be created with less than 3 members",
          },
        });
      }

      // non-admin members cannot update group
      try {
        await removeGroupMembers(update_members_io)(bobby_conductor);
      } catch (e) {
        t.deepEqual(e, {
          type: "error",
          data: {
            type: "internal_error",
            data: "Source chain error: InvalidCommit error: cannot update a group entry if you are not the group creator (admin)",
          },
        });
      }

      // admin cannot be in members field
      try {
        update_members_io.members = [alicePubKey];
        await AddGroupMebers(update_members_io)(alice_conductor);
      } catch (e) {
        t.deepEqual(e, {
          type: "error",
          data: {
            type: "internal_error",
            data: "Source chain error: InvalidCommit error: creator AgentPubKey cannot be included in the group members list",
          },
        });
      }

      // new name is empty
      try {
        await updateGroupName(update_group_name_io)(alice_conductor);
      } catch (e) {
        t.deepEqual(e, {
          type: "error",
          data: {
            type: "internal_error",
            data: "Source chain error: InvalidCommit error: the group name must be 1 to 50 characters length",
          },
        });
      }

      // new name is > 50 characters
      try {
        update_group_name_io.name = Math.pow(10, 150).toString(2);
        await updateGroupName(update_group_name_io)(alice_conductor);
      } catch (e) {
        t.deepEqual(e, {
          type: "error",
          data: {
            type: "internal_error",
            data: "Source chain error: InvalidCommit error: the group name must be 1 to 50 characters length",
          },
        });
      }
    }
  );

  orchestrator.run();
}
