import {
  Flex,
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
} from "@vis.gl/react-google-maps";
import { Plus, Minus, Route } from "lucide-react";
import { CafeType } from "../../interfaces/CafeType.tsx";

const MAP_API_ROUTE = "https://cafechronicles.vercel.app/api/locations";

const GeocodedMarker = ({ cafe, isInRoute }) => {
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

  // Orange for route cafes, blue for others
  const pinColor = isInRoute ? "#DC6739" : "#3970B5";

  return (
    <AdvancedMarker position={{ lat, lng }} style={{ transform: "scale(1.3)" }}>
      <Pin background={pinColor} glyphColor="white" borderColor={pinColor} />
    </AdvancedMarker>
  );
};

export const MapWithoutInput = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.REACT_APP_GOOGLE_MAPS_MAP_ID;
  const [cafes, setCafes] = useState<CafeType[]>([]);
  const [routeCafes, setRouteCafes] = useState<Set<string>>(new Set()); // New route state
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [, setLoadingCafes] = useState(true);
  const [showRoutePanel, setShowRoutePanel] = useState(false); // Toggle route panel

  const toast = useToast();

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

  // Route management functions
  const addToRoute = (cafeId: string) => {
    setRouteCafes((prev) => {
      const newSet = new Set(prev);
      newSet.add(cafeId);
      return newSet;
    });
  };

  const removeFromRoute = (cafeId: string) => {
    setRouteCafes((prev) => {
      const newSet = new Set(prev);
      newSet.delete(cafeId);
      return newSet;
    });
    toast({
      title: "Cafe removed from route",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const clearRoute = () => {
    setRouteCafes(new Set());
    toast({
      title: "Route cleared",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  // Get cafes that are in the route
  const routeCafesList = cafes.filter((cafe) =>
    routeCafes.has(cafe.id.toString())
  );

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
            center={userLocation}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {/* Show route cafes if any exist, otherwise show all cafes */}
            {routeCafes.size > 0
              ? routeCafesList.map((cafe) => (
                  <GeocodedMarker key={cafe.id} cafe={cafe} isInRoute={true} />
                ))
              : Array.isArray(cafes) &&
                cafes.map((cafe) => (
                  <GeocodedMarker key={cafe.id} cafe={cafe} isInRoute={false} />
                ))}
          </Map>

          {/* Route Toggle Button */}
          <Button
            position="absolute"
            top={20}
            right={20}
            onClick={() => setShowRoutePanel(!showRoutePanel)}
            bg="#DC6739"
            color="white"
            _hover={{ bg: "rgba(220, 103, 57, 0.9)" }}
            leftIcon={<Route size={16} />}
            shadow="lg"
            fontFamily="afacad"
            borderRadius="full"
          >
            Route ({routeCafes.size})
          </Button>

          {/* Route Management Panel */}
          {showRoutePanel && (
            <Card
              position="absolute"
              top={16}
              right={4}
              w="300px"
              maxH="80vh"
              shadow="xl"
              overflowY="auto"
            >
              <CardBody>
                <HStack justify="space-between" align="center" mb={4}>
                  <Heading size="md">Cafe Route</Heading>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowRoutePanel(false)}
                  >
                    ×
                  </Button>
                </HStack>

                {routeCafes.size > 0 && (
                  <>
                    <HStack justify="space-between" mb={4}>
                      <Text fontSize="sm" color="gray.600">
                        {routeCafes.size} cafe{routeCafes.size !== 1 ? "s" : ""}{" "}
                        in route
                      </Text>
                      <Button size="sm" variant="outline" onClick={clearRoute}>
                        Clear All
                      </Button>
                    </HStack>

                    <VStack spacing={2} align="stretch" mb={4}>
                      <Text fontWeight="semibold" fontSize="sm">
                        Current Route:
                      </Text>
                      {routeCafesList.map((cafe, index) => (
                        <HStack
                          key={cafe.id}
                          p={2}
                          bg="orange.50"
                          borderRadius="md"
                        >
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="orange.600"
                            minW="20px"
                            paddingX={2}
                          >
                            {index + 1}
                          </Text>
                          <Box flex={1} minW={0}>
                            <Text
                              fontSize="sm"
                              fontWeight="medium"
                              noOfLines={1}
                            >
                              {cafe.cafeName}
                            </Text>
                          </Box>
                          <IconButton
                            icon={<Minus size={14} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => removeFromRoute(cafe.id.toString())}
                            aria-label={""}
                          />
                        </HStack>
                      ))}
                    </VStack>
                  </>
                )}

                <Text fontWeight="semibold" fontSize="sm" mb={3}>
                  Available Cafes:
                </Text>
                <VStack spacing={2} align="stretch">
                  {cafes
                    .filter((cafe) => !routeCafes.has(cafe.id.toString()))
                    .map((cafe) => (
                      <HStack
                        key={cafe.id}
                        p={2}
                        bg="gray.50"
                        borderRadius="md"
                      >
                        <Box flex={1} minW={0}>
                          <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                            {cafe.cafeName}
                          </Text>
                          <Text fontSize="xs" color="gray.600" noOfLines={1}>
                            {cafe.cafeLocation}
                          </Text>
                        </Box>
                        <IconButton
                          icon={<Plus size={14} />}
                          size="xs"
                          variant="ghost"
                          colorScheme="orange"
                          onClick={() => addToRoute(cafe.id.toString())}
                          aria-label={""}
                        />
                      </HStack>
                    ))}
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Route Summary (when panel is closed) */}
          {!showRoutePanel && routeCafes.size > 0 && (
            <Card position="absolute" top={16} right={4} w="200px" shadow="lg">
              <CardBody p={3}>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Route: {routeCafes.size} cafe
                  {routeCafes.size !== 1 ? "s" : ""}
                </Text>
                <VStack spacing={1} align="start">
                  {routeCafesList.slice(0, 3).map((cafe, index) => (
                    <Text
                      key={cafe.id}
                      fontSize="xs"
                      color="gray.700"
                      noOfLines={1}
                    >
                      {index + 1}. {cafe.name}
                    </Text>
                  ))}
                  {routeCafesList.length > 3 && (
                    <Text fontSize="xs" color="gray.500">
                      +{routeCafesList.length - 3} more
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}
        </Box>
      </APIProvider>
    </Flex>
  );
};
