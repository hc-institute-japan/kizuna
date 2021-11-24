use hdk::prelude::*;

#[hdk_extern]
fn test_function(_: ()) -> ExternResult<String> {
    Ok(String::from("Testing cloning of DNA: SUCCESS!"))
}
