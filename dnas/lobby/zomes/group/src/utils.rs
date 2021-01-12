use std::time::Duration;
use hdk3::prelude::*;

use timestamp::Timestamp;

/// Get a local header from your chain
pub(crate) fn _get_local_header(header_hash: &HeaderHash) -> HdkResult<Option<Header>> {
    // Get the latest chain header
    // Query iterates backwards so index 0 is the latest.
    let header = query(QueryFilter::new())?.0.into_iter().find_map(|el| {
        if el.header_address() == header_hash {
            Some(
                el.into_inner()
                    .0
                    .into_header_and_signature()
                    .0
                    .into_content(),
            )
        } else {
            None
        }
    });
    Ok(header)
}

pub(crate) fn to_timestamp(duration: Duration) -> Timestamp {
    Timestamp(duration.as_secs() as i64, duration.subsec_nanos())
}
