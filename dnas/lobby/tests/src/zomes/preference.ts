const createPreference = (typingIndicator, readReceipt) => ({
    typing_indicator: typingIndicator,
    read_receipt: readReceipt
})

const call = async (conductor, zome, zomeFunction, payload: any = {}) =>
    await conductor.call(zome, zomeFunction, payload)


const preference = (orchestrator, config, installable) => {
    orchestrator.registerScenario("Get and set global preference", async (s, t) => {
        const [alice] = await s.players([config]);
        const [alice_lobby_happ] = await alice.installAgentsHapps(installable);
        const alice_conductor = alice_lobby_happ[0].cells[0];
    
        // const [alice_dna, alice_pubkey] = alice_conductor.cellId('alice');
        let preference = null

        /**
         * Both typing and receipt are set to true by default
         */

        preference = await call(alice_conductor, 'preference', 'get_preference')
        t.deepEqual(preference, createPreference(true, true))
        await call(alice_conductor, 'preference', 'set_preference', { typing_indicator: false, read_receipt: false })

        /**
         * Set both typing and receipt to false
         */
        preference = await call(alice_conductor, 'preference', 'get_preference')

        t.deepEqual(preference, createPreference(false, false));


        /** 
         * Set both typing to false and receipt to true
         */
        await call(alice_conductor, 'preference', 'set_preference', { typing_indicator: false, read_receipt: true })

        preference = await call(alice_conductor, 'preference', 'get_preference')

        t.deepEqual(preference, createPreference(false, true));

        /** 
         * Set both typing to true and receipt to false
         */

        await call(alice_conductor, 'preference', 'set_preference', { typing_indicator: true, read_receipt: false })

        preference = await call(alice_conductor, 'preference', 'get_preference')

        t.deepEqual(preference, createPreference(true, false));

        /** 
         * Set typing to false 
         */

        await call(alice_conductor, 'preference', 'set_preference', { typing_indicator: false })

        preference = await call(alice_conductor, 'preference', 'get_preference')

        t.deepEqual(preference, createPreference(false, false));

        /** 
         * Set receipt to true
         */

        await call(alice_conductor, 'preference', 'set_preference', { read_receipt: true })

        preference = await call(alice_conductor, 'alice', 'preference', 'get_preference')

        t.deepEqual(preference, createPreference(false, true));

    });


    orchestrator.registerScenario("Get and set per agent preference", async (s, t) => {
        const [alice, bobby, clark, diego, ethan] = await s.players([config, config, config, config, config]);
        const [alice_lobby_happ] = await alice.installAgentsHapps(installable);
        const [bobby_lobby_happ] = await bobby.installAgentsHapps(installable);
        const [clark_lobby_happ] = await clark.installAgentsHapps(installable);
        const [diego_lobby_happ] = await diego.installAgentsHapps(installable);
        const [ethan_lobby_happ] = await ethan.installAgentsHapps(installable);
        const alice_conductor = alice_lobby_happ[0].cells[0];
        const bobby_conductor = bobby_lobby_happ[0].cells[0];
        const clark_conductor = clark_lobby_happ[0].cells[0];
        const diego_conductor = diego_lobby_happ[0].cells[0];
        const ethan_conductor = ethan_lobby_happ[0].cells[0];

        const [alice_dna, alice_pubkey] = alice_conductor.cellId('alice');
        const [bobby_dna, bobby_pubkey] = bobby_conductor.cellId('bobby');
        const [charlie_dna, clark_pubkey] = clark_conductor.cellId('clark');
        const [diego_dna, diego_pubkey] = diego_conductor.cellId('diego');
        const [ethan_dna, ethan_pubkey] = ethan_conductor.cellId('ethan');

        let preference = null

        await call(alice_conductor, 'preference', 'set_per_agent_preference', { typing_indicator: [bobby_pubkey] })

        preference = await call(alice_conductor, 'preference', 'get_per_agent_preference')

        t.deepEqual(preference, { typing_indicator: [bobby_pubkey], read_receipt: [] })

        await call(alice_conductor, 'preference', 'set_per_agent_preference', { typing_indicator: [clark_pubkey, diego_pubkey], read_receipt: [diego_pubkey] })

        preference = await call(alice_conductor, 'preference', 'get_per_agent_preference')

        t.deepEqual(preference, { typing_indicator: [bobby_pubkey, clark_pubkey, diego_pubkey], read_receipt: [diego_pubkey] })

        await call(alice_conductor, 'preference', 'set_per_agent_preference', { read_receipt: [ethan_pubkey] })

        preference = await call(alice_conductor, 'preference', 'get_per_agent_preference')

        t.deepEqual(preference, { typing_indicator: [bobby_pubkey, clark_pubkey, diego_pubkey], read_receipt: [diego_pubkey, ethan_pubkey] })

        await call(alice_conductor, 'preference', 'set_per_agent_preference', {})

        preference = await call(alice_conductor, 'preference', 'get_per_agent_preference')

        t.deepEqual(preference, { typing_indicator: [bobby_pubkey, clark_pubkey, diego_pubkey], read_receipt: [diego_pubkey, ethan_pubkey] })

    });

    orchestrator.registerScenario("Get and set per group preference", async (s, t) => {
        const [alice] = await s.players([config]);
        const [alice_lobby_happ] = await alice.installAgentsHapps(installable);
        const alice_conductor = alice_lobby_happ[0].cells[0];

        let preference = null

        await call(alice_conductor, 'preference', 'set_per_group_preference', { typing_indicator: ["test_string"] })

        preference = await call(alice_conductor, 'alice', 'preference', 'get_per_group_preference')

        t.deepEqual(preference, { typing_indicator: ["test_string"], read_receipt: [] })

        await call(alice_conductor, 'preference', 'set_per_group_preference', { typing_indicator: ["test_string_1", "test_string_2"], read_receipt: ["test_string_2"] })

        preference = await call(alice_conductor, 'preference', 'get_per_group_preference')

        t.deepEqual(preference, { typing_indicator: ["test_string", "test_string_1", "test_string_2"], read_receipt: ["test_string_2"] })

        await call(alice_conductor, 'preference', 'set_per_group_preference', { read_receipt: ["test_string_3"] })

        preference = await call(alice_conductor, 'preference', 'get_per_group_preference')

        t.deepEqual(preference, { typing_indicator: ["test_string", "test_string_1", "test_string_2"], read_receipt: ["test_string_2", "test_string_3"] })

        await call(alice_conductor, 'preference', 'set_per_group_preference', {})

        preference = await call(alice_conductor, 'preference', 'get_per_group_preference')

        t.deepEqual(preference, { typing_indicator: ["test_string", "test_string_1", "test_string_2"], read_receipt: ["test_string_2", "test_string_3"] })

    });
}

export default preference



