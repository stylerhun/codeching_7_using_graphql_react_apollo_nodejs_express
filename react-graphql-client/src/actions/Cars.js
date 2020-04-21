import gql from "graphql-tag";

const GET_CARS = gql`
  query Cars($from: Int, $to: Int) {
    getCars(from: $from, to: $to) {
      id
      name
      color
    }
  }
`;

const GET_SALES_DATA = gql`
  query SalesData {
    getSalesData {
      amount
    }
  }
`;

const REMOVE_CAR = gql`
  mutation RemoveCar($id: Int!) {
    removeCar(id: $id) {
      name
    }
  }
`;

const ADD_CAR = gql`
  mutation CreateCar($car: CarInput) {
    createCar(car: $car) {
      id
      name
      color
    }
  }
`;

const UPDATE_CAR = gql`
  mutation UpdateCar($id: Int!, $car: CarInput) {
    updateCar(id: $id, car: $car) {
      id
      name
      color
    }
  }
`;

const CAR_SALES_SUBSCRIPTION = gql`
  subscription OnCarSold {
    carSold {
      amount
    }
  }
`;

export {
  GET_CARS,
  GET_SALES_DATA,
  REMOVE_CAR,
  ADD_CAR,
  UPDATE_CAR,
  CAR_SALES_SUBSCRIPTION
};
