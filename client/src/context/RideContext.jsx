import { createContext, useState, useContext } from 'react';
import mapsService from '../services/maps.service.js';

const RideContext = createContext(null);

export const RideProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useState({
    pickup: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    seats: 1
  });
  
  const [activeRoute, setActiveRoute] = useState(null);
  const [currentRide, setCurrentRide] = useState(null);

  const calculateRouteDetails = async (origin, destination) => {
    try {
      const details = await mapsService.calculateRoute(origin, destination);
      setActiveRoute(details);
      return details;
    } catch (e) {
      console.error("Route calculation error in RideContext:", e.message);
      return null;
    }
  };

  const value = {
    searchParams,
    setSearchParams,
    activeRoute,
    setActiveRoute,
    currentRide,
    setCurrentRide,
    calculateRouteDetails
  };

  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
};

export const useRides = () => {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error('useRides must be used inside a RideProvider wrapper');
  }
  return context;
};
