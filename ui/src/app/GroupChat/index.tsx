import React from "react";
import { Route, Switch } from "react-router";
import GroupChatContent from "./GroupChatContent";
import GroupChatDetails from "./GroupChatDetails";
import GroupPinnedMessages from "./GroupPinnedMessages";
import GroupSearch from "./GroupSearch";

const GroupChat: React.FC = () => {
  return (
    <Switch>
      <Route path="/g/:group" exact>
        <GroupChatContent />
      </Route>
      <Route path="/g/:group/details" exact>
        <GroupChatDetails />
      </Route>
      <Route path="/g/:group/search">
        <GroupSearch />
      </Route>
      <Route path="/g/:group/pinned">
        <GroupPinnedMessages />
      </Route>
    </Switch>
  );
};

export default GroupChat;
