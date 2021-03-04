import React from "react";
import { Route, Switch } from "react-router";
import Landing from "../Landing";
import Login from "../Login";
import Register from "../Register";

const Unauthenticated: React.FC = () => (
  <Switch>
    <Route path="/" component={Landing} />
    <Route path="/register" component={Register} />
    <Route path="/login" component={Login} />
  </Switch>
);

export default Unauthenticated;
