import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box, Flex, Heading, Text, Button, Spinner, useToast, Grid, Image, Badge, Avatar, Stack, Progress, Icon } from '@chakra-ui/react';
import { FaCoffee, FaMapMarkerAlt, FaPassport, FaGift, FaStar, FaCheck, FaLocationArrow } from 'react-icons/fa';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import axios from "axios";

const App = () => {
  // State management
  const [currentLocation, setCurrentLocation] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [nearbyCafes, setNearbyCafes] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [stamps, setStamps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const toast = useToast();

  // Fetch all cafes from database
  const fetchCafes = async () => {
    try {
      setLoadingCafes(true);
      const response = await axios.get(`${"../config/db"}/cafes`);
      setCafes(response.data);
      setLoadingCafes(false);
    } catch (error) {
      toast({
        title: "Error loading cafes",
        description: "Could not fetch cafe data from server",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoadingCafes(false);
    }
  };
  
  // Fetch user stamps from database
  const fetchStamps = async () => {
    try {
      setLoadingStamps(true);
      // In a real app, use authenticated user ID
      const userId = 1;
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/stamps`);
      setStamps(response.data);
      setLoadingStamps(false);
    } catch (error) {
      toast({
        title: "Error loading stamps",
        description: "Could not fetch your stamp collection",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoadingStamps(false);
    }
  };

  // Get user location
  const getLocation = () => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(coords);
        findNearbyCafes(coords);
        setLoading(false);
      },
      (error) => {
        toast({
          title: "Location error",
          description: "Unable to retrieve your location. Please enable location services.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  // Find nearby cafes from database
  const findNearbyCafes = async (coords) => {
    try {
      const response = await axios.post(`${"../config/db"}/cafes/nearby`, {
        lat: coords.lat,
        lng: coords.lng
      });
      
      setNearbyCafes(response.data);
      setLoading(false);
      
      toast({
        title: "Cafes found!",
        description: `${response.data.length} cafes nearby`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error finding cafes",
        description: "Could not fetch nearby cafes",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  // Claim a stamp
  const claimStamp = async (cafeId) => {
    try {
      // In a real app, use authenticated user ID
      const userId = 1;
      
      const response = await axios.post(`${API_BASE_URL}/stamps/claim`, {
        userId,
        cafeId,
        lat: currentLocation.lat,
        lng: currentLocation.lng
      });
      
      if (response.data.success) {
        toast({
          title: "Stamp earned!",
          description: `You got a stamp for ${response.data.cafeName}`,
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "top",
        });
        
        // Refresh stamps
        fetchStamps();
        setSelectedCafe(null);
      } else {
        toast({
          title: "Couldn't claim stamp",
          description: response.data.message,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error claiming stamp",
        description: "An error occurred while processing your request",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Initial data fetching
  useEffect(() => {
    fetchCafes();
    fetchStamps();
  }, []);

}
