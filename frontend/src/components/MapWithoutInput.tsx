import { Flex, Box } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
} from "@vis.gl/react-google-maps";

const MAP_API_ROUTE = "https://cafechronicles.vercel.app/api/locations/";

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

export const MapWithoutInput = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.REACT_APP_GOOGLE_MAPS_MAP_ID;
  const [cafes, setCafes] = useState([]);
  const [userLocation, setUserLocation] = useState(null); // Start with null
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [, setLoadingCafes] = useState(true);

  // Load cafes on mount
  useEffect(() => {
    const fetchCafes = async () => {
      try {
        const response = await fetch(MAP_API_ROUTE);
        const data = await response.json();
        setCafes(data);
      } catch (error) {
        console.error("Failed to load cafes:", error);
      } finally {
        setLoadingCafes(false);
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
          navigator.geolocation.clearWatch(watchId);
        },
        (error) => {
          console.error("Location error:", error);
          setUserLocation({ lat: 1.364917, lng: 103.822872 });
          setLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setUserLocation({ lat: 1.364917, lng: 103.822872 });
      setLoadingLocation(false);
    }
  }, []);

  // Don't render map until we have location
  if (loadingLocation || !userLocation) {
    return (
      <Flex
        width="100vw"
        height="100vh"
        justifyContent="center"
        alignItems="center"
      >
        Loading map...
      </Flex>
    );
  }

  return (
    <Flex
      position="relative"
      width="100vw"
      height="100vh"
      justifyContent="center"
      alignItems="center"
    >
      <APIProvider apiKey={apiKey}>
        <Box width="100%" height="100%" position="relative">
          <Map
            mapId={mapId}
            defaultZoom={16}
            center={userLocation} // Use center instead of defaultCenter
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {cafes.map((cafe) => (
              <GeocodedMarker key={cafe.id} cafe={cafe} />
            ))}
          </Map>
        </Box>
      </APIProvider>
    </Flex>
  );
};
