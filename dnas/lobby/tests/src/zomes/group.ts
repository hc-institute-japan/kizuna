import { validateLocaleAndSetLanguage } from "typescript";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function signalHandler(signal, agent) {

    console.log(`we have a new signal incoming ${agent}`);
    console.log(signal.data.payload)

};


export default (orchestrator, config, installation) => {


    orchestrator.registerScenario ("test scenario", async(s,t) =>{

        const [alice,bobby,charlie] = await s.players([config,config,config]);

        const [[alice_happ]] = await alice.installAgentsHapps(installation);
        const [[bobby_happ]] = await bobby.installAgentsHapps(installation);
        const [[charlie_happ]] = await charlie.installAgentsHapps(installation);

        await s.shareAllNodes([alice, bobby, charlie])


        alice.setSignalHandler(
            (signal)=>{
                signalHandler(signal,"alice");
            }
        );

        bobby.setSignalHandler(
            (signal)=>{
                signalHandler(signal,"bobby ");
            }
        );

        charlie.setSignalHandler(
            (signal)=>{
                signalHandler(signal,"charlie");
            }
        );

    
        const alicePubKey = alice_happ.agent;
        const bobbyPubKey = bobby_happ.agent;
        const charliePubKey = charlie_happ.agent;


        let group = {
            
            name: "Group Name",
            members: [charliePubKey,bobbyPubKey]
            
        };
        
        let create_group = await alice_happ.cells[0].call("group","create_group", group);
        await delay(1000);


        console.log("output");

        console.log(create_group);
        
        console.log("end_output");
        

    })

}