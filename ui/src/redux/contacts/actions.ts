import { AgentPubKey } from "@holochain/conductor-api";
import { FUNCTIONS, ZOMES } from "../../connection/types";
import { Profile } from "../../redux/profile/types";
import { Uint8ArrayToBase64 } from "../../utils/helpers";
import { ThunkAction } from "../types";
import { SET_CONTACTS, SET_BLOCKED } from "./types";

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
          contacts[Uint8ArrayToBase64(id)] = {
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
    contacts[Uint8ArrayToBase64(profile.id)] = profile;
    dispatch({ type: SET_CONTACTS, contacts });
    return true;
  }
  return false;
};

export const removeContact = (profile: Profile): ThunkAction => async (
  dispatch,
  getState,
  { callZome }
) => {
  const contacts = getState().contacts.contacts;

  const res = await callZome({
    zomeName: ZOMES.CONTACTS,
    fnName: FUNCTIONS[ZOMES.CONTACTS].REMOVE_CONTACTS,
    payload: [profile.id],
  });

  if (res?.type !== "error") {
    delete contacts[Uint8ArrayToBase64(profile.id)];
    dispatch({ type: SET_CONTACTS, contacts });
    return true;
  }
  return false;
};

export const blockContact = (profile: Profile): ThunkAction => async (
  dispatch,
  getState,
  { callZome }
) => {
  const blocked = getState().contacts.blocked;

  const res = await callZome({
    zomeName: ZOMES.CONTACTS,
    fnName: FUNCTIONS[ZOMES.CONTACTS].BLOCK_CONTACTS,
    payload: [profile.id],
  });

  if (res?.type !== "error") {
    blocked[Uint8ArrayToBase64(profile.id)] = profile;
    dispatch({ type: SET_BLOCKED, blocked });
    return true;
  }
  return false;
};

export const unblockContact = (profile: Profile): ThunkAction => async (
  dispatch,
  getState,
  { callZome }
) => {
  const blocked = getState().contacts.blocked;

  const res = await callZome({
    zomeName: ZOMES.CONTACTS,
    fnName: FUNCTIONS[ZOMES.CONTACTS].UNBLOCK_CONTACTS,
    payload: [profile.id],
  });

  if (res?.type !== "error") {
    delete blocked[Uint8ArrayToBase64(profile.id)];
    dispatch({ type: SET_CONTACTS, blocked });
    return true;
  }
  return false;
};

export const fetchBlocked = (): ThunkAction => async (
  dispatch,
  _,
  { callZome }
) => {
  const res = await callZome({
    zomeName: ZOMES.CONTACTS,
    fnName: FUNCTIONS[ZOMES.CONTACTS].LIST_BLOCKED,
  });

  if (res?.type !== "error") {
    let blocked: { [key: string]: Profile } = {};
    await Promise.all(
      res.map(async (id: AgentPubKey) => {
        const usernameOutput = await callZome({
          zomeName: ZOMES.USERNAME,
          fnName: FUNCTIONS[ZOMES.USERNAME].GET_USERNAME,
          payload: id,
        });

        if (usernameOutput?.type !== "error")
          blocked[Uint8ArrayToBase64(id)] = {
            id,
            username: usernameOutput.username,
          };
      })
    );

    dispatch({
      type: SET_BLOCKED,
      blocked,
    });

    return blocked;
  }
  return null;
};
