import { gql } from "@apollo/client";

export default gql`
  query Contacts {
    contacts {
      id
      username
    }
  }
`;
