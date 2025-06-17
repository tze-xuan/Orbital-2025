import { Button, Flex, Input } from "@chakra-ui/react";
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
      : typeof cafe.Ing === "string"
      ? parseFloat(cafe.Ing.replace(/[^0-9.-]/g, ""))
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

export const Maps = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.REACT_APP_GOOGLE_MAPS_MAP_ID;
  const [cafes, setCafes] = useState([]);
  const [currentCafe, setCurrentCafe] = useState({
    name: "",
    location: "",
  });

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
    <Flex direction="column" height="80vh" width="100%" gap={4}>
      <Flex justifyContent="center" direction="row" gap={2}>
        <Input
          value={currentCafe.name}
          onChange={(e) =>
            setCurrentCafe({ ...currentCafe, name: e.target.value })
          }
          placeholder="Cafe name"
          bg="white"
          width="40vw"
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

      <Flex flex={1}>
        <APIProvider apiKey={apiKey}>
          <Map
            mapId={mapId}
            defaultZoom={12}
            defaultCenter={{ lat: 1.364917, lng: 103.822872 }}
          >
            {cafes.map((cafe) => (
              <GeocodedMarker key={cafe.id} cafe={cafe} />
            ))}
          </Map>
        </APIProvider>
      </Flex>
    </Flex>
  );
};
