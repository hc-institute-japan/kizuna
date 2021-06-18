import React from "react";
import { Route, Switch } from "react-router";
import GroupChatContent from "./GroupChatContent";
import GroupChatDetails from "./GroupChatDetails";

const GroupChat: React.FC = () => {
  return (
    <Switch>
      <Route path="/g/:group" exact>
        <GroupChatContent />
      </Route>
      <Route path="/g/:group/details" exact>
        <GroupChatDetails />
      </Route>
    </Switch>
  );
};

export default GroupChat;
