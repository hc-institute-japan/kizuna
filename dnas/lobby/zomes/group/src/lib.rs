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
        //TYPES USED IN VALIDATION FUNCTIONS
        ValidationInput,

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
    fn run_validation(validation_input: ValidationInput) -> ExternResult<ValidateCallbackResult> {

        let validation_type: String = validation_input.validation_type;
        let group_revision_id: HeaderHash = validation_input.group_revision_id;

        if let Some(element) = get( group_revision_id, GetOptions::latest())? {
            // if there is an element related to the received group revision id we sould check what kind of validation we want to run for him 

            let data: ValidateData = ValidateData {
                element: element,
                validation_package: None, // this can changed in the future but for now our validations are not using anythin from this field
            };
            match validation_type.as_str(){
        
                "create" => return  validate_create_group(data),
                "update" => {return validate_update_group(data)},
                _=>(),
            }
        }

        return Ok(ValidateCallbackResult::Valid);
    }
    fn validate_create_group(data: ValidateData)-> ExternResult<ValidateCallbackResult> {
        //data = { element = { signed_header, entry } , validation_package <Option> }
        // 1- create is valid if creator pubkey matches the signature
        // 2- create is valid if group name is not more than 50 characters ; create is valid if group name is at least one character long
        // 3- group members cannot be empty and must at least include 2 pubkeys
        // 4- creator AgentPubKey is not included int he group members 
        
        let entry_author_pub_key: AgentPubKey = data.element.header().author().clone();
        let entry: Option<Group> = data.element.entry().to_app_option()?.clone(); 

        if let Some(group) = entry {

            let group_creator_pub_key: AgentPubKey = group.get_group_creator(); 
            let group_name_length:usize = group.name.clone().len();
            let group_members_length:usize = group.get_group_members().len();

            if !group_creator_pub_key.eq(&entry_author_pub_key) {
                return Ok(ValidateCallbackResult::Invalid("the group creator pubkey dosent match with the signature".into())); //validation(1)
            }     
            
            if  group_name_length < 1 || group_name_length > 50 {
                return Ok(ValidateCallbackResult::Invalid("the group name must at least contain 1 character and maximun 50 characters".into())); //validation(2)
            }

            if group_members_length < 2 {
                return Ok(ValidateCallbackResult::Invalid("groups cannot be created with less than 2 members apart of you".into())); //validation(3)
            }
        
            if group.get_group_members().contains(&group_creator_pub_key.clone()) {
                return Ok(ValidateCallbackResult::Invalid("creator AgentPubKey cannot be included in the group members list".into())); //validation(4)
            }

 
        }    

        Ok(ValidateCallbackResult::Valid)
    }
    fn validate_update_group(data: ValidateData) -> ExternResult<ValidateCallbackResult> {

        //data = { element = { signed_header, entry } , validation_package <Option> }
       
        // 1 update is only valid if the old_entry’s header is Create  
        // 2 update is valid if author of Create Header matches the author of the Update Header -> so that only admin can update
        // 3 update is only valid if old_group_name != new_group_name | old_members != new_members
        // 4 update is valid only if members > 2 && new name its not empty or more than 50 characters

        let update_header: Header = data.element.header().clone();
        let updated_group_entry: Group = group::handlers::get_group_entry_from_element(data.element.clone())?;

        if let Some(prev_header_hash) = data.element.header().prev_header().clone() {

            if let Some(prev_element) = get(prev_header_hash.to_owned(), GetOptions::content())? {

                let prev_header: Header = prev_element.header().clone();

                match prev_header.header_type() {
                    
                    HeaderType::Create => {

                        let old_group_entry: Group = group::handlers::get_group_entry_from_element(prev_element.clone())?;
                        let updated_group_name_length: usize = updated_group_entry.name.clone().len();
                        let updated_group_members_length: usize = updated_group_entry.get_group_members().len();

                        if !update_header.author().to_owned().eq(prev_header.author()){
                            return Ok(ValidateCallbackResult::Invalid("cannot update a group entry if you are not the group creator (admin)".into())); //validation(2)
                        }

                        if updated_group_entry.name.eq(&old_group_entry.name.clone()) && updated_group_entry.get_group_members().eq(&old_group_entry.get_group_members()) {
                            return Ok(ValidateCallbackResult::Invalid("nothing have been updated since the last commited group version".into())); //validation(3)
                        }

                        if  updated_group_name_length < 1 || updated_group_name_length > 50 {
                            return Ok(ValidateCallbackResult::Invalid("the group name must at least contain 1 character and maximun 50 characters".into())); //validation(4.1)
                        }

                        if updated_group_members_length < 2 {
                            return Ok(ValidateCallbackResult::Invalid("groups cannot be created with less than 2 members apart of you".into())); //validation(4.2)
                        }

                    },
                    _=> {
                        return Ok(ValidateCallbackResult::Invalid("you are trying to update an entry using a header whos type its not Create".into())); // validation (1)
                    }, 
                    
                }
            }
        }

        Ok(ValidateCallbackResult::Valid)
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



