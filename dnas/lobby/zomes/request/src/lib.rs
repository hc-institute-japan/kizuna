#![allow(unused_imports)]
#![allow(dead_code)]

use entries::{members, test, HashWrapper, PayloadWrapper};
use test::{Payload, Test, TestInfo};

mod entries;
// pub mod request;

use hdk3::prelude::call_remote;
use hdk3::prelude::AgentInfo;
use hdk3::prelude::Path;

use derive_more::{From, Into};
use hdk3::prelude::zome;
use hdk3::prelude::CapSecret;
use hdk3::prelude::*;

use link::Link;

// To-do
// 1. request_to_chat // ok
// 2. accept_request // ok
// 3. fetch_requests // ok
// 4. delete_requests // ok
// 5. receive // incomplete
