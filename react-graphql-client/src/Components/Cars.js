import React, { useState, useMemo, useCallback } from "react";
import "./Cars.css";
import { useQuery, useMutation, useSubscription } from "@apollo/react-hooks";
import {
  GET_CARS,
  GET_SALES_DATA,
  REMOVE_CAR,
  CAR_SALES_SUBSCRIPTION
} from "../actions/Cars";
import CarsForm from "./CarsForm";

const Cars = () => {
  const emptyCar = useMemo(() => {
    return { name: "", color: "blue" };
  }, []);

  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(10000);

  const { data, loading, error, refetch } = useQuery(GET_CARS, {
    variables: { from, to }
  });

  const setLimit = useCallback((type, val) => {
    if (type === "from") setFrom(parseInt(val));
    if (type === "to") setTo(parseInt(val));
  }, []);

  // create delete handler
  const [onDeleteHandler] = useMutation(REMOVE_CAR);

  const deleteCar = useCallback(
    id => {
      onDeleteHandler({ variables: { id } });
      refetch();
      setSelectedCar(emptyCar);
    },
    [refetch, onDeleteHandler, emptyCar]
  );

  const [selectedCar, setSelectedCar] = useState(emptyCar);

  // Set up real-time subscription
  const { data: salesQData, salesLoading } = useQuery(GET_SALES_DATA, {});

  const { data: subData } = useSubscription(CAR_SALES_SUBSCRIPTION);

  const getSalesData = () => {
    if (subData && subData.carSold) {
      return subData.carSold.amount;
    } else if (salesQData && salesQData.getSalesData && !salesLoading) {
      return salesQData.getSalesData.amount;
    }
  };

  if (loading) return <p>Loading....</p>;

  if (error) {
    return (
      <div>
        <p>Error</p>
        <div>{error.message}</div>
      </div>
    );
  }

  return (
    <div className="cars">
      {((subData && subData.carSold) || (salesQData && !salesLoading)) && (
        <div className="cars-sold">Sales/Total: {getSalesData()} $</div>
      )}
      <CarsForm
        refetch={refetch}
        selectedCar={selectedCar}
        setSelectedCar={setSelectedCar}
        emptyCar={emptyCar}
      />
      <div className="cars-title">
        <div>Cars </div>
        <div className="label-limit"> Limit: </div>
        <input
          type="number"
          value={from}
          onClick={e => setLimit("from", e.target.value)}
          onChange={e => setLimit("from", e.target.value)}
        />{" "}
        -{" "}
        <input
          type="number"
          value={to}
          onClick={e => setLimit("to", e.target.value)}
          onChange={e => setLimit("to", e.target.value)}
        />
      </div>
      <div className="list">
        {data.getCars &&
          data.getCars.map((car, i) => {
            return (
              <div
                key={i + 0}
                className="list-row"
                role="presentation"
                onClick={() => setSelectedCar(car)}
              >
                <div>{car.name}</div>
                <div className="color" style={{ background: car.color }}>
                  &nbsp;
                </div>
                <div
                  role="presentation"
                  onClick={e => {
                    e.stopPropagation();
                    deleteCar(car.id);
                  }}
                >
                  X
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Cars;
