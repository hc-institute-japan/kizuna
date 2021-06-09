use hdk::prelude::*;

use super::{
    Claims,
};

pub fn get_cap_claims_handler() -> ExternResult<Claims> {
    let query_result = query(
        QueryFilter::new()
        .entry_type(EntryType::CapClaim)
        .include_entries(true)
    )?;

    let result: Vec<CapClaim> = query_result
        .into_iter()
        .filter_map(|e| 
            match e.header() {
                Header::Create(_create) => Some(e.clone().into_inner().1.into_option().unwrap().as_cap_claim().unwrap().to_owned()),
                // TODO: handle updated and deleted CapClaims when the need arises.
                _ => None,
            })
        .collect();

    Ok(Claims(result))
}