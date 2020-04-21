Using GraphQL hooks in React | build a subscription server in Node.js using Apollo | step by step

## Description

In this tutorial I will show you how can you use GraphQL. We will build a full-stack application with
NodeJS back-end, Apollo server express, and React front-end which will contains the basic CRUD methods.
We will create queries, mutations, and a real-time subscription as well. 

### Install

Run npm install in 'react-graphql-client' folder and in server folder as well

### Video

https://www.youtube.com/watch?v=jvNYYUaXG9E

### Run the server

npm run server (in the 'server' folder)

### Run the front-end (localhost:3000)

npm run start (in the 'react-graphql-client' folder)


### To test queries

http://localhost:9000/graphiql

Sell. The react app subscribe to the sell, so it will display the total amount real time if frontend is
running:

```
mutation {
  sellCar(amount: 100){
    amount
  }
}


Queries:

-----
1) Get cars from index 0 to 5
-----

{
  getCars(from: 0, to : 5) {
    id, name, color
  }
}

-----
2) Get one car by id 8
-----

{
  getCar(id: 8) {
    id, name, color
  }
}


-----
3) Add a new car, and update the Ferrari, delete the car with id 1
-----

mutation {
  createCar(car: { name: "Rolls royce", color:"gold"}) {
    id, name, color
  }
  updateCar(id: 2, car: { name: "Turbo Ferrari", color:"magenta"}) {
    id, name, color
  }
  removeCar(id: 4){
    name
  }
}

```

