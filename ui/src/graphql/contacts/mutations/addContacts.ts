import { gql } from "@apollo/client";

export default gql`
  mutation AddContacts($contacts: [AddContact!]) {
    addContacts(contacts: $contacts) {
      id
      username
    }
  }
`;
