import { Profile } from '../../utils/types'
import { ContactsActionType, ContactsState, IndexedContacts, SET_CONTACTS } from './types'

const initialState: ContactsState = {
    contacts: [],
    indexedContacts: {},
    blocked: []
}

export default (state = initialState, action: ContactsActionType) => {
    switch (action.type) {
        case SET_CONTACTS:
            let indexedContacts: IndexedContacts = {}
            const contacts = action.contacts.sort((a: Profile, b: Profile) => {
                const profileA = a.username.toLowerCase();
                const profileB = b.username.toLowerCase();
                return profileA < profileB ? -1 : profileA > profileB ? 1 : 0
            })

            if (contacts.length > 0) {
                let char = contacts[0].username.charAt(0).toUpperCase();
                indexedContacts[char] = []
                contacts.forEach((contact: Profile) => {
                    const currChar = contact.username.charAt(0).toUpperCase();
                    if (currChar !== char) {
                        char = currChar;
                        indexedContacts[char] = [];
                    }
                    const currArr = indexedContacts[currChar];
                    currArr.push(contact);
                })
            }

            return { ...state, contacts, indexedContacts }
        default:
            return state
    }
}
