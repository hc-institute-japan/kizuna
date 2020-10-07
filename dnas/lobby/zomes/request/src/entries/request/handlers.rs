#![allow(unused_imports)]
#![allow(dead_code)]

use super::{AgentKey, AgentKeyWrapper, Members, Payload, PayloadWrapper, Request};
use hdk3::prelude::*;
use holochain_zome_types::test_utils::fake_cap_secret;

entry_defs![Payload::entry_def(), Request::entry_def()];

pub(crate) fn send_request(sender: AgentKeyWrapper) -> ExternResult<Payload> {
    let function_name = zome::FunctionName("receive_request".to_owned());
    match call_remote!(
        sender.0.clone(),
        zome_info!()?.zome_name,
        function_name,
        None,
        PayloadWrapper {
            sender: AgentKey::new(sender.0.clone()),
            code: "request_received".to_owned(),
            members: Members::new(vec![agent_info!()?.agent_latest_pubkey, sender.0.clone()])
        }
        .try_into()?
    )? {
        ZomeCallResponse::Ok(output) => Ok(output.into_inner().try_into()?),
        ZomeCallResponse::Unauthorized => Err(HdkError::Wasm(WasmError::Zome(
            "{\"code\": \"000\", \"message\": \"[Unauthorized] Send Request\"}".to_owned(),
        ))),
    }
}

pub(crate) fn accept_request(sender: AgentKeyWrapper) -> ExternResult<Payload> {
    match call_remote!(
        sender.0.clone(),
        zome_info!()?.zome_name,
        zome::FunctionName("receive_request".to_owned()),
        None,
        PayloadWrapper {
            sender: AgentKey::new(sender.0.clone()),
            code: "request_accepted".to_owned(),
            members: Members::new(vec![agent_info!()?.agent_latest_pubkey, sender.0.clone()])
        }
        .try_into()?
    )? {
        ZomeCallResponse::Ok(output) => Ok(output.into_inner().try_into()?),
        ZomeCallResponse::Unauthorized => Err(HdkError::Wasm(WasmError::Zome(
            "{\"code\": \"000\", \"message\": \"[Unauthorized] Accept Request\"}".to_owned(),
        ))),
    }
}

/**
 * Temporary, to get agent pub key
 */
pub(crate) fn get_agent_key(_: ()) -> ExternResult<AgentKey> {
    Ok(AgentKey::new(agent_info!()?.agent_initial_pubkey))
}

#[hdk_extern]
fn receive_request(payload: PayloadWrapper) -> ExternResult<Payload> {
    debug!("receive_request");
    match payload.code.as_str() {
        "request_accepted" => {
            /*
                hdk:call to contacts function
            */

            Ok(Payload {
                sender: payload.sender.agent_key,
                code: "request_accepted".to_owned(),
                members: payload.members,
            })
        }
        "request_received" => {
            /*
                Do emit signal here
            */
            let agent_key = payload.sender.clone();

            /*
               Temporary auto-accept implemetation for testing purposes
            */
            match call_remote!(
                agent_key.agent_key,
                zome_info!()?.zome_name,
                zome::FunctionName("request_accepted".to_owned()),
                None,
                PayloadWrapper {
                    code: "request_accepted".to_owned(),
                    sender: payload.sender.clone(),
                    members: payload.members
                }
                .try_into()?
            )? {
                ZomeCallResponse::Ok(output) => Ok(output.into_inner().try_into()?),
                ZomeCallResponse::Unauthorized => Err(HdkError::Wasm(WasmError::Zome(
                    "{\"code\": \"000\", \"message\": \"[Unauthorized] receive_request\"}"
                        .to_owned(),
                ))),
            }
            // Ok(Payload {
            //     code: "request_received".to_owned(),
            //     sender: payload.sender.agent_key,
            //     members: Members::new(vec![]),
            // })
        }
        _ => Ok(Payload {
            code: "request_denied".to_owned(),
            sender: payload.sender.agent_key,
            members: Members::new(vec![]),
        }),
    }
}

// Some(fake_cap_secret())
