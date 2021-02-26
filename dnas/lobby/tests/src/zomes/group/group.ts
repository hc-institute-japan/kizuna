import { ScenarioApi } from "@holochain/tryorama/lib/api";
import {
  init,
  createGroup,
  AddGroupMebers,
  removeGroupMembers,
  getLatestGroupVersion,
  updateGroupName,
  getMyGroupsList,
  signalHandler,
  runValidationRules,
} from "./zome_fns";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function getGroupfromGroupOutput(group_output) {
  return {
    name: group_output.latest_name,
    created: group_output.created,
    creator: group_output.creator,
    members: group_output.members,
  };
}

// CONTACTS ZOME FNS
function blockContacts(agentPubKeys) {
  return (conductor) =>
    conductor.call("contacts", "block_contacts", agentPubKeys);
}

// THE FUNCTION get_all_my_groups IS BEING IMPLICITLY TESTED BEACUSE IT'S USED IN ALMOST ALL THE TESTS

export function createGroupTest(orchestrator, config, installables) {
  orchestrator.registerScenario(
    "create group method test",
    async (s: ScenarioApi, t) => {
      const [alice, bobby, charlie, david] = await s.players([
        config,
        config,
        config,
        config,
      ]);

      const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
      const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);
      const [[charlie_happ]] = await charlie.installAgentsHapps(
        installables.one
      );
      const [[david_happ]] = await david.installAgentsHapps(installables.one);

      await s.shareAllNodes([alice, bobby, charlie, david]);

      const alicePubKey = alice_happ.agent;
      const bobbyPubKey = bobby_happ.agent;
      const charliePubKey = charlie_happ.agent;
      const davidPubKey = david_happ.agent;

      const alice_conductor = alice_happ.cells[0];
      const bobby_conductor = bobby_happ.cells[0];
      const charlie_conductor = charlie_happ.cells[0];

      // LISTENERS: THIS LISTENERS ARE USED TO KEEP TRACK OF THE SIGNALS RECEIVED FOR EACH AGENT
      let alice_signal_listener = {
        counter: 0,
        payload: Buffer,
      };
      let bobby_signal_listener = {
        counter: 0,
        payload: Buffer,
      };
      let charlie_signal_listener = {
        counter: 0,
        payload: Buffer,
      };
      // SIGNAL HANLDERS ASSIGNMENT
      alice.setSignalHandler((signal) => {
        signalHandler(signal, alice_signal_listener)("alice");
      });
      bobby.setSignalHandler((signal) => {
        signalHandler(signal, bobby_signal_listener)("bobby");
      });
      charlie.setSignalHandler((signal) => {
        signalHandler(signal, charlie_signal_listener)("charlie");
      });

      init(alice_conductor);
      init(bobby_conductor);
      init(charlie_conductor);
      await delay(1000);

      // 1- CREATE ONE GROUP WITH A SET OF MEMBERS (I USED JUST ONE AGENT BEACUSE THE VALIDATION IS IMPLEMENTED IN THE VALIDATE_CREATE_GROUP CALLBACK AND HOLOCHAIN NOT IMPLEMENTED THIS CALLBACKS YET BUT I TESTED BY MISELF AND IT WORK)
      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey],
      };

      let {
        content: create_group_content,
        group_id,
        group_revision_id,
      } = await createGroup(create_group_input)(alice_conductor);
      await delay(1000);

      // TEST ERROR CASE FOR BLOCKED AGENT
      // block david
      // await blockContacts([davidPubKey])(alice_conductor);
      // let err_create_group_input = {
      //     name: "group_name 2",
      //     members: [bobbyPubKey, charliePubKey, davidPubKey]
      // };

      // this returns the expected error, however tryorama currently does not handle error and simply panics so
      // this test is commented out.
      // let err_create_group_result = await createGroup(err_create_group_input)(alice_conductor);
      // t.deepEqual(
      //   err_create_group_result.data,
      //   `Wasm error while working with Ribosome: Zome("inner function \\'create_group\\' failed: Wasm(Zome(\\"cannot create group with blocked agents\\"))")`,
      //   "the group cannot be created with blocked agent."
      // );

      //t.equal(actual, expected, msg)
      t.deepEqual(
        create_group_content.name,
        create_group_input.name,
        "the group name fields match with the expected value"
      );
      t.deepEqual(
        create_group_content.creator,
        alicePubKey,
        "the group creator fields match with the expected value"
      );
      t.deepEqual(
        create_group_content.members,
        [bobbyPubKey],
        "the group members fields match with the expected value"
      );
      t.equal(
        bobby_signal_listener.counter,
        1,
        "bobby's signal counter its = 1 beacuse he was added to the group"
      );
      t.deepEqual(
        bobby_signal_listener.payload,
        { AddedToGroup: group_id },
        "bobby has received the signal payload from create_group"
      );
      t.equal(
        charlie_signal_listener.counter,
        0,
        "charlie's signal counter its = 0 because he wasn't added to the group"
      );
      t.deepEqual(
        charlie_signal_listener.payload,
        Buffer,
        "charlie's has not received any payload beacuse he was nos added to the group"
      );
    }
  );
}

export function addAndRemoveMembersTest(orchestrator, config, installables) {
  orchestrator.registerScenario(
    "add members method AND remove members methods test",
    async (s, t) => {
      const [alice, bobby, charlie, david] = await s.players([
        config,
        config,
        config,
        config,
      ]);

      const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
      const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);
      const [[charlie_happ]] = await charlie.installAgentsHapps(
        installables.one
      );
      const [[david_happ]] = await david.installAgentsHapps(installables.one);

      await s.shareAllNodes([alice, bobby, charlie]);

      const alicePubKey = alice_happ.agent;
      const bobbyPubKey = bobby_happ.agent;
      const charliePubKey = charlie_happ.agent;
      const davidPubKey = david_happ.agent;

      const alice_conductor = alice_happ.cells[0];
      const bobby_conductor = bobby_happ.cells[0];
      const charlie_conductor = charlie_happ.cells[0];

      // LISTENERS: THIS LISTENERS ARE USED TO KEEP TRACK OF THE SIGNALS RECEIVED FOR EACH AGENT
      let alice_signal_listener = {
        counter: 0,
        payload: Buffer,
      };
      let bobby_signal_listener = {
        counter: 0,
        payload: Buffer,
      };
      let charlie_signal_listener = {
        counter: 0,
        payload: Buffer,
      };

      //SIGNAL HANLDERS ASSIGNMENT
      alice.setSignalHandler((signal) => {
        signalHandler(signal, alice_signal_listener)("alice");
      });
      bobby.setSignalHandler((signal) => {
        signalHandler(signal, bobby_signal_listener)("bobby");
      });
      charlie.setSignalHandler((signal) => {
        signalHandler(signal, charlie_signal_listener)("charlie");
      });

      init(alice_conductor);
      init(bobby_conductor);
      init(charlie_conductor);
      await delay(1000);

      // 1 - CREATE ONE GROUP WITH A SET OF MEMBERS
      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey],
      };

      let {
        content: original_group_content,
        group_id,
        group_revision_id,
      } = await createGroup(create_group_input)(alice_conductor);
      await delay(1000);

      t.deepEqual(
        original_group_content.members,
        [bobbyPubKey],
        "the group members fields match with the expected value"
      );
      t.equal(
        bobby_signal_listener.counter,
        1,
        "bobby's signal counter its = 1 beacuse he was added to the group"
      );
      t.deepEqual(
        bobby_signal_listener.payload,
        { AddedToGroup: group_id },
        "bobby has received the signal payload from create_group"
      );
      t.equal(
        charlie_signal_listener.counter,
        0,
        "charlie's signal counter its = 0 because he wasn't added to the group"
      );
      t.deepEqual(
        charlie_signal_listener.payload,
        Buffer,
        "charlie's has not received any payload beacuse he was nos added to the group"
      );

      // 2 - ADD A NEW MEMBER TO THE GROUP WE CREATED WE SEND A LIST WITH MEMBERS ALREADY ARE ADDED TO TEST ALL THE METHOD
      let update_members_io = {
        members: [bobbyPubKey, charliePubKey],
        group_id: group_id,
        group_revision_id: group_revision_id,
      };

      await AddGroupMebers(update_members_io)(alice_conductor);
      await delay(1000);

      // 2.1 - CALL ADD_MEMBER WITH EMPTY MEMBERS INPUT
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

      // 2.2 - ADD BLOCKED MEMBERS
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

      // 3 - CHECK IF THE VALUES HAS CHANGED AND THE GROUP STATE ITS THE EXPECTED
      let updated_group = await getLatestGroupVersion({ group_hash: group_id })(
        alice_conductor
      );
      await delay(1000);

      t.deepEqual(
        updated_group.name,
        create_group_input.name,
        "the group name fields match with the expected value"
      );
      t.deepEqual(
        updated_group.creator,
        alicePubKey,
        "the group creator fields match with the expected value"
      );
      t.deepEqual(
        updated_group.members,
        [bobbyPubKey, charliePubKey],
        "the group members fields match with the expected value"
      );
      t.equal(
        bobby_signal_listener.counter,
        1,
        "bobby's signal counter its = 1 beacuse he was added to the group"
      );
      t.deepEqual(
        bobby_signal_listener.payload,
        { AddedToGroup: group_id },
        "bobby has received the signal payload from create_group"
      );
      t.equal(
        charlie_signal_listener.counter,
        1,
        "charlie's signal counter its = 1 because he was added to the group"
      );
      t.deepEqual(
        charlie_signal_listener.payload,
        { AddedToGroup: group_id },
        "charlie's has received the signal payload from create_group"
      );

      // 4 - CHECK IF THE GROUP MEMBERS KNOW THEY ARE MEMBERS OF THE GROUP AND IF THE GROUP LIST CONTAINS THE LATEST VERSION OF THE GROUP ENTRIES
      let alice_group_list = (
        await getMyGroupsList(alice_conductor)
      ).map((group_output) => getGroupfromGroupOutput(group_output));
      let bobby_group_list = (
        await getMyGroupsList(bobby_conductor)
      ).map((group_output) => getGroupfromGroupOutput(group_output));
      let charlie_group_list = (
        await getMyGroupsList(charlie_conductor)
      ).map((group_output) => getGroupfromGroupOutput(group_output));
      await delay(1000);

      updated_group.created = original_group_content.created;

      t.deepEqual(
        alice_group_list,
        [updated_group],
        "alice group list match with the expected value"
      );
      t.deepEqual(
        bobby_group_list,
        [updated_group],
        "bobby group list match with the expected value"
      );
      t.deepEqual(
        charlie_group_list,
        [updated_group],
        "charlie group list match with the expected value"
      );

      // 5 - REMOVE GROUP MEMBERS FROM THE GROUP WE CREATED (the add members input and the remove members input have the same format UpdateMembersIo)

      update_members_io = {
        members: [bobbyPubKey], //this public keys list  contains all members we want to remove from the group
        group_id: group_id,
        group_revision_id: group_revision_id,
      };

      await removeGroupMembers(update_members_io)(alice_conductor);
      await delay(1000);

      // 5.1 - REMOVE MEMBERS WITH EMPTY MEMBERS INPUT
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

      // 6 - CHECK IF THE VALUES HAS CHANGED AND THE GROUP STATE IS THE EXPECTED

      updated_group = await getLatestGroupVersion({ group_hash: group_id })(
        alice_conductor
      );
      updated_group.created = original_group_content.created;
      await delay(1000);

      t.deepEqual(
        updated_group.members,
        [charliePubKey],
        "the group members fields match with the expected value"
      );

      // 7 - CHECK IF THE GROUP MEMBERS KNOW THEY ARE MEMBERS OF THE GROUP AND IF THE GROUP LIST CONTAINS THE LATEST VERSION OF THE GROUP ENTRIES

      alice_group_list = (
        await getMyGroupsList(alice_conductor)
      ).map((group_output) => getGroupfromGroupOutput(group_output));
      bobby_group_list = (
        await getMyGroupsList(bobby_conductor)
      ).map((group_output) => getGroupfromGroupOutput(group_output));
      charlie_group_list = (
        await getMyGroupsList(charlie_conductor)
      ).map((group_output) => getGroupfromGroupOutput(group_output));
      await delay(1000);

      t.deepEqual(
        alice_group_list,
        [updated_group],
        "alice group list match with the expected value"
      );
      t.deepEqual(
        bobby_group_list,
        [],
        "bobby group list match with the expected value"
      );
      t.deepEqual(
        charlie_group_list,
        [updated_group],
        "charlie group list match with the expected value"
      );
    }
  );
}

export function updateGroupNameTest(orchestrator, config, installables) {
  orchestrator.registerScenario(
    "update group name  method test",
    async (s, t) => {
      const [alice, bobby, charlie] = await s.players([config, config, config]);

      const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
      const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);
      const [[charlie_happ]] = await charlie.installAgentsHapps(
        installables.one
      );

      await s.shareAllNodes([alice, bobby, charlie]);

      const alicePubKey = alice_happ.agent;
      const bobbyPubKey = bobby_happ.agent;
      const charliePubKey = charlie_happ.agent;

      const alice_conductor = alice_happ.cells[0];
      const bobby_conductor = bobby_happ.cells[0];
      const charlie_conductor = charlie_happ.cells[0];

      // 1- CREATE ONE GROUP WITH A SET OF MEMBERS

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let {
        content: original_group_content,
        group_id,
        group_revision_id,
      } = await createGroup(create_group_input)(alice_conductor);
      await delay(1000);

      // 2 - UPDATE THE GROUP NAME FROM THE GROUP WE'VE CREATED

      let update_group_name_io = {
        name: "New Group Name",
        group_id: group_id,
        group_revision_id: group_revision_id,
      };

      await updateGroupName(update_group_name_io)(alice_conductor);
      await delay(1000);

      // 2.1 - UPDATE GROUP NAME WITH THE SAME NAME: Err case
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

      // 3- CHECK IF THE VALUES HAS CHANGED AND THE GROUP STATE ITS THE EXPECTED

      let updated_group = await getLatestGroupVersion({
        group_hash: update_group_name_io.group_id,
      })(alice_conductor);
      updated_group.created = original_group_content.created;
      await delay(1000);

      t.deepEqual(
        updated_group.name,
        update_group_name_io.name,
        "the group name fields match with the expected value"
      );
      t.deepEqual(
        updated_group.creator,
        alicePubKey,
        "the group creator fields match with the expected value"
      );
      t.deepEqual(
        updated_group.members,
        [bobbyPubKey, charliePubKey],
        "the group members fields match with the expected value"
      );

      // 4- CHECK IF THE GROUP MEMBERS KNOW THEY ARE MEMBERS OF THE GROUP AND IF THE GROUP LIST CONTAINS THE LATEST VERSION OF THE GROUP ENTRIES

      let alice_group_list = (
        await getMyGroupsList(alice_conductor)
      ).map((group_output) => getGroupfromGroupOutput(group_output));
      let bobby_group_list = (
        await getMyGroupsList(bobby_conductor)
      ).map((group_output) => getGroupfromGroupOutput(group_output));
      let charlie_group_list = (
        await getMyGroupsList(charlie_conductor)
      ).map((group_output) => getGroupfromGroupOutput(group_output));
      await delay(1000);

      t.deepEqual(
        alice_group_list,
        [updated_group],
        "alice group list match with the expected value"
      );
      t.deepEqual(
        bobby_group_list,
        [updated_group],
        "bobby group list match with the expected value"
      );
      t.deepEqual(
        charlie_group_list,
        [updated_group],
        "charlie group list match with the expected value"
      );
    }
  );
}

export function validateCreateGroupTest(orchestrator, config, installables) {
  orchestrator.registerScenario(
    "validate_create_group method test",
    async (s, t) => {
      const [alice, bobby, charlie] = await s.players([config, config, config]);

      const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
      const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);
      const [[charlie_happ]] = await charlie.installAgentsHapps(
        installables.one
      );

      await s.shareAllNodes([alice, bobby, charlie]);

      const alicePubKey = alice_happ.agent;
      const bobbyPubKey = bobby_happ.agent;
      const charliePubKey = charlie_happ.agent;

      const alice_conductor = alice_happ.cells[0];

      // 1- CREATE A VALID GOUP

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let create_group_output = await createGroup(create_group_input)(
        alice_conductor
      );
      await delay(1000);

      let validation_input = {
        validation_type: "create",
        group_revision_id: create_group_output.group_revision_id,
      };
      // 2- CHECK THE VALIDATION RULES OUTPUT ANCd CHECK IF WE GET THE EXPECTED VALUE

      let validation_output = await runValidationRules(validation_input)(
        alice_conductor
      );
      delay(1000);

      t.deepEqual(
        validation_output,
        { Valid: null },
        "this group pass the validation rules and can be committed and shared through the network"
      );

      // 3- CREATE A GROUP WITH INVALID GROUP MEMBERS FIELD (groups cannot be created with less than 2 members apart of you);

      create_group_input.members = [bobbyPubKey];

      create_group_output = await createGroup(create_group_input)(
        alice_conductor
      );
      await delay(1000);

      validation_input.group_revision_id =
        create_group_output.group_revision_id;

      // 4- CHECK THE VALIDATION RULES OUTPUT AND CHECK IF WE GET THE EXPECTED VALUE

      validation_output = await runValidationRules(validation_input)(
        alice_conductor
      );
      delay(1000);

      t.deepEqual(
        validation_output,
        { Invalid: "groups cannot be created with less than 3 members" },
        "groups cannot be created with less than 3 members"
      );

      // 5 - CREATE A GROUP WITH INVALIDA GROUP MEMBERS FIELD (creator AgentPubKey cannot be included in the group members list)

      create_group_input.members = [alicePubKey, bobbyPubKey, charliePubKey];

      create_group_output = await createGroup(create_group_input)(
        alice_conductor
      );
      await delay(1000);

      validation_input.group_revision_id =
        create_group_output.group_revision_id;

      // 6- CHECK THE VALIDATION RULES OUTPUT AND CHECK IF WE GET THE EXPECTED VALUE

      validation_output = await runValidationRules(validation_input)(
        alice_conductor
      );
      delay(1000);

      t.deepEqual(
        validation_output,
        {
          Invalid:
            "creator AgentPubKey cannot be included in the group members list",
        },
        "creator AgentPubKey cannot be included in the group members list"
      );

      // 7 - CREATE A GROUP WITH INVALIDA GROUP NAME FIELD (the group name must at least contain 1 character and maximun 50 characters)
      create_group_input.members = [bobbyPubKey, charliePubKey];
      create_group_input.name = "";

      create_group_output = await createGroup(create_group_input)(
        alice_conductor
      );
      await delay(1000);

      validation_input.group_revision_id =
        create_group_output.group_revision_id;

      // 6- CHECK THE VALIDATION RULES OUTPUT AND CHECK IF WE GET THE EXPECTED VALUE

      validation_output = await runValidationRules(validation_input)(
        alice_conductor
      );
      delay(1000);

      t.deepEqual(
        validation_output,
        {
          Invalid:
            "the group name must at least contain 1 character and maximun 50 characters",
        },
        "the group name must at least contain 1 character and maximun 50 characters"
      );
    }
  );
}

// THIS TESTS CANNOT BE IMPLEMENTED YET, UNTILL HOLOCHAIN DO THE VALIDATION CALLBACKS
// export function validateUpdateGroupTest(orchestrator, config, installables) {
//   orchestrator.registerScenario(
//     "validate_update_group method test",
//     async (s, t) => {}
//   );
// }
