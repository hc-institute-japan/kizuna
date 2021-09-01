import { ThunkAction } from "../../types";

const logout =
  (): ThunkAction =>
  async (_dispatch, _getState, { client }) => {
    const c = (client as any).connection;
    await c.signOut();
    await c.signIn();
  };

export default logout;
