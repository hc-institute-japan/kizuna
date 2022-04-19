import { createComponent } from "@lit-labs/react";
import * as React from "react";
import { ContextProviderElement } from "@holochain-open-dev/context";
import {
  CreateProfile as NativeCreateProfile,
  ListProfiles as NativeListProfiles,
  SearchAgent as NativeSearchAgent,
} from "@holochain-open-dev/profiles";
// import { CreateInvitation as NativeCreateInvitation } from "@eyss/invitations";

export const ContextProvider = createComponent(
  React,
  "context-provider",
  ContextProviderElement,
  {}
);

export const ListProfiles = createComponent(
  React,
  "list-profiles",
  NativeListProfiles,
  {
    onagentselected: "agent-selected",
  }
);

export const CreateProfile = createComponent(
  React,
  "create-profile",
  NativeCreateProfile,
  {}
);

export const SearchAgent = createComponent(
  React,
  "search-agent",
  NativeSearchAgent,
  {}
);

// export const CreateInvitation = createComponent(
//   React,
//   "create-invitation",
//   NativeCreateInvitation,
//   {}
// );
