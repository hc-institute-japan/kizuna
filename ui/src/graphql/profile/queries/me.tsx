import { gql } from "@apollo/client";

export default gql`
  query Me {
    me {
      id
      username
    }
  }
`;
