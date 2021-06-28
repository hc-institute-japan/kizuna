import { createContext, useContext } from "react";
import { ProfileListType } from "../../redux/profile/types";

export const ContactsContext = createContext<
  [
    ProfileListType,
    React.Dispatch<React.SetStateAction<ProfileListType>>,
    ProfileListType,
    React.Dispatch<React.SetStateAction<ProfileListType>>
  ]
>([{}, () => {}, {}, () => {}]);

export const useContacts = () => {
  const context = useContext(ContactsContext);
  if (!context) throw Error("No context found");
  return context;
};
