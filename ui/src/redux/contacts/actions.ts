import { FUNCTIONS, ZOMES } from "../../connection/types";
import { Profile } from "../../redux/profile/types";
import { base64ToUint8Array, Uint8ArrayToBase64 } from "../../utils/helpers";
import { ThunkAction } from "../types";
import { SET_BLOCKED, SET_CONTACTS } from "./types";

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
    const usernameOutputs = await callZome({
      zomeName: ZOMES.USERNAME,
      fnName: FUNCTIONS[ZOMES.USERNAME].GET_USERNAMES,
      payload: ids,
    });
    if (usernameOutputs?.type !== "error") {
      usernameOutputs.forEach((usernameOutput: any) => {
        const base64 = Uint8ArrayToBase64(usernameOutput.agentId);
        contacts[base64] = {
          id: base64,
          username: usernameOutput.username,
        };
      });
    }
    dispatch({
      type: SET_CONTACTS,
      contacts,
    });

    return contacts;
  }
  return null;
};

export const fetchBlocked = (): ThunkAction => async (
  dispatch,
  _,
  { callZome }
) => {
  const ids = await callZome({
    zomeName: ZOMES.CONTACTS,
    fnName: FUNCTIONS[ZOMES.CONTACTS].LIST_BLOCKED,
  });

  if (ids?.type !== "error") {
    let blocked: { [key: string]: Profile } = {};
    const usernameOutputs = await callZome({
      zomeName: ZOMES.USERNAME,
      fnName: FUNCTIONS[ZOMES.USERNAME].GET_USERNAMES,
      payload: ids,
    });
    if (usernameOutputs?.type !== "error") {
      usernameOutputs.forEach((usernameOutput: any) => {
        const base64 = Uint8ArrayToBase64(usernameOutput.agentId);
        blocked[base64] = {
          id: base64,
          username: usernameOutput.username,
        };
      });
    }
    dispatch({
      type: SET_BLOCKED,
      blocked,
    });
    return blocked;
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
      usernames.map(async ({ username, agentId }: any) => ({
        id: Uint8ArrayToBase64(agentId),
        username,
        isAdded: await callZome({
          zomeName: ZOMES.CONTACTS,
          fnName: FUNCTIONS[ZOMES.CONTACTS].IN_CONTACTS,
          payload: agentId,
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
    payload: [base64ToUint8Array(profile.id)],
  });

  if (res?.type !== "error") {
    contacts[profile.id] = profile;
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
    payload: [base64ToUint8Array(profile.id)],
  });

  if (res?.type !== "error") {
    delete contacts[profile.id];
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
  const { contacts, blocked } = getState().contacts;

  const res = await callZome({
    zomeName: ZOMES.CONTACTS,
    fnName: FUNCTIONS[ZOMES.CONTACTS].BLOCK_CONTACTS,
    payload: [base64ToUint8Array(profile.id)],
  });

  if (res?.type !== "error") {
    blocked[profile.id] = profile;
    delete contacts[profile.id];
    dispatch({ type: SET_BLOCKED, blocked });
    dispatch({ type: SET_CONTACTS, contacts });

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
    payload: [base64ToUint8Array(profile.id)],
  });

  if (res?.type !== "error") {
    delete blocked[profile.id];
    dispatch({ type: SET_BLOCKED, blocked });
    return true;
  }
  return false;
};
