    use hdk3::prelude::*;

    mod entries;
    mod utils;
    mod signals; 

    use entries::group;

    use entries::group::{
        //TYPES USED IN CREATE GROUP: 
        Group,
        CreateGroupInput,
        CreateGroupOutput,
        //TYPES USED IN ADD MEMEBERS AND REMOVE MEMBERS: 
        UpdateMembersIO,
        //TYPES USED IN UPDATE GROUP NAME
        UpdateGroupNameIO,
        //TYPES USED IN GET ALL MY GROUPS
        MyGroupListWrapper,
        //TYPES USED IN UTILS FUCNTIONS
        EntryHashWrapper,
        HashesOutput,

    };


    entry_defs![
        Group::entry_def(),
        Path::entry_def()
        ];

    // this is only exposed outside of WASM for testing purposes.
    #[hdk_extern]
    pub fn init(_: ())-> ExternResult<InitCallbackResult> {

        let mut fuctions = HashSet::new();

        let tag: String = "create_group_cap_grant".into(); 
        let access: CapAccess = CapAccess::Unrestricted;
        
        let zome_name:ZomeName = zome_info()?.zome_name;
        let function_name:FunctionName = FunctionName("recv_remote_signal".into());
        
        fuctions.insert((zome_name, function_name));

        let cap_grant_entry:CapGrantEntry = CapGrantEntry::new(
            tag, // A string by which to later query for saved grants.
            access, // Unrestricted access means any external agent can call the extern
            fuctions,
        );

        create_cap_grant(cap_grant_entry)?;

        Ok(InitCallbackResult::Pass)
    }
    #[hdk_extern]
    fn recv_remote_signal(signal: SerializedBytes) -> ExternResult<()> {
        // currently only emitting the received signal
        // TODO: actually work with the received signal
        emit_signal(&signal)?;
        Ok(())
    }

    //VALIDATION RULES
    // this is only exposed outside of WASM for testing purposes.
    #[hdk_extern]
    fn validate_create_group(data: ValidateData)-> ExternResult<ValidateCallbackResult> {
        //data = { element = { signed_header, entry } , validation_package <Option> }
        // 1- create is valid if creator pubkey matches the signature
        // 2- create is valid if group name is not more than 50 characters ; create is valid if group name is at least one character long
        // 3- cannot be empty and must at least include 2 pubkeys
        // 4- creator AgentPubKey is not included here
        
        let agent_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey; 
        let entry_author_pub_key: AgentPubKey = data.element.header().author().clone();
        let entry: Option<Group> = data.element.entry().to_app_option()?.clone(); 

        if let Some(group) = entry {

            let group_name_length:usize = group.name.clone().len();
            let group_members_length:usize = group.get_group_members().len();

            if (agent_pub_key == entry_author_pub_key) &&  //validation(1)  
            (1 <= group_name_length && group_name_length <= 50) && //validation(2) 
            (2 <= group_members_length)&& //validation(3)
            (group.get_group_members().contains(&agent_pub_key))//validation(4)
            {
                return Ok(ValidateCallbackResult::Valid);
            }    
        }    

        Ok(ValidateCallbackResult::UnresolvedDependencies(vec![]))
    }
    #[hdk_extern]
    fn validate_update_group(data: ValidateData) -> ExternResult<ValidateCallbackResult> {

        //data = { element = { signed_header, entry } , validation_package <Option> }
       
        // 1 update is only valid if the old_entry’s header is Create  
        // 2 update is valid if author of Create Header matches the author of the Update Header -> so that only admin can update
        // 3 update is only valid if old_group_name != new_group_name | old_members != new_members
        // 4 update is valid only if members > 2 && new name its not empty

        let update_header: Header = data.element.header().clone();
        let updated_group_entry: Group = group::handlers::get_group_entry_from_element(data.element.clone())?;

        if let Some(prev_header_hash) = data.element.header().prev_header().clone() {

            if let Some(prev_element) = get(prev_header_hash.to_owned(), GetOptions::latest())? {

                let prev_header: Header = prev_element.header().clone();

                match prev_header.header_type() {
                    
                    // validation (1)
                    HeaderType::Create => {
                        let old_group_entry: Group = group::handlers::get_group_entry_from_element(prev_element.clone())?;

                        // validation (2)
                        if update_header.author().to_owned().eq(prev_header.author()) && 
                        
                        // validation (3)
                        (!updated_group_entry.name.eq(&old_group_entry.name.clone()) || 
                         !updated_group_entry.get_group_members().eq(&old_group_entry.get_group_members())) &&

                         // validation (4)
                        (!updated_group_entry.name.eq(&String::from("")) && 
                         !updated_group_entry.get_group_members().len() >= 2 ) {

                            return Ok(ValidateCallbackResult::Valid);

                        }//end of the if statement
                    },
                    _=>(),
                }
            }
        }

        Ok(ValidateCallbackResult::UnresolvedDependencies(vec![]))
    }

    //GROUP ZOME FUNCTIONS 
    #[hdk_extern]
    fn create_group(create_group_input: CreateGroupInput) -> ExternResult<CreateGroupOutput> {
        group::handlers::create_group(create_group_input)
    }
    #[hdk_extern]
    fn add_members(add_members_input: UpdateMembersIO)->HdkResult<UpdateMembersIO> {
        group::handlers::add_members(add_members_input)
    }
    #[hdk_extern]
    fn remove_members(remove_members_input: UpdateMembersIO)-> ExternResult<UpdateMembersIO> {
        group::handlers::remove_members(remove_members_input)
    }
    #[hdk_extern]
    fn update_group_name(update_group_name_input: UpdateGroupNameIO)-> ExternResult<UpdateGroupNameIO> {
        group::handlers::update_group_name(update_group_name_input)
    }
    #[hdk_extern]
    fn get_all_my_groups(_:())->HdkResult<MyGroupListWrapper>{
        group::handlers::get_all_my_groups()
    }



    //UTILS FROM GROUP
    #[hdk_extern]
    fn get_group_entry_and_header_hash(input: Group)->ExternResult<HashesOutput>{
        group::handlers::get_group_entry_and_header_hash(input)
    }
    #[hdk_extern]
    fn get_group_latest_version(group_id: EntryHashWrapper)->ExternResult<Group>{
        group::handlers::get_group_latest_version(group_id.group_hash)
    }

