import React from "react";
import { Route, Switch } from "react-router";
import Search from "../../components/Search";
import GroupChatContent from "./GroupChatContent";
import GroupChatDetails from "./GroupChatDetails";
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
        {/* <Search prevHref="/" type="group" /> */}
        <GroupSearch />
      </Route>
    </Switch>
  );
};

export default GroupChat;
