import { ThunkAction } from "../../types";

const rejectCall = (): ThunkAction => async () => {};

export default rejectCall;
