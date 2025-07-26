import { Flex, IconButton, useDisclosure, useToast } from "@chakra-ui/react";
import React, { useState, useEffect, useCallback } from "react";
import Axios from "axios";
import LocationFilterModal, {
  LocationResult,
  calculateDistance,
} from "../../components/Cafes/LocationFilterModal.tsx";
import { CafeType } from "../../interfaces/CafeType.tsx";
import DashbordCafeList from "../../components/Cafes/HomeCafeList.tsx";
import { FaHome } from "react-icons/fa";
import DashboardCafeFilterSection from "../../components/Cafes/HomeCafeFilterSection.tsx";

const DiscoverCafes = () => {
  const CAFE_API_ROUTE = "https://cafechronicles.vercel.app/api/cafes/";

  const [data, setData] = useState<CafeType[] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [, setIsLoading] = useState(true); // Add loading state
  const [, setError] = useState<string | null>(null); // Add error state
  const toast = useToast();

  // Location filter state - using LocationResult type
  const [filterRadius, setFilterRadius] = useState(5);
  const [userLocation, setUserLocation] = useState<LocationResult | null>(null);

  // Modals
  const {
    isOpen: isLocationModalOpen,
    onOpen: onLocationModalOpen,
    onClose: onLocationModalClose,
  } = useDisclosure();

  // Review state
  const getCurrentUser = (): { id: string } | null => {
    try {
      const userString = localStorage.getItem("currentUser");
      if (!userString) return null;

      const user = JSON.parse(userString);
      return user ? { ...user, id: user.id.toString() } : null;
    } catch (error) {
      console.error("Error parsing current user:", error);
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const [, setUserId] = useState<number | null>(null);

  // Debug logging
  const debug = (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEBUG] ${message}`, data || "");
    }
  };

  // User ID fetch
  const getUserId = useCallback(async () => {
    try {
      debug("Attempting to get user ID");

      const config = {
        timeout: 3000,
        withCredentials: true,
      };

      const response = await Axios.get(
        "https://cafechronicles.vercel.app/api/auth/me",
        config
      );

      if (response.data?.id) {
        debug("User ID retrieved", response.data.id);
        setUserId(response.data.id);
        return;
      }

      debug("No user ID found in response");
      setUserId(null);
      toast({
        title: "Please log in",
        description: "You need to be logged in to use bookmarks",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      debug("Error in getUserId", error);
      setUserId(null);
    }
  }, [toast]);

  // Data fetching
  const getData = useCallback(async () => {
    try {
      debug("Fetching cafes");
      setIsLoading(true);
      setError(null);

      const response = await Axios.get(CAFE_API_ROUTE, {
        timeout: 10000,
        headers: { "Content-Type": "application/json" },
      });

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid data format received");
      }

      setData(response.data);
      debug("Cafes fetched successfully", response.data.length);
    } catch (error) {
      debug("Error fetching cafes", error);
      setError(`Failed to fetch cafes: ${error.message}`);
      setData([]);

      toast({
        title: "Error loading cafes",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [CAFE_API_ROUTE, toast]);

  // Load cafes regardless of auth status
  useEffect(() => {
    getData();
  }, [getData]);

  // Location filter handlers
  const handleApplyLocationFilter = useCallback(
    (location: LocationResult, radius: number) => {
      console.log("Location filter applied:", location, "Radius:", radius);
      setUserLocation(location);
      setFilterRadius(radius);
    },
    []
  );

  const handleClearLocationFilter = useCallback(() => {
    console.log("Location filter cleared");
    setUserLocation(null);
  }, []);

  // Enhanced filtering logic
  const filteredCafes = (() => {
    if (!data) {
      console.log("No data available for filtering");
      return [];
    }

    console.log("Cafes to filter:", data.length);

    // Apply search filter
    let filtered = searchTerm
      ? data.filter((cafe: CafeType) => {
          const nameMatch = cafe.cafeName
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const locationMatch = cafe.cafeLocation
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          return nameMatch || locationMatch;
        })
      : data;

    console.log("After search filter:", filtered.length);

    // Apply location filter
    if (userLocation) {
      filtered = filtered.filter((cafe: CafeType) => {
        if (!cafe.lat || !cafe.lng) return false;

        const distance = calculateDistance(
          userLocation.coordinates.lat,
          userLocation.coordinates.lng,
          parseFloat(cafe.lat.toString()),
          parseFloat(cafe.lng.toString())
        );

        return distance <= filterRadius;
      });
      console.log("After location filter:", filtered.length);
    }

    console.log("Final filtered cafes:", filtered);
    return filtered;
  })();

  useEffect(() => {
    getUserId();
  }, [getUserId]);

  return (
    <Flex alignItems="center" direction="column" gap={4} padding="6vh">
      <IconButton
        as="a"
        href="/"
        aria-label="Home"
        icon={<FaHome />}
        color="#3E405B"
        variant="link"
        size="lg"
        _hover={{ color: "#DC6739" }}
        m={2}
      />

      <DashboardCafeFilterSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        userLocation={userLocation}
        filterRadius={filterRadius}
        onLocationModalOpen={onLocationModalOpen}
        onClearLocationFilter={() => setUserLocation(null)}
      />

      <DashbordCafeList
        cafes={filteredCafes}
        user={currentUser}
        searchTerm={searchTerm}
        userLocation={userLocation}
        filterRadius={filterRadius}
      />

      <LocationFilterModal
        isOpen={isLocationModalOpen}
        onClose={onLocationModalClose}
        filterRadius={filterRadius}
        setFilterRadius={setFilterRadius}
        userLocation={userLocation}
        setUserLocation={setUserLocation}
        onApplyFilter={handleApplyLocationFilter}
        onClearFilter={handleClearLocationFilter}
      />
    </Flex>
  );
};

export default DiscoverCafes;
