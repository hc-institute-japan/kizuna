import { ReactElement } from "react";
import { MeProps } from "./components/Me";
import { OthersProps } from "./components/Others";

export interface ChatListProps {
  type?: "p2p" | "group";
  author: string;
  children:
    | ReactElement<MeProps | OthersProps>
    | Array<ReactElement<MeProps | OthersProps>>;
}
