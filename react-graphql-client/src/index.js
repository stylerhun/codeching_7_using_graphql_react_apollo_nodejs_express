import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { ApolloProvider } from "@apollo/react-hooks";
import { RetryLink } from "apollo-link-retry";
import { getMainDefinition } from "apollo-utilities";

const cache = new InMemoryCache();
const httpLink = new HttpLink({
  uri: "http://localhost:9000/graphql"
});

const wsLink = new WebSocketLink({
  uri: "ws://localhost:9001/subscriptions",
  options: {
    reconnect: true,
    timeout: 30000
  }
});

const link = new RetryLink({ attemts: { max: Infinity } }).split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  cache,
  link
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
