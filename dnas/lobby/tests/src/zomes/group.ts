import { Conductor } from "@holochain/tryorama/lib/conductor";
import { create } from "lodash";
import { validateLocaleAndSetLanguage } from "typescript";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function init(conductor){
    conductor.call("group","init",);
}
function createGroup(create_group_input) {
    return (conductor) => 
    conductor.call("group", "create_group", create_group_input);
}
function AddGroupMebers(add_group_members_input){
    return (conductor)=>
    conductor.call("group","add_members", add_group_members_input);

}
function getGroupHashes(group){

    return (conductor)=>
        conductor.call("group","get_group_entry_and_header_hash",group);
}
function getLatestGroupVertion(group_entry_hash){
    return (coductor)=>
    coductor.call("group","get_group_latest_vertion",group_entry_hash);
}
function removeGroupMembers(remove_group_members_input){
    return (conductor)=>
    conductor.call("group","remove_members", remove_group_members_input);
}
function updateGroupName(update_group_name_input){
    return (conductor) => 
    conductor.call("group","update_group_name", update_group_name_input); 
}
function getMyGroupsList(){
    return (conductor) => 
    conductor.call("group","get_all_my_groups",); 
}
function signalHandler(signal, counter) {

    counter.counter++;
    return (username) =>{

        console.log(`we have a new signal incoming ${username}`);
        console.log(signal.data.payload)
    }
};


export default (orchestrator, config, installation) => {

    orchestrator.registerScenario ("create group method test", async(s,t) =>{

        /*const [alice,bobby,charlie] = await s.players([config,config,config]);

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

        let alice_counter = {
            counter:0,
        }       
        let bobby_counter = {
            counter:0,
        }        
        let charlie_counter = {
            counter:0,
        }


        alice.setSignalHandler(
            (signal)=>{
                signalHandler(signal,alice_counter)("alice");
            }
        );

        bobby.setSignalHandler(
            (signal)=>{
                signalHandler(signal,bobby_counter)("bobby");
            }
        );

        charlie.setSignalHandler(
            (signal)=>{
                signalHandler(signal,charlie_counter)("charlie");
            }
        );

        init(alice_conductor); 
        init(bobby_conductor); 
        init(charlie_conductor); 
        await delay(1000);    
    
        let create_group_input = {
            name: "Group_name",
            members: [bobbyPubKey, charliePubKey],

        };

        let group = await createGroup(create_group_input)(alice_conductor);
        await delay(1000);

        //t.equal(actual, expected, msg)
        t.equal(alice_counter.counter, 0, "alice's signal counter remain 0 because she creates the group")
        t.equal(bobby_counter.counter, 1, "bobby's signal counter its = 1 beacuse he was added to the group")
        t.equal(charlie_counter.counter, 1, "charlie's signal counter its = 1 because he was added to the group")

      */      
    });
    orchestrator.registerScenario ("add members method AND remove members method test", async(s,t) =>{

        /*
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

        // COUNTERS: THIS COUNTERS ARE USED TO KEEP TRACK OF THE SIGNALS RECEIVED FOR EACH AGENT 
        let alice_counter = {
            counter:0,
        }       
        let bobby_counter = {
            counter:0,
        }        
        let charlie_counter = {
            counter:0,
        }
        //SIGNAL HANLDERS ASSIGNMENT
        alice.setSignalHandler(
            (signal)=>{
                signalHandler(signal,alice_counter)("alice");
            }
        );
        bobby.setSignalHandler(
            (signal)=>{
                signalHandler(signal,bobby_counter)("bobby");
            }
        );
        charlie.setSignalHandler(
            (signal)=>{
                signalHandler(signal,charlie_counter)("charlie");
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

        let group = await createGroup(create_group_input)(alice_conductor);
        await delay(1000);

        //THIS FUCNTION WAS ADDED FOR MI AS A TEMPORAL HELPER FUCNTION TO GET THE ENTRY HASH AND HEADER HASH FROM ONE GROUP
        let group_hashes = await getGroupHashes(group)(alice_conductor);
        await delay(1000);

        //CHECK HERE IF THE RETURNED VALUE FROM CREATE_GORUP HAS THE EXPECTED VALUES (SOME FIELDS CANT BE VALIDATE AS TIMESTAMP BECAUSE ITS GENERATED ON THE BACKEND  , BUT WE CAN ADD A RANGE OF TIME AS VALIDATION)
        
        //t.equal(actual, expected, msg)
        t.deepEqual(group.name, create_group_input.name, "the group name fields match with the expected value");
        t.deepEqual(group.creator, alicePubKey, "the group creator fields match with the expected value");
        t.deepEqual(group.members, [bobbyPubKey], "the group members fields match with the expected value");
        t.equal(bobby_counter.counter, 1, "bobby's signal counter its = 1 beacuse he was added to the group")
        t.equal(charlie_counter.counter, 0, "charlie's signal counter its = 0 because he wasn't added to the group")

        //2-ADD A NEW MEMBER TO THIS GROUP
        let add_group_members_input = {
            members: [charliePubKey],
            group_id: group_hashes.entry_hash,
            group_revision_id: group_hashes.header_hash,
        }

        await AddGroupMebers(add_group_members_input)(alice_conductor);
        await delay(1000);

        //3-GET THE UPDATED ENTRY VERSION OF THE GROUP (THIS METHOD CAN BE RUNNED FOR ANY AGENT AND SHOULD BE CHANGED OR REMOVED IN THE FUTURE)
        group = await getLatestGroupVertion({group_hash:group_hashes.entry_hash})(bobby_conductor);
        await delay(1000);

        //CHECK HERE IF THE UPDATED VERSION OF THE GROUP HAS THE EXPECTED VALUES
        t.deepEqual(group.name, create_group_input.name, "the group name fields match with the expected value");
        t.deepEqual(group.creator, alicePubKey, "the group creator fields match with the expected value");
        t.deepEqual(group.members, [bobbyPubKey,charliePubKey], "the group members fields match with the expected value");
        t.equal(bobby_counter.counter, 1, "bobby's signal counter its = 1 beacuse he was added to the group")
        t.equal(charlie_counter.counter, 1, "charlie's signal counter its = 1 because he was added to the group")

        //4-REMOVING MEMBERS OF THIS GROUP
        let remove_group_members_input = {
            members: [charliePubKey],
            group_id: group_hashes.entry_hash,
            group_revision_id: group_hashes.header_hash,
        }

        await removeGroupMembers(remove_group_members_input)(alice_conductor);
        await delay(1000);

        //5-GET THE UPDATED ENTRY VERSION OF THE GROUP (THIS METHOD CAN BE RUNNED FOR ANY AGENT AND SHOULD BE CHANGED OR REMOVED IN THE FUTURE)
        group = await getLatestGroupVertion({group_hash:group_hashes.entry_hash})(bobby_conductor);
        await delay(1000);

        //CHECK HERE IF THE UPDATED VERSION OF THE GROUP HAS THE EXPECTED VALUES
        t.deepEqual(group.name, create_group_input.name, "the group name fields match with the expected value");
        t.deepEqual(group.creator, alicePubKey, "the group creator fields match with the expected value");
        t.deepEqual(group.members, [bobbyPubKey], "the group members fields match with the expected value");

        */
            
    });
    orchestrator.registerScenario ("update group name test", async(s,t) =>{
        
        /*
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

        // COUNTERS: THIS COUNTERS ARE USED TO KEEP TRACK OF THE SIGNALS RECEIVED FOR EACH AGENT 
        let alice_counter = {
            counter:0,
        }       
        let bobby_counter = {
            counter:0,
        }        
        let charlie_counter = {
            counter:0,
        }
        //SIGNAL HANLDERS ASSIGNMENT
        alice.setSignalHandler(
            (signal)=>{
                signalHandler(signal,alice_counter)("alice");
            }
        );
        bobby.setSignalHandler(
            (signal)=>{
                signalHandler(signal,bobby_counter)("bobby");
            }
        );
        charlie.setSignalHandler(
            (signal)=>{
                signalHandler(signal,charlie_counter)("charlie");
            }
        );
        
        init(alice_conductor); 
        init(bobby_conductor); 
        init(charlie_conductor);
        await delay(1000);
        
        
        // 1- CREATE ONE GROUP WITH A SET OF MEMBERS 
        let create_group_input = {
            name: "Group_name",
            members: [bobbyPubKey,charliePubKey],
        };

        let group = await createGroup(create_group_input)(alice_conductor);
        await delay(1000);

        let group_hashes = await getGroupHashes(group)(alice_conductor);
        await delay(1000);

        let update_group_name_input = {
            name: "Group_new_Name",
            group_id: group_hashes.entry_hash,
            group_revision_id: group_hashes.header_hash,
        }
        //2-UPDATE THE GROUP NAME 
        await updateGroupName(update_group_name_input)(alice_conductor);
        await delay(1000);

        //3-GET THE UPDATED ENTRY VERSION OF THE GROUP (THIS METHOD CAN BE RUNNED FOR ANY AGENT AND SHOULD BE CHANGED OR REMOVED IN THE FUTURE)
        group = await getLatestGroupVertion({group_hash:group_hashes.entry_hash})(bobby_conductor);
        await delay(1000);

        //CHECK HERE IF THE UPDATED VERSION OF THE GROUP HAS THE EXPECTED VALUES
        t.deepEqual(group.name, update_group_name_input.name, "the group name fields match with the expected value");
        t.deepEqual(group.creator, alicePubKey, "the group creator fields match with the expected value");
        t.deepEqual(group.members, [bobbyPubKey,charliePubKey], "the group members fields match with the expected value");
        t.equal(bobby_counter.counter, 1, "bobby's signal counter its = 1 beacuse he was added to the group")
        t.equal(charlie_counter.counter, 1, "charlie's signal counter its = 1 because he was added to the group")

        */  
    });
    orchestrator.registerScenario ("get all my group method test", async(s,t) =>{

        
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

        let alice_counter = {
            counter:0,
        }       
        let bobby_counter = {
            counter:0,
        }        
        let charlie_counter = {
            counter:0,
        }


        alice.setSignalHandler(
            (signal)=>{
                signalHandler(signal,alice_counter)("alice");
            }
        );

        bobby.setSignalHandler(
            (signal)=>{
                signalHandler(signal,bobby_counter)("bobby");
            }
        );

        charlie.setSignalHandler(
            (signal)=>{
                signalHandler(signal,charlie_counter)("charlie");
            }
        );

        init(alice_conductor); 
        init(bobby_conductor); 
        init(charlie_conductor); 
        await delay(1000);    
    
        let create_group_input = {
            name: "Group_name",
            members: [bobbyPubKey, charliePubKey],

        };

        let group = await createGroup(create_group_input)(alice_conductor);
        await delay(1000);

        //THIS FUCNTION WAS ADDED FOR MI AS A TEMPORAL HELPER FUCNTION TO GET THE ENTRY HASH AND HEADER HASH FROM ONE GROUP
        let group_hashes = await getGroupHashes(group)(alice_conductor);
        await delay(1000);

        let alice_groups_list = await getMyGroupsList()(alice_conductor);
        let bobby_groups_list = await getMyGroupsList()(bobby_conductor);
        let charlie_groups_list = await getMyGroupsList()(charlie_conductor);

        //HERE WE CHECK IF THE GROUP LISTS  HAS THE EXPECTED VALUES
        t.deepEqual(alice_groups_list,[], "this list reamins empty and we  probably change this behavior");
        t.deepEqual(bobby_groups_list,[group], "bobby and charlie was added to the group so his group list contain the group on it");
        t.deepEqual(charlie_groups_list,[group], "bobby and charlie was added to the group so his group list contain the group on it");

        let remove_group_members_input = {
            members: [bobbyPubKey],
            group_id: group_hashes.entry_hash,
            group_revision_id: group_hashes.header_hash,
        }

        //REMOVING BOBBY OF THE GROUP
        await removeGroupMembers(remove_group_members_input)(alice_conductor);
        await delay(1000);


        alice_groups_list = await getMyGroupsList()(alice_conductor);
        bobby_groups_list = await getMyGroupsList()(bobby_conductor);
        charlie_groups_list = await getMyGroupsList()(charlie_conductor);
       
        //HERE WE CHECK IF THE GROUP LISTS  HAS THE EXPECTED VALUES
        t.deepEqual(alice_groups_list,[], "this list reamins empty and we  probably change this behavior");
        t.deepEqual(bobby_groups_list,[], "here bobby groups list its empty because we removed hem from the group");
        t.deepEqual(charlie_groups_list,[group], "charlie reamin in the group, his group list remains the same");

        
        //ADDING BOBBY TO THE GROUP AGAIN
        let add_group_members_input = {
            members: [bobbyPubKey],
            group_id: group_hashes.entry_hash,
            group_revision_id: group_hashes.header_hash,
        }

        await AddGroupMebers(add_group_members_input)(alice_conductor);
        await delay(1000);


        alice_groups_list = await getMyGroupsList()(alice_conductor);
        bobby_groups_list = await getMyGroupsList()(bobby_conductor);
        charlie_groups_list = await getMyGroupsList()(charlie_conductor);

        await delay(2000);


        //HERE WE CHECK IF THE GROUP LISTS  HAS THE EXPECTED VALUES
        t.deepEqual(alice_groups_list,[], "this list reamins empty and we  probably change this behavior");
        //t.deepEqual(bobby_groups_list,[group], "bobby and charlie was added to the group so his group list contain the group on it");
        t.deepEqual(charlie_groups_list,[group], "bobby and charlie was added to the group so his group list contain the group on it");


        console.log("output");
        console.log(bobby_groups_list);

        
     
    });
}