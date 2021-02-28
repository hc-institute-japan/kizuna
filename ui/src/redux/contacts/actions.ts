import { AgentPubKey } from "@holochain/conductor-api";
import { FUNCTIONS, ZOMES } from "../../connection/types";
import { Profile } from "../../redux/profile/types";
import { ThunkAction } from "../types";
import { SET_CONTACTS } from "./types";

export const setContacts = (contacts: {
  [key: string]: Profile;
}): ThunkAction => (dispatch) =>
  dispatch({
    type: SET_CONTACTS,
    contacts,
  });

export const fetchMyContacts = (): ThunkAction => async (
  dispatch,
  _getState,
  { callZome }
) => {
  const ids = await callZome({
    zomeName: ZOMES.CONTACTS,
    fnName: FUNCTIONS[ZOMES.CONTACTS].LIST_ADDED,
  });

  if (ids?.type !== "error") {
    let contacts: { [key: string]: Profile } = {};
    await Promise.all(
      ids.map(async (id: AgentPubKey) => {
        const usernameOutput = await callZome({
          zomeName: ZOMES.USERNAME,
          fnName: FUNCTIONS[ZOMES.USERNAME].GET_USERNAME,
          payload: id,
        });

        if (usernameOutput?.type !== "error")
          contacts[JSON.stringify(id)] = {
            id,
            username: usernameOutput.username,
          };
      })
    );

    dispatch({
      type: SET_CONTACTS,
      contacts,
    });

    return contacts;
  }
  return null;
};

export const fetchAllUsernames = (): ThunkAction => async (
  _dispatch,
  _getState,
  { callZome }
) => {
  const usernames = await callZome({
    zomeName: ZOMES.USERNAME,
    fnName: FUNCTIONS[ZOMES.USERNAME].GET_ALL_USERNAMES,
  });

  if (usernames?.type !== "error") {
    const filteredProfiles = await Promise.all(
      usernames.map(async ({ username, agent_id }: any) => ({
        id: agent_id,
        username,
        isAdded: await callZome({
          zomeName: ZOMES.CONTACTS,
          fnName: FUNCTIONS[ZOMES.CONTACTS].IN_CONTACTS,
          payload: agent_id,
        }),
      }))
    );
    return filteredProfiles.filter((profile: any) => !profile.isAdded);
  }
  return null;
};

export const addContact = (profile: Profile): ThunkAction => async (
  dispatch,
  getState,
  { callZome }
) => {
  const contacts = getState().contacts.contacts;

  const res = await callZome({
    zomeName: ZOMES.CONTACTS,
    fnName: FUNCTIONS[ZOMES.CONTACTS].ADD_CONTACTS,
    payload: [profile.id],
  });

  if (res?.type !== "error") {
    contacts[JSON.stringify(profile.id)] = profile;
    dispatch({ type: SET_CONTACTS, contacts });
    return true;
  }
  return false;
};
