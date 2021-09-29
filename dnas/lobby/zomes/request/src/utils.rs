use hdk::prelude::*;

pub fn call_response_handler(call_response: ZomeCallResponse) -> ExternResult<ExternIO> {
    match call_response {
        ZomeCallResponse::Ok(extern_io) => {
            return Ok(extern_io);
        }
        ZomeCallResponse::Unauthorized(_, _, function_name, _) => {
            return Err(WasmError::Guest(
                String::from("Unauthorized Call to : ") + function_name.as_ref(),
            ));
        }
        ZomeCallResponse::NetworkError(error) => {
            return Err(WasmError::Guest(
                String::from("Network Error : ") + error.as_ref(),
            ));
        }
        ZomeCallResponse::CountersigningSession(error) => {
            return Err(WasmError::Guest(
                String::from("countersigning error : ") + error.as_ref(),
            ));
        }
    }
}
