# migration kizuna project to hdk 0.0.100

## Holochain changes:
    init method its called for holochain 
## Test changes:
    for QUIC network we should pioint to  this bootstrap_service: "https://bootstrap-staging.holo.host/"



## Zome: Preference:
    - the minor changes to bumping to hdk 0.0.100 was finished (zome already compiled )    
    - one helper fucntion was added `fn filter_for(query_target:QueryTarget , include_entries: bool)->ExternResult<QueryFilter>`
    - the fetch method was modified to add more readeability and easy compresion (check the change if you like we added) maybe we can wrap the match part in fetch methods
    - the test file was modified to handle a bug on tryorama, all tested are passing 

## Zome: P2PMessage:

    - minimal changes in the source code to fixed the hdk bumping version
    -init method bumped (zome already compiled) (no tested)
    - send_message bumped (no tested)
        - still need to check if the receiver its blocked 
        - we want to change the returned value on this function ?? 
    -receive_message bumped (no tested)    
    -there are some async methods headers declarations but not the definition should i removed tath ?
    -theres a method call blocked agent this is a copy from the contacts zome ?  should be removed ? 
    -there are some tested failing 

 ## Zome Contacts: 
    - minimal changes in the source code to fixed the hdk bumping version   
    - all tests are passing
    
## Zome: Aggregator:
    - minimal changes in the source code to fixed the hdk bumping version   
    -zome compiled no tested yet

## Zome: Username:
    - minimal changes in the source code to fixed the hdk bumping version   
    - test files can be cleaned theres a lot of commented code 
    - all tests are passing
    

## Zome: Request:
    - minimal changes in the source code to fixed the hdk bumping version   
    -testes are failingg have an error i have to checked 

## Zome: Group:
    - group methods (crud) bumped and compiled.
    - group methos tested and passing the tests.
    - all methods are separated in diferent files (helpers should be split it as well ?).
    - remote_signal has change in the new hdk version (small chasges added to fixed).




## Testing changes:
    - init method its called at the beging of the app     
    - the signal handlers are required if there are not specified the test will fail 


        


