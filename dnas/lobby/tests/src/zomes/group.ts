import { Conductor } from "@holochain/tryorama/lib/conductor";
import { create, update } from "lodash";
import { validateLocaleAndSetLanguage } from "typescript";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function init(conductor){
    conductor.call("group","init",);
}
function createGroup(create_group_input) {
    return (conductor) => 
    conductor.call("group", "create_group", create_group_input);
}
function AddGroupMebers(update_members_io) {
    return (conductor)=>
    conductor.call("group","add_members", update_members_io);

}
function removeGroupMembers(remove_members_io) {
    return (conductor)=>
    conductor.call("group","remove_members", remove_members_io);
}
function getLatestGroupVertion(group_entry_hash) {
    return (coductor)=>
    coductor.call("group","get_group_latest_version",group_entry_hash);
}
function getGroupfromGroupOutput(group_output) {

    return {
        name: group_output.latest_name, 
        created: group_output.created,
        creator: group_output.creator,
        members: group_output.members,
    };
}
function updateGroupName(update_group_name_io) {
    return (conductor) => 
    conductor.call("group","update_group_name", update_group_name_io); 
}
function getMyGroupsList(conductor){
    return conductor.call("group","get_all_my_groups",);
}
function signalHandler(signal, signal_listener) {

    /*
    //this is the incoming signal format
    signal = { 
        type: String, 
        data: { 
            cellId: Hash (what it means this hashes) , 
            payload: SignalDetails { 
                name : String, 
                payload : SignalPayload, 
            } 
        }
    }
    */ 

    signal_listener.counter++;
    return (username) =>{

        console.log(`we have a new signal incoming ${username}`);
        signal_listener.payload = signal.data.payload.payload;
    }
};
function getGroupHashes(group){
    return (conductor)=>
        conductor.call("group","get_group_entry_and_header_hash",group);
}

//VAlIDATION FUCNTIONS 
function runValidationRules(validation_input){
    return (conductor)=>
        conductor.call("group","run_validation",validation_input);
}


//THE FUNCTION GET ALL MY GROUPS ITS BEEN IMPLICITLY TESTED BEACUSE IS USED IN ALMOST  ALL THE TESTS AND WE'VE CHECK HIS CORRECT BEHAVIOR
export default (orchestrator, config, installation) => {

    orchestrator.registerScenario ("create group method test", async(s,t) =>{

        
        const [alice,bobby,charlie] = await s.players([config,config,config]);

        const [[alice_happ]] = await alice.installAgentsHapps(installation);
        const [[bobby_happ]] = await bobby.installAgentsHapps(installation);
        const [[charlie_happ]] = await charlie.installAgentsHapps(installation);

        await s.shareAllNodes([alice, bobby, charlie])

        const alicePubKey = alice_happ.agent;
        const bobbyPubKey = bobby_happ.agent;
        const charliePubKey = charlie_happ.agent;

        const alice_conductor = alice_happ.cells[0];
        const bobby_conductor = bobby_happ.cells[0];
        const charlie_conductor = charlie_happ.cells[0];

        // LISTENERS: THIS LISTENERS ARE USED TO KEEP TRACK OF THE SIGNALS RECEIVED FOR EACH AGENT 
        let alice_signal_listener = {
            counter:0,
            payload: Buffer,
        }       
        let bobby_signal_listener = {
            counter:0,
            payload: Buffer,
        }        
        let charlie_signal_listener = {
            counter:0,
            payload: Buffer,
        }
        //SIGNAL HANLDERS ASSIGNMENT
        alice.setSignalHandler(
            (signal)=>{
                signalHandler(signal,alice_signal_listener)("alice");
            }
        );
        bobby.setSignalHandler(
            (signal)=>{
                signalHandler(signal,bobby_signal_listener)("bobby");
            }
        );
        charlie.setSignalHandler(
            (signal)=>{
                signalHandler(signal,charlie_signal_listener)("charlie");
            }
        );
        
        init(alice_conductor); 
        init(bobby_conductor); 
        init(charlie_conductor);
        await delay(1000);
        
        
        // 1- CREATE ONE GROUP WITH A SET OF MEMBERS (I USED JUST ONE AGENT BEACUSE THE VALIDATION ITS IMPLEMENTED IN THE VALIDATE_CREATE_GROUP CALLBACK AND HOLOCHAIN NOT IMPLEMENTED THIS CALLBACKS YET BUT I TESTED BY MISELF AND IT WORK)
        let create_group_input = {
            name: "Group_name",
            members: [bobbyPubKey],
        };

        let {content, group_id, group_revision_id} = await createGroup(create_group_input)(alice_conductor);
        await delay(1000);

        //t.equal(actual, expected, msg)
        t.deepEqual(content.name, create_group_input.name, "the group name fields match with the expected value");
        t.deepEqual(content.creator, alicePubKey, "the group creator fields match with the expected value");
        t.deepEqual(content.members, [bobbyPubKey], "the group members fields match with the expected value");
        t.equal(bobby_signal_listener.counter, 1, "bobby's signal counter its = 1 beacuse he was added to the group");
        t.deepEqual(bobby_signal_listener.payload, {AddedToGroup: group_id}, "bobby has received the signal payload from create_group" );
        t.equal(charlie_signal_listener.counter, 0, "charlie's signal counter its = 0 because he wasn't added to the group");
        t.deepEqual(charlie_signal_listener.payload, Buffer, "charlie's has not received any payload beacuse he was nos added to the group" );
        
    });
    orchestrator.registerScenario ("add members method AND remove members methods test", async(s,t) =>{

        
        const [alice,bobby,charlie] = await s.players([config,config,config]);

        const [[alice_happ]] = await alice.installAgentsHapps(installation);
        const [[bobby_happ]] = await bobby.installAgentsHapps(installation);
        const [[charlie_happ]] = await charlie.installAgentsHapps(installation);

        await s.shareAllNodes([alice, bobby, charlie])

        const alicePubKey = alice_happ.agent;
        const bobbyPubKey = bobby_happ.agent;
        const charliePubKey = charlie_happ.agent;

        const alice_conductor = alice_happ.cells[0];
        const bobby_conductor = bobby_happ.cells[0];
        const charlie_conductor = charlie_happ.cells[0];

        // LISTENERS: THIS LISTENERS ARE USED TO KEEP TRACK OF THE SIGNALS RECEIVED FOR EACH AGENT 
        let alice_signal_listener = {
            counter:0,
            payload: Buffer,
        }       
        let bobby_signal_listener = {
            counter:0,
            payload: Buffer,
        }        
        let charlie_signal_listener = {
            counter:0,
            payload: Buffer,
        }
        //SIGNAL HANLDERS ASSIGNMENT
        alice.setSignalHandler(
            (signal)=>{
                signalHandler(signal,alice_signal_listener)("alice");
            }
        );
        bobby.setSignalHandler(
            (signal)=>{
                signalHandler(signal,bobby_signal_listener)("bobby");
            }
        );
        charlie.setSignalHandler(
            (signal)=>{
                signalHandler(signal,charlie_signal_listener)("charlie");
            }
        );
        
        init(alice_conductor); 
        init(bobby_conductor); 
        init(charlie_conductor);
        await delay(1000);
        
        
        // 1- CREATE ONE GROUP WITH A SET OF MEMBERS
        let create_group_input = {
            name: "Group_name",
            members: [bobbyPubKey],
        };

        let {content, group_id, group_revision_id} = await createGroup(create_group_input)(alice_conductor);
        await delay(1000);

        t.deepEqual(content.members, [bobbyPubKey], "the group members fields match with the expected value");
        t.equal(bobby_signal_listener.counter, 1, "bobby's signal counter its = 1 beacuse he was added to the group");
        t.deepEqual(bobby_signal_listener.payload, {AddedToGroup: group_id}, "bobby has received the signal payload from create_group" );
        t.equal(charlie_signal_listener.counter, 0, "charlie's signal counter its = 0 because he wasn't added to the group");
        t.deepEqual(charlie_signal_listener.payload, Buffer, "charlie's has not received any payload beacuse he was nos added to the group" );


        // 2- ADD A NEW MEMBER TO THE GROUP WE CREATED WE SEND A LIST WITH MEMBERS ALREADY ARE ADDED TO TEST ALL THE METHOD
        let update_members_io = {
            members: [bobbyPubKey, charliePubKey],
            group_id: group_id,
            group_revision_id: group_revision_id,
        };

        await AddGroupMebers(update_members_io)(alice_conductor);
        await delay(1000);
        
        // 3- CHECK IF THE VALUES HAS CHANGED AND THE GROUP STATE ITS THE EXPECTED
        let updated_group = await getLatestGroupVertion({group_hash:group_id})(alice_conductor);
        await delay(1000);

        t.deepEqual(updated_group.name, create_group_input.name, "the group name fields match with the expected value");
        t.deepEqual(updated_group.creator, alicePubKey, "the group creator fields match with the expected value");
        t.deepEqual(updated_group.members, [bobbyPubKey,charliePubKey], "the group members fields match with the expected value");
        t.equal(bobby_signal_listener.counter, 1, "bobby's signal counter its = 1 beacuse he was added to the group");
        t.deepEqual(bobby_signal_listener.payload, {AddedToGroup: group_id}, "bobby has received the signal payload from create_group");
        t.equal(charlie_signal_listener.counter, 1, "charlie's signal counter its = 1 because he was added to the group");
        t.deepEqual(charlie_signal_listener.payload,  {AddedToGroup: group_id}, "charlie's has received the signal payload from create_group");
        
        // 4- CHECK IF THE GROUP MEMBERS KNOW THEY ARE MEMBERS OF THE GROUP AND IF THE GROUP LIST CONTAINS THE LATEST VERSION OF THE GROUP ENTRIES
        let alice_group_list = (await getMyGroupsList(alice_conductor)).map( (group_output)=>  getGroupfromGroupOutput(group_output) );
        let bobby_group_list = (await getMyGroupsList( bobby_conductor)).map( (group_output)=>  getGroupfromGroupOutput(group_output) );
        let charlie_group_list = (await getMyGroupsList(charlie_conductor)).map( (group_output)=>  getGroupfromGroupOutput(group_output) );
        await delay(1000);
        
        t.deepEqual(alice_group_list, [updated_group], "alice group list match with the expected value");
        t.deepEqual(bobby_group_list, [updated_group], "bobby group list match with the expected value");
        t.deepEqual(charlie_group_list, [updated_group], "charlie group list match with the expected value");

        // 5- REMOVE GROUP MEMBERS FROM THE GROUP WE CREATED (the add members input and the remove members input have the same format UpdateMembersIo)
        
        update_members_io = {
            members: [bobbyPubKey], //this public keys list  contains all members we want to remove from the group
            group_id: group_id,
            group_revision_id: group_revision_id,
        };

        await removeGroupMembers(update_members_io)(alice_conductor);
        await delay(1000);

        // 6- CHECK IF THE VALUES HAS CHANGED AND THE GROUP STATE ITS THE EXPECTED

        updated_group = await getLatestGroupVertion({group_hash:group_id})(alice_conductor);
        await delay(1000);

        t.deepEqual(updated_group.members, [charliePubKey], "the group members fields match with the expected value");
        
        // 7- CHECK IF THE GROUP MEMBERS KNOW THEY ARE MEMBERS OF THE GROUP AND IF THE GROUP LIST CONTAINS THE LATEST VERSION OF THE GROUP ENTRIES

        alice_group_list = (await getMyGroupsList(alice_conductor)).map( (group_output)=>  getGroupfromGroupOutput(group_output) );
        bobby_group_list = (await getMyGroupsList( bobby_conductor)).map( (group_output)=>  getGroupfromGroupOutput(group_output) );
        charlie_group_list = (await getMyGroupsList(charlie_conductor)).map( (group_output)=>  getGroupfromGroupOutput(group_output) );
        await delay(1000);

        t.deepEqual(alice_group_list, [updated_group], "alice group list match with the expected value");
        t.deepEqual(bobby_group_list, [], "bobby group list match with the expected value");
        t.deepEqual(charlie_group_list, [updated_group], "charlie group list match with the expected value");
        
        
        
    });
    orchestrator.registerScenario ("update group name  method test", async(s,t) =>{

        
        const [alice,bobby,charlie] = await s.players([config,config,config]);

        const [[alice_happ]] = await alice.installAgentsHapps(installation);
        const [[bobby_happ]] = await bobby.installAgentsHapps(installation);
        const [[charlie_happ]] = await charlie.installAgentsHapps(installation);

        await s.shareAllNodes([alice, bobby, charlie])

        const alicePubKey = alice_happ.agent;
        const bobbyPubKey = bobby_happ.agent;
        const charliePubKey = charlie_happ.agent;

        const alice_conductor = alice_happ.cells[0];
        const bobby_conductor = bobby_happ.cells[0];
        const charlie_conductor = charlie_happ.cells[0];
        
        // 1- CREATE ONE GROUP WITH A SET OF MEMBERS

        let create_group_input = {
            name: "Group_name",
            members: [bobbyPubKey,charliePubKey],
        };

        let {content, group_id, group_revision_id} = await createGroup(create_group_input)(alice_conductor);
        await delay(1000);

        // 2 - UPDATE THE GROUP NAME FROM THE GROUP WE'VE CREATED

        let update_group_name_io = {
            name: "New Group Name",
            group_id: group_id,
            group_revision_id: group_revision_id,
        };         
         
        await updateGroupName(update_group_name_io)(alice_conductor);
        await delay(1000);

        // 3- CHECK IF THE VALUES HAS CHANGED AND THE GROUP STATE ITS THE EXPECTED

        let updated_group = await getLatestGroupVertion({group_hash:update_group_name_io.group_id})(alice_conductor);
        await delay(1000);

        t.deepEqual(updated_group.name, update_group_name_io.name, "the group name fields match with the expected value");
        t.deepEqual(updated_group.creator, alicePubKey, "the group creator fields match with the expected value");
        t.deepEqual(updated_group.members, [bobbyPubKey,charliePubKey], "the group members fields match with the expected value");
       
        // 4- CHECK IF THE GROUP MEMBERS KNOW THEY ARE MEMBERS OF THE GROUP AND IF THE GROUP LIST CONTAINS THE LATEST VERSION OF THE GROUP ENTRIES

        let alice_group_list = (await getMyGroupsList(alice_conductor)).map( (group_output)=>  getGroupfromGroupOutput(group_output) );
        let bobby_group_list = (await getMyGroupsList(bobby_conductor)).map( (group_output)=>  getGroupfromGroupOutput(group_output) );
        let charlie_group_list = (await getMyGroupsList(charlie_conductor)).map( (group_output)=>  getGroupfromGroupOutput(group_output) );
        await delay(1000);
        
        t.deepEqual(alice_group_list, [updated_group], "alice group list match with the expected value");
        t.deepEqual(bobby_group_list, [updated_group], "bobby group list match with the expected value");
        t.deepEqual(charlie_group_list, [updated_group], "charlie group list match with the expected value");
        
    });
    orchestrator.registerScenario ("validate_create_group method test", async(s,t) =>{

        
        const [alice,bobby,charlie] = await s.players([config,config,config]);

        const [[alice_happ]] = await alice.installAgentsHapps(installation);
        const [[bobby_happ]] = await bobby.installAgentsHapps(installation);
        const [[charlie_happ]] = await charlie.installAgentsHapps(installation);

        await s.shareAllNodes([alice, bobby, charlie])

        const alicePubKey = alice_happ.agent;
        const bobbyPubKey = bobby_happ.agent;
        const charliePubKey = charlie_happ.agent;

        const alice_conductor = alice_happ.cells[0];
        
        // 1- CREATE A VALID GOUP 

        let create_group_input = {
            name: "Group_name",
            members: [bobbyPubKey,charliePubKey],
        };

        let create_group_output = await createGroup(create_group_input)(alice_conductor);
        await delay(1000);

        let validation_input = {
            validation_type: "create",
            group_revision_id: create_group_output.group_revision_id,
        };
        // 2- CHECK THE VALIDATION RULES OUTPUT ANCd CHECK IF WE GET THE EXPECTED VALUE 


        let validation_output = await runValidationRules(validation_input)(alice_conductor);
        delay(1000);

        t.deepEqual(validation_output, {Valid: null}, "this group pass the validation rules and can be committed and shared through the network");


        // 3- CREATE A GROUP WITH INVALID GROUP MEMBERS FIELD (groups cannot be created with less than 2 members apart of you);
        
        create_group_input.members = [bobbyPubKey];
        
        create_group_output =  await createGroup(create_group_input)(alice_conductor);
        await delay(1000);

        validation_input.group_revision_id =  create_group_output.group_revision_id;

        // 4- CHECK THE VALIDATION RULES OUTPUT AND CHECK IF WE GET THE EXPECTED VALUE  
        
        validation_output = await runValidationRules(validation_input)(alice_conductor);
        delay(1000);

        t.deepEqual(validation_output, {Invalid: "groups cannot be created with less than 3 members"},"groups cannot be created with less than 3 members");

        // 5 - CREATE A GROUP WITH INVALIDA GROUP MEMBERS FIELD (creator AgentPubKey cannot be included in the group members list) 

        create_group_input.members = [alicePubKey,bobbyPubKey,charliePubKey];
        
        create_group_output =  await createGroup(create_group_input)(alice_conductor);
        await delay(1000);

        validation_input.group_revision_id =  create_group_output.group_revision_id;
        
        // 6- CHECK THE VALIDATION RULES OUTPUT AND CHECK IF WE GET THE EXPECTED VALUE  

        validation_output = await runValidationRules(validation_input)(alice_conductor);
        delay(1000);

        t.deepEqual(validation_output, {Invalid: "creator AgentPubKey cannot be included in the group members list"},"creator AgentPubKey cannot be included in the group members list");

        // 7 - CREATE A GROUP WITH INVALIDA GROUP NAME FIELD (the group name must at least contain 1 character and maximun 50 characters)
        create_group_input.members = [bobbyPubKey,charliePubKey];
        create_group_input.name = "";

        create_group_output =  await createGroup(create_group_input)(alice_conductor);
        await delay(1000);

        validation_input.group_revision_id =  create_group_output.group_revision_id;

        // 6- CHECK THE VALIDATION RULES OUTPUT AND CHECK IF WE GET THE EXPECTED VALUE  

        validation_output = await runValidationRules(validation_input)(alice_conductor);
        delay(1000);

        t.deepEqual(validation_output, {Invalid: "the group name must at least contain 1 character and maximun 50 characters"},"the group name must at least contain 1 character and maximun 50 characters");

        
    });
    orchestrator.registerScenario ("validate_update_group method test", async(s,t) =>{

        //THIS TESTS CANNOT BE IMPLEMENTED YET, UNTILL HOLOCHAIN DO THE VALIDATION CALLBACKS 

    });

}