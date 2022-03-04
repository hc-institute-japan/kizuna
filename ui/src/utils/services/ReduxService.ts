import { useDispatch } from "react-redux";
import { ReduxDispatch } from "../../redux/types";

export const useAppDispatch = () => useDispatch<ReduxDispatch>();

const ReduxService = {
  useAppDispatch,
};

export default ReduxService;
