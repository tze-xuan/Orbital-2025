import { Box, Button, Flex, Input } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
} from "@vis.gl/react-google-maps";

const MAP_API_ROUTE = "https://cafechronicles.vercel.app/api/locations";

const GeocodedMarker = ({ cafe }) => {
  // Safely parse coordinates
  const lat =
    typeof cafe.lat === "string"
      ? parseFloat(cafe.lat.replace(/[^0-9.-]/g, ""))
      : cafe.lat;
  const lng =
    typeof cafe.lng === "string"
      ? parseFloat(cafe.lng.replace(/[^0-9.-]/g, ""))
      : cafe.lng;

  // Validate coordinates
  if (isNaN(lat) || isNaN(lng)) {
    console.error("Invalid coordinates for cafe:", cafe.id, { lat, lng });
    return null;
  }

  return (
    <AdvancedMarker position={{ lat, lng }} style={{ transform: "scale(1.3)" }}>
      <Pin background="#3970B5" glyphColor="white" borderColor="#3970B5" />
    </AdvancedMarker>
  );
};

export const MapWithInput = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.REACT_APP_GOOGLE_MAPS_MAP_ID;
  const [cafes, setCafes] = useState([]);
  const [currentCafe, setCurrentCafe] = useState({
    name: "",
    location: "",
  });
  const [userLocation, setUserLocation] = useState(null);
  const [, setLoadingLocation] = useState(true);

  // Load cafes on mount
  useEffect(() => {
    const fetchCafes = async () => {
      try {
        const response = await fetch(MAP_API_ROUTE);
        const data = await response.json();
        setCafes(data);
      } catch (error) {
        console.error("Failed to load cafes:", error);
      }
    };
    fetchCafes();

    // Get user's current location
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoadingLocation(false);
          // Clear watcher after getting first accurate reading
          navigator.geolocation.clearWatch(watchId);
        },
        (error) => {
          console.error("Location error:", error);
          // Fallback to default if mobile GPS fails
          setUserLocation({ lat: 1.364917, lng: 103.822872 });
          setLoadingLocation(false);
        },
        {
          enableHighAccuracy: true, // Prioritize GPS
          maximumAge: 0,
          timeout: 15000,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId); // Cleanup
    } else {
      setLoadingLocation(false);
    }
  }, []);

  const handleAddMarker = async () => {
    if (!currentCafe.name.trim() || !currentCafe.location.trim()) return;

    try {
      const response = await fetch(MAP_API_ROUTE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cafeName: currentCafe.name,
          cafeLocation: currentCafe.location,
        }),
      });

      const newCafe = await response.json();
      setCafes([...cafes, newCafe]);
      setCurrentCafe({ name: "", location: "" });
    } catch (error) {
      console.error("Failed to add cafe:", error);
    }
  };

  return (
    <Flex direction="column" height="100%" width="100%" gap={6}>
      <Flex direction="row" gap={8} width="100%" paddingLeft={10}>
        <Input
          value={currentCafe.name}
          onChange={(e) =>
            setCurrentCafe({ ...currentCafe, name: e.target.value })
          }
          placeholder="Cafe name"
          bg="white"
          width="30vw"
        />
        <Input
          value={currentCafe.location}
          onChange={(e) =>
            setCurrentCafe({ ...currentCafe, location: e.target.value })
          }
          placeholder="Cafe address"
          bg="white"
          width="40vw"
        />
        <Button onClick={handleAddMarker} colorScheme="blue">
          Add Cafe
        </Button>
      </Flex>

      <Flex
        position="relative" // Important for proper containment
        width="100vw"
        height="100vh"
        justifyContent="center"
        alignItems="center"
      >
        <APIProvider apiKey={apiKey}>
          <Box width="100%" height="100%" position="relative">
            <Map mapId={mapId} defaultZoom={16} center={userLocation}>
              {cafes.map((cafe) => (
                <GeocodedMarker key={cafe.id} cafe={cafe} />
              ))}
            </Map>
          </Box>
        </APIProvider>
      </Flex>
    </Flex>
  );
};
