import {
  Text,
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  useToast,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Box,
  HStack,
  VStack,
  IconButton,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { useCallback, useState, useEffect } from "react";
import { FaLocationArrow, FaMapMarkerAlt, FaTimes } from "react-icons/fa";

// Types
interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationResult {
  coordinates: Coordinates;
  formattedAddress: string;
  placeId?: string;
}

interface LocationFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterRadius: number;
  setFilterRadius: (radius: number) => void;
  userLocation: LocationResult | null;
  setUserLocation: (location: LocationResult | null) => void;
  onApplyFilter?: (location: LocationResult, radius: number) => void;
  onClearFilter?: () => void;
}

// Geocoding service
class GeocodingService {
  private static instance: GeocodingService;
  private apiKey: string;

  private constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
  }

  static getInstance(): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService();
    }
    return GeocodingService.instance;
  }

  async geocodeAddress(address: string): Promise<LocationResult> {
    if (!this.apiKey) {
      throw new Error("Google Maps API key is required");
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "ZERO_RESULTS") {
      throw new Error("No results found for this address");
    }

    if (data.status !== "OK") {
      throw new Error(`Geocoding failed: ${data.status}`);
    }

    const result = data.results[0];
    return {
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
    };
  }

  async reverseGeocode(lat: number, lng: number): Promise<LocationResult> {
    if (!this.apiKey) {
      throw new Error("Google Maps API key is required");
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Reverse geocoding failed: ${data.status}`);
    }

    const result = data.results[0];
    return {
      coordinates: { lat, lng },
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
    };
  }
}

// Custom hook for geolocation
const useGeolocation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const toast = useToast();

  const getCurrentLocation =
    useCallback(async (): Promise<LocationResult | null> => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by this browser");
        return null;
      }

      setLoading(true);
      setError("");

      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000, // 5 minutes
            });
          }
        );

        const { latitude, longitude } = position.coords;
        const geocodingService = GeocodingService.getInstance();
        const locationResult = await geocodingService.reverseGeocode(
          latitude,
          longitude
        );

        return locationResult;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to get location";
        setError(errorMessage);
        toast({
          title: "Location Error",
          description: errorMessage,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return null;
      } finally {
        setLoading(false);
      }
    }, [toast]);

  return { getCurrentLocation, loading, error };
};

// Distance calculation utility
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const LocationFilterModal = ({
  isOpen,
  onClose,
  filterRadius,
  setFilterRadius,
  userLocation,
  setUserLocation,
  onApplyFilter,
  onClearFilter,
}: LocationFilterModalProps) => {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [locationError, setLocationError] = useState("");
  const toast = useToast();
  const { getCurrentLocation, loading: geoLoading } = useGeolocation();

  // Initialize input with current location
  useEffect(() => {
    if (userLocation) {
      setLocationInput(userLocation.formattedAddress);
    } else {
      setLocationInput("");
    }
  }, [userLocation]);

  const validateLocation = useCallback(
    async (location: string): Promise<LocationResult | null> => {
      if (!location.trim()) {
        setLocationError("Please enter a location");
        return null;
      }

      setIsGeocoding(true);
      setLocationError("");

      try {
        const geocodingService = GeocodingService.getInstance();
        const result = await geocodingService.geocodeAddress(location);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error validating address";
        setLocationError(errorMessage);
        return null;
      } finally {
        setIsGeocoding(false);
      }
    },
    []
  );

  const handleApplyFilter = useCallback(async () => {
    const locationResult = await validateLocation(locationInput);
    if (!locationResult) return;

    setUserLocation(locationResult);
    onApplyFilter?.(locationResult, filterRadius);

    toast({
      title: "Location filter applied",
      description: `Filtering within ${filterRadius}km of ${locationResult.formattedAddress}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    onClose();
  }, [
    locationInput,
    validateLocation,
    setUserLocation,
    filterRadius,
    toast,
    onClose,
    onApplyFilter,
  ]);

  const handleUseCurrentLocation = useCallback(async () => {
    const location = await getCurrentLocation();
    if (location) {
      setLocationInput(location.formattedAddress);
      setLocationError("");
    }
  }, [getCurrentLocation]);

  const clearLocationFilter = useCallback(() => {
    setUserLocation(null);
    setLocationInput("");
    setLocationError("");
    onClearFilter?.();

    toast({
      title: "Location filter cleared",
      status: "info",
      duration: 2000,
      isClosable: true,
    });

    onClose();
  }, [onClose, setUserLocation, toast, onClearFilter]);

  const handleRadiusChange = useCallback(
    (val: number) => {
      setFilterRadius(val);
    },
    [setFilterRadius]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocationInput(e.target.value);
      if (locationError) setLocationError("");
    },
    [locationError]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex align="center">
            <FaLocationArrow color="#DC6739" style={{ marginRight: "8px" }} />
            <Text>Filter by Location</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Current Location Status */}
            {userLocation && (
              <Box
                p={3}
                bg="green.50"
                borderRadius="md"
                border="1px solid"
                borderColor="green.200"
              >
                <HStack>
                  <FaMapMarkerAlt color="green" />
                  <Text fontSize="sm" flex={1}>
                    Current: {userLocation.formattedAddress}
                  </Text>
                  <Badge colorScheme="green" variant="subtle">
                    {filterRadius}km radius
                  </Badge>
                </HStack>
              </Box>
            )}

            {/* Location Input */}
            <FormControl isInvalid={!!locationError}>
              <FormLabel>Location</FormLabel>
              <HStack>
                <Input
                  placeholder="Enter an address, city, or landmark"
                  value={locationInput}
                  onChange={handleInputChange}
                  isDisabled={isGeocoding || geoLoading}
                />
                <IconButton
                  aria-label="Use current location"
                  icon={
                    geoLoading ? <Spinner size="sm" /> : <FaLocationArrow />
                  }
                  onClick={handleUseCurrentLocation}
                  isLoading={geoLoading}
                  colorScheme="orange"
                  variant="outline"
                />
              </HStack>
              {locationError && (
                <FormErrorMessage>{locationError}</FormErrorMessage>
              )}
            </FormControl>

            {/* Radius Slider */}
            <FormControl>
              <FormLabel>Search Radius: {filterRadius}km</FormLabel>
              <Slider
                aria-label="Search radius in kilometers"
                min={1}
                max={100}
                step={1}
                value={filterRadius}
                onChange={handleRadiusChange}
                colorScheme="orange"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <HStack justify="space-between" mt={1}>
                <Text fontSize="xs" color="gray.500">
                  1km
                </Text>
                <Text fontSize="xs" color="gray.500">
                  100km
                </Text>
              </HStack>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={2}>
            {userLocation && (
              <Button
                variant="outline"
                onClick={clearLocationFilter}
                colorScheme="gray"
                leftIcon={<FaTimes />}
              >
                Clear Filter
              </Button>
            )}
            <Button
              colorScheme="orange"
              onClick={handleApplyFilter}
              isLoading={isGeocoding}
              isDisabled={!locationInput.trim() || isGeocoding}
              loadingText="Validating..."
            >
              Apply Filter
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LocationFilterModal;
export { calculateDistance };
export type { Coordinates, LocationResult };
