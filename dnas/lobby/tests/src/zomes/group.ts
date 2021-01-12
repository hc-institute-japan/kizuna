

function signalHandler(signal) {

    console.log("we have a new signal incoming");
    console.log(signal.data.payload)

};


export default (orchestrator, config, installation) => {


    orchestrator.registerScenario ("test scenario", async(s,t) =>{

        const [alice,bobby,charlie] = await s.players([config,config,config]);

        const [[alice_happ]] = await alice.installAgentsHapps(installation);

        alice.setSignalHandler(
            (signal)=>{
                signalHandler(signal);
            }
        );

        const alicePubKey = alice_happ.agent;


        let create_group = await alice_happ.cells[0].call("group","create_group", {

            name: "Group Name",
            members: [alicePubKey, alicePubKey]
    
        });
        
        let group_members = await alice_happ.cells[0].call("group","get_group_members",create_group);


        console.log("output");
        
        console.log(create_group);

        console.log("group_members");

        console.log(group_members);
        
        console.log("end_output");

    })

}