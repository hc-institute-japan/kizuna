
export default (orchestrator, config, installation) => {


    orchestrator.registerScenario ("test scenario", async(s,t) =>{

        const [alice,bobby,charlie] = await s.players([config,config,config]);

        const [[alice_happ]] = await alice.installAgentsHapps(installation);

        

        const alicePubKey = alice_happ.agent;


        let create_group = await alice_happ.cells[0].call("group","create_group", {

            name: "Group Name",
            members: [alicePubKey, alicePubKey]
    
        });
        

        console.log("output");
        
        console.log(create_group);

        console.log("end_output");

    })

}