


const createPreference = (typingIndicator, readReceipt) => ({
    typing_indicator: typingIndicator,
    read_receipt: readReceipt
})

const call = async (conductor, player, zome, zomeFunction, payload: any = null) =>
    await conductor.call(player, zome, zomeFunction, payload)


const preference = (orchestrator, config) => {
    orchestrator.registerScenario("Get and set global preference", async (s, t) => {
        const { conductor } = await s.players({ conductor: config })
        await conductor.spawn()
        // const [alice_dna, alice_pubkey] = conductor.cellId('alice');
        let preference = null

        /**
         * Both typing and receipt are set to true by default
         */

        preference = await call(conductor, 'alice', 'preference', 'get_preference')
        t.deepEqual(preference, createPreference(true, true))
        await call(conductor, 'alice', 'preference', 'set_preference', { typing_indicator: false, read_receipt: false })

        /**
         * Set both typing and receipt to false
         */
        preference = await call(conductor, 'alice', 'preference', 'get_preference')

        t.deepEqual(preference, createPreference(false, false));


        /** 
         * Set both typing to false and receipt to true
         */
        await call(conductor, 'alice', 'preference', 'set_preference', { typing_indicator: false, read_receipt: true })

        preference = await call(conductor, 'alice', 'preference', 'get_preference')

        t.deepEqual(preference, createPreference(false, true));

        /** 
         * Set both typing to true and receipt to false
         */

        await call(conductor, 'alice', 'preference', 'set_preference', { typing_indicator: true, read_receipt: false })

        preference = await call(conductor, 'alice', 'preference', 'get_preference')

        t.deepEqual(preference, createPreference(true, false));

        /** 
         * Set typing to false 
         */

        await call(conductor, 'alice', 'preference', 'set_preference', { typing_indicator: false })

        preference = await call(conductor, 'alice', 'preference', 'get_preference')

        t.deepEqual(preference, createPreference(false, false));

        /** 
         * Set receipt to true
         */

        await call(conductor, 'alice', 'preference', 'set_preference', { read_receipt: true })

        preference = await call(conductor, 'alice', 'preference', 'get_preference')

        t.deepEqual(preference, createPreference(false, true));

    });


    orchestrator.registerScenario("Get and set per agent preference", async (s, t) => {
        const { conductor } = await s.players({ conductor: config })
        await conductor.spawn()
        const [alice_dna, alice_pubkey] = conductor.cellId('alice');
        const [bob_dna, bob_pubkey] = conductor.cellId('bobby');
        const [charlie_dna, charlie_pubkey] = conductor.cellId('charlie');
        const [diego_dna, diego_pubkey] = conductor.cellId('diego');
        const [ethan_dna, ethan_pubkey] = conductor.cellId('ethan');

        let preference = null

        await call(conductor, 'alice', 'preference', 'set_per_agent_preference', { typing_indicator: [bob_pubkey] })

        preference = await call(conductor, 'alice', 'preference', 'get_per_agent_preference')

        t.deepEqual(preference, { typing_indicator: [bob_pubkey], read_receipt: [] })

        await call(conductor, 'alice', 'preference', 'set_per_agent_preference', { typing_indicator: [charlie_pubkey, diego_pubkey], read_receipt: [diego_pubkey] })

        preference = await call(conductor, 'alice', 'preference', 'get_per_agent_preference')

        t.deepEqual(preference, { typing_indicator: [bob_pubkey, charlie_pubkey, diego_pubkey], read_receipt: [diego_pubkey] })

        await call(conductor, 'alice', 'preference', 'set_per_agent_preference', { read_receipt: [ethan_pubkey] })

        preference = await call(conductor, 'alice', 'preference', 'get_per_agent_preference')

        t.deepEqual(preference, { typing_indicator: [bob_pubkey, charlie_pubkey, diego_pubkey], read_receipt: [diego_pubkey, ethan_pubkey] })

        await call(conductor, 'alice', 'preference', 'set_per_agent_preference', {})

        preference = await call(conductor, 'alice', 'preference', 'get_per_agent_preference')

        t.deepEqual(preference, { typing_indicator: [bob_pubkey, charlie_pubkey, diego_pubkey], read_receipt: [diego_pubkey, ethan_pubkey] })

    });

    orchestrator.registerScenario("Get and set per group preference", async (s, t) => {
        const { conductor } = await s.players({ conductor: config })
        await conductor.spawn()

        let preference = null

        await call(conductor, 'alice', 'preference', 'set_per_group_preference', { typing_indicator: ["test_string"] })

        preference = await call(conductor, 'alice', 'preference', 'get_per_group_preference')

        t.deepEqual(preference, { typing_indicator: ["test_string"], read_receipt: [] })

        await call(conductor, 'alice', 'preference', 'set_per_group_preference', { typing_indicator: ["test_string_1", "test_string_2"], read_receipt: ["test_string_2"] })

        preference = await call(conductor, 'alice', 'preference', 'get_per_group_preference')

        t.deepEqual(preference, { typing_indicator: ["test_string", "test_string_1", "test_string_2"], read_receipt: ["test_string_2"] })

        await call(conductor, 'alice', 'preference', 'set_per_group_preference', { read_receipt: ["test_string_3"] })

        preference = await call(conductor, 'alice', 'preference', 'get_per_group_preference')

        t.deepEqual(preference, { typing_indicator: ["test_string", "test_string_1", "test_string_2"], read_receipt: ["test_string_2", "test_string_3"] })

        await call(conductor, 'alice', 'preference', 'set_per_group_preference', {})

        preference = await call(conductor, 'alice', 'preference', 'get_per_group_preference')

        t.deepEqual(preference, { typing_indicator: ["test_string", "test_string_1", "test_string_2"], read_receipt: ["test_string_2", "test_string_3"] })

    });
}

export default preference



