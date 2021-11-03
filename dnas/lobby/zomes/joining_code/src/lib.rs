use hc_joining_code;
use hdk::prelude::*;

entry_defs![Path::entry_def()];

#[hdk_extern]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {
    return hc_joining_code::init_validate_and_create_joining_code();
}

#[hdk_extern]
pub fn genesis_self_check(data: GenesisSelfCheckData) -> ExternResult<ValidateCallbackResult> {
    /*     let holo_agent_key =
    hc_joining_code::holo_agent(&SerializedBytes::from(UnsafeBytes::from(vec![])))?; */
    hc_joining_code::validate_joining_code(
        AgentPubKey::try_from("uhCAkRHEsXSAebzKJtPsLY1XcNePAFIieFBtz2ATanlokxnSC1Kkz").unwrap(),
        data.agent_key,
        data.membrane_proof,
    )
}

#[hdk_extern]
pub fn validate_create_agent(data: ValidateData) -> ExternResult<ValidateCallbackResult> {
    let element = data.element.clone();
    let entry = element.entry();
    let entry = match entry {
        ElementEntry::Present(e) => e,
        _ => {
            return Ok(ValidateCallbackResult::Invalid(
                "validate_create_agent was called without an entry".into(),
            ))
        }
    };
    if let Entry::Agent(_) = entry {
        if !hc_joining_code::skip_proof() {
            match data.element.header().prev_header() {
                Some(header) => match get(header.clone(), GetOptions::default()) {
                    Ok(element_pkg) => match element_pkg {
                        Some(element_pkg) => match element_pkg.signed_header().header() {
                            Header::AgentValidationPkg(pkg) => {
                                return hc_joining_code::validate_joining_code(
                                    AgentPubKey::try_from(
                                        "uhCAkRHEsXSAebzKJtPsLY1XcNePAFIieFBtz2ATanlokxnSC1Kkz",
                                    )
                                    .unwrap(),
                                    pkg.author.clone(),
                                    pkg.membrane_proof.clone(),
                                )
                            }
                            _ => {
                                return Ok(ValidateCallbackResult::Invalid(
                                    "No Agent Validation Pkg found".to_string(),
                                ))
                            }
                        },
                        None => {
                            return Ok(ValidateCallbackResult::UnresolvedDependencies(vec![
                                (header.clone()).into(),
                            ]))
                        }
                    },
                    Err(e) => {
                        debug!("Error on get when validating agent entry: {:?}; treating as unresolved dependency",e);
                        return Ok(ValidateCallbackResult::UnresolvedDependencies(vec![
                            (header.clone()).into(),
                        ]));
                    }
                },
                None => unreachable!("This element will always have a prev_header"),
            }
        }
    }

    unreachable!("validate_create_agent called with an element that wasn't creating an agent")
}
