"use client";

import { createContext, useContext, useState } from "react";

const Reservation = createContext();

const initialState = { from: null, to: null };

function ReservationProvider({ children }) {
  const [range, setRange] = useState(initialState);
  function resetRange() {
    setRange(initialState);
  }
  return (
    <Reservation.Provider
      value={{
        range,
        setRange,
        resetRange,
      }}
    >
      {children}
    </Reservation.Provider>
  );
}

function useReservation() {
  const context = useContext(Reservation);
  if (context === undefined) {
    throw new Error("useReservation must be used within a ReservationProvider");
  }
  return context;
}

export { ReservationProvider, useReservation };
