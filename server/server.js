import express from "express";
import { createServer } from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { execute, subscribe } from "graphql";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { Pubsub, withFilter, PubSub } from "graphql-subscriptions";
import { makeExecutableSchema } from "graphql-tools";
import cars from "./data/cars.json";

const PORT = 9000;

var app = express();

app.set("port", PORT);

app.use(cors());
app.options("*", cors());

// Setup GraphQL
// Create typedefs

var typeDefs = `
    input CarInput {
        id: Int,
        name: String,
        color: String
    }
    
    type Car {
        id: Int,
        name: String,
        color: String
    }

    type CarSalesData {
        amount: Int
    }

    type Query {
        getCars(from: Int, to: Int): [Car]
        getCar(id: Int!): Car
        getSalesData: CarSalesData
    }

    type Mutation {
        createCar(car: CarInput): Car
        updateCar(id: Int!, car: CarInput): Car
        removeCar(id: Int!): Car
        sellCar(amount: Int!): CarSalesData
    }

    type Subscription {
        carSold: CarSalesData
    }
`;

// Pubsub is a class that exposes a simple publish and subscribe API.
// We will store the amount of money which is stored after succesful sale
const pubsub = new PubSub();
var totalCarSold = 120000; // initial amount in $
pubsub.publish("carSold", { carSold: { amount: totalCarSold } });

// Create the resolvers of types
var resolvers = {
  Query: {
    getCars: (obj, { from, to }) => {
      if (from && to) {
        return cars.slice(from, to);
      } else if (from) {
        return cars.slice(from, cars.length - 1);
      } else if (to) {
        return cars.slice(0, to);
      } else {
        return cars;
      }
    },
    getCar: (obj, { id }) => {
      return cars.find(car => car.id === id);
    },
    getSalesData: obj => {
      return { amount: totalCarSold };
    }
  },
  Mutation: {
    createCar: (obj, { car }) => {
      const carN = JSON.parse(JSON.stringify(car));
      const latestCar = cars.reduce((l, e) => {
        return e.id > l.id ? e : l;
      });
      carN.id = latestCar.id + 1;

      cars.push(carN);

      return carN;
    },
    updateCar: (obj, { id, car }) => {
      let carM = cars.find(car => car.id === id);
      if (!carM) {
        throw new Error(`no car exits with id ${id}!`);
      }

      Object.assign(carM, JSON.parse(JSON.stringify(car)));
      return carM;
    },
    removeCar: (obj, { id }) => {
      let carIdx = cars.findIndex(car => car.id === id);
      if (carIdx === -1) {
        throw new Error(`no car exits with id ${id}!`);
      }
      return cars.splice(carIdx, 1)[0];
    },
    sellCar: (obj, { amount }) => {
      totalCarSold += amount;
      pubsub.publish("carSold", { carSold: { amount: totalCarSold } });
      return { amount: totalCarSold };
    }
  },
  Subscription: {
    carSold: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("carSold"),
        () => {
          return true;
        }
      )
    }
  }
};

const myGraphQLSchema = makeExecutableSchema({
  typeDefs,
  resolvers
});

// Set up the main end-point for GraphQL Express

app.use(
  "/graphql",
  bodyParser.json(),
  graphqlExpress({
    schema: myGraphQLSchema
  })
);

app.use(
  "/graphiql",
  bodyParser.json(),
  graphiqlExpress({
    endpointURL: "/graphql",
    subscriptionsEndpoint: `ws://localhost:${PORT + 1}/subscriptions`
  })
);

// wrap the express server
const ws = createServer(app);

ws.listen(PORT + 1, () => {
  console.log(`Apollo server is now running on http://localhost:${PORT + 1}`);

  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema: myGraphQLSchema
    },
    {
      server: ws,
      path: "/subscriptions"
    }
  );
});

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

const clientErrorHandler = (err, req, res, next) => {
  if (req.xhr) {
    res.status(500).send({ error: "Something failed!" });
  } else {
    next(err);
  }
};

app.use(clientErrorHandler);

app.listen(app.get("port"), () => {
  console.log(`Express app started on port ${app.get("port")}!`);
});
