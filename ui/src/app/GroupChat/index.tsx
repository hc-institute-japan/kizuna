import React from "react";
import { Route, Switch } from "react-router";
import GroupChatContent from "./GroupChatContent";
import GroupChatDetails from "./GroupChatDetails";
import GroupPinnedMessages from "./GroupPinnedMessages";
import GroupSearch from "./GroupSearch";

const RedeclaredSwitch = Switch as any;
const RedeclaredRoute = Route as any;

const GroupChat: React.FC = () => {
  return (
    <RedeclaredSwitch>
      <RedeclaredRoute path="/g/:group" exact>
        <GroupChatContent />
      </RedeclaredRoute>
      <RedeclaredRoute path="/g/:group/details" exact>
        <GroupChatDetails />
      </RedeclaredRoute>
      <RedeclaredRoute path="/g/:group/search" exact>
        <GroupSearch />
      </RedeclaredRoute>
      <RedeclaredRoute path="/g/:group/pinned" exact>
        <GroupPinnedMessages />
      </RedeclaredRoute>
    </RedeclaredSwitch>
  );
};

export default GroupChat;
