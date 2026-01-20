import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [plants, setPlants] = useState(() => {
    const saved = localStorage.getItem('flora_v1_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  // Persist plants to localStorage
  useEffect(() => {
    localStorage.setItem('flora_v1_data', JSON.stringify(plants));
  }, [plants]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addPlant = (plantData) => {
    const newPlant = {
      id: Date.now().toString(),
      ...plantData,
      lastWatered: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    setPlants([newPlant, ...plants]);
    return newPlant;
  };

  const updatePlant = (plantId, updates) => {
    setPlants(plants.map(plant =>
      plant.id === plantId ? { ...plant, ...updates } : plant
    ));
  };

  const deletePlant = (plantId) => {
    setPlants(plants.filter(plant => plant.id !== plantId));
  };

  const waterPlant = (plantId) => {
    updatePlant(plantId, {
      lastWatered: new Date().toISOString()
    });
  };

  const getNextWateringDate = (plant) => {
    if (!plant.lastWatered || !plant.wateringInterval) return null;

    const lastWatered = new Date(plant.lastWatered);
    const nextWatering = new Date(lastWatered);
    nextWatering.setDate(nextWatering.getDate() + plant.wateringInterval);

    return nextWatering;
  };

  const needsWatering = (plant) => {
    const nextDate = getNextWateringDate(plant);
    if (!nextDate) return false;

    return new Date() >= nextDate;
  };

  const getPlantsNeedingWater = () => {
    return plants.filter(needsWatering);
  };

  const value = {
    plants,
    user,
    loading,
    isPremium,
    setIsPremium,
    addPlant,
    updatePlant,
    deletePlant,
    waterPlant,
    getNextWateringDate,
    needsWatering,
    getPlantsNeedingWater
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
