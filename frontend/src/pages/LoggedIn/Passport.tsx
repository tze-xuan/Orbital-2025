import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Text,
  Button,
  VStack,
  HStack,
  Card,
  CardBody,
  Badge,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  IconButton,
  useToast,
  Flex,
  Spacer,
  Heading,
} from "@chakra-ui/react";
import { FaHome } from "react-icons/fa";
import { Coffee, Star, Clock, Award, CheckCircle } from "lucide-react";
import axios from "axios";

const getCurrentUser = () => {
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

const CAFE_API_ROUTE = "https://cafechronicles.vercel.app/api/cafes/";
const PASSPORT_API_ROUTE = "https://cafechronicles.vercel.app/api/passport/";

const CafePassport: React.FC = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [allCafes, setAllCafes] = useState([]);
  const [userStamps, setUserStamps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [claimingStamp, setClaimingStamp] = useState(false);
  const [activeTab] = useState("cafes");
  const toast = useToast();
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id || null;

  // Handle API errors
  const handleApiError = useCallback(
    (error: any) => {
      let errorMessage = "Network error. Please try again.";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response from server. Check your connection.";
      } else {
        errorMessage = error.message || "An unexpected error occurred";
      }

      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
    [toast]
  );

  // Fetch all cafes
  const fetchAllCafes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(CAFE_API_ROUTE);
      console.log("API Response:", response.data);
      setAllCafes(response.data);
      setError("");
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  // Fetch user stamps
  const fetchUserStamps = useCallback(async () => {
    try {
      const response = await axios.get(
        `${PASSPORT_API_ROUTE}users/${currentUserId}/stamps`
      ); //url likely wrong
      setUserStamps(response.data);
    } catch (err) {
      console.error("Error fetching stamps:", err);
    }
  }, [currentUserId]);

  // Claim stamp at cafe
  const claimStamp = async (cafeId: any, cafeName: any) => {
    if (!userLocation) {
      setError("Location not available");
      return;
    }

    setClaimingStamp(true);
    try {
      const response = await axios.post(`${PASSPORT_API_ROUTE}stamps/claim`, {
        userId: currentUserId,
        cafeId: cafeId,
        lat: userLocation.lat,
        lng: userLocation.lng,
        useGoogleMaps: false,
      });

      setError("");
      toast({
        title: "Stamp Claimed! 🎉",
        description: `You've collected a stamp from ${cafeName}! Total: ${response.data.stampCount}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchUserStamps();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to claim stamp. Claim only at the cafe location. ";
      setError(errorMessage);
      console.log(err.response.data);

      toast({
        title: "Claim Failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setClaimingStamp(false);
    }
  };

  // Load user stamps when switching to stamps tab
  useEffect(() => {
    if (activeTab === "stamps") {
      fetchUserStamps();
    }
  }, [activeTab, fetchUserStamps]);

  // Check if user has stamp for cafe today
  const hasStampToday = (cafeId) => {
    const today = new Date().toDateString();
    return userStamps.some(
      (stamp) =>
        stamp.cafe_id === cafeId &&
        new Date(stamp.created_at).toDateString() === today
    );
  };

  const CafeCard = ({ cafe }) => (
    <Card mb={4} shadow="md" borderWidth="1px">
      <CardBody>
        <VStack align="start" spacing={3}>
          <Box w="full">
            <Heading size="md" color="gray.800" mb={1}>
              {cafe.cafeName}
            </Heading>
            <Text color="gray.600" fontSize="sm" mb={2}>
              {cafe.cafeLocation}
            </Text>
          </Box>

          <Flex w="full" align="center">
            <Spacer />
            {hasStampToday(cafe.id) ? (
              <Badge
                colorScheme="green"
                px={3}
                py={1}
                borderRadius="full"
                display="flex"
                alignItems="center"
              >
                <Icon as={CheckCircle} w={4} h={4} mr={1} />
                Claimed Today
              </Badge>
            ) : (
              <Button
                colorScheme="blue"
                size="sm"
                onClick={() => claimStamp(cafe.id, cafe.cafeName)}
                isLoading={claimingStamp}
                isDisabled={!userLocation}
                leftIcon={<Icon as={Star} />}
              >
                Claim Stamp
              </Button>
            )}
          </Flex>

          {!hasStampToday(cafe.id) && userLocation && (
            <Alert status="info" borderRadius="md">
              <AlertIcon as={Star} />
              <Text fontSize="sm">Visit this cafe to claim your stamp!</Text>
            </Alert>
          )}
        </VStack>
      </CardBody>
    </Card>
  );

  const StampCard = ({ stamp }) => (
    <Card mb={4} shadow="md" borderWidth="1px">
      <CardBody>
        <Flex align="start">
          <VStack align="start" spacing={2} flex="1">
            <Heading size="md" color="gray.800">
              {stamp.cafe_name}
            </Heading>
            <Text color="gray.600" fontSize="sm">
              {stamp.address}
            </Text>
            <HStack spacing={1} color="gray.500" fontSize="sm">
              <Icon as={Clock} w={4} h={4} />
              <Text>
                {new Date(stamp.created_at).toLocaleDateString()} at{" "}
                {new Date(stamp.created_at).toLocaleTimeString()}
              </Text>
            </HStack>
            {stamp.verification_distance && (
              <HStack spacing={1} color="gray.500" fontSize="sm">
                <Icon as={CheckCircle} w={4} h={4} />
                <Text>Verified at {stamp.verification_distance}m distance</Text>
              </HStack>
            )}
          </VStack>
          <Icon as={Star} w={8} h={8} color="yellow.400" />
        </Flex>
      </CardBody>
    </Card>
  );

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
        },
        (error) => {
          setError(
            "Unable to get your location. Please enable location services."
          );
          console.error("Geolocation error:", error);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }

    // Fetch all cafes on load
    fetchAllCafes();
  }, [fetchAllCafes]);

  return (
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #f8f3e9 0%, #e9dcc9 100%)"
      backgroundSize="200px"
    >
      {/* Header */}
      <Box bg="#FEF1C5" shadow="sm" borderBottomWidth="1px">
        <Container maxW="md" py={12}>
          <Flex align="center" justify="space-between">
            <IconButton
              as="a"
              href="/dashboard"
              my={3}
              mr={5}
              icon={<FaHome />}
              aria-label="Go back to home"
              bg="#3970B5"
              color="white"
              size="lg"
              shadow="dark-lg"
              _hover={{ shadow: "inner" }}
            >
              FiHiking
            </IconButton>
            <HStack spacing={5}>
              <Icon as={Coffee} w={14} h={14} color="#DC6739" />
              <VStack align="start" spacing={0}>
                <Heading
                  size="lg"
                  variant="plain"
                  fontFamily="darumadrop"
                  color="#DC6739"
                  fontSize={`4xl`}
                >
                  Café Passport
                </Heading>
                <Text color="gray.600" fontSize="m">
                  Collect stamps, discover cafes
                </Text>
              </VStack>
            </HStack>
            <Badge
              colorScheme="orange"
              px={3}
              py={1}
              borderRadius="full"
              display="flex"
              alignItems="center"
            >
              <Icon as={Award} w={4} h={4} mr={1} />
              {userStamps.length} stamps
            </Badge>
          </Flex>
        </Container>
      </Box>

      {/* Content */}
      <Container maxW="md" py={6}>
        {/* Error Message */}
        {error && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Location Status */}
        {!userLocation && (
          <Alert status="warning" mb={4} borderRadius="md">
            <AlertIcon />
            Location access needed to claim stamps
          </Alert>
        )}

        {/* Tabs */}
        <Tabs colorScheme="#FEF1C5" variant="enclosed">
          <TabList bg="white" borderRadius="lg" shadow="sm" p={1}>
            <Tab flex="1" _selected={{ bg: "blue.500", color: "white" }}>
              <Icon as={Coffee} w={4} h={4} mr={2} />
              Collect Stamps
            </Tab>
            <Tab
              flex="1"
              _selected={{ bg: "blue.500", color: "white" }}
              onClick={fetchUserStamps}
            >
              <Icon as={Star} w={4} h={4} mr={2} />
              My Stamps
            </Tab>
          </TabList>

          <TabPanels mt={4}>
            {/* Collect Stamps Tab */}
            <TabPanel p={0}>
              <VStack align="start" spacing={4}>
                <Heading
                  size="lg"
                  color="orange.800"
                  fontFamily="'Playfair Display', serif"
                  fontWeight="bold"
                  pb={2}
                >
                  Discover Cafés
                </Heading>
                <Text color="orange.700" fontSize="md" mb={4}>
                  Visit these cafés to collect stamps in your passport
                </Text>

                {loading ? (
                  <Center py={8} w="full">
                    <VStack spacing={4}>
                      <Spinner size="xl" color="orange.500" thickness="3px" />
                      <Text color="gray.600">Loading cafés...</Text>
                    </VStack>
                  </Center>
                ) : allCafes.length === 0 ? (
                  <Center py={8} w="full">
                    <VStack spacing={4}>
                      <Icon as={Coffee} w={12} h={12} color="gray.400" />
                      <Text color="gray.600">No cafés available</Text>
                      <Text color="gray.500" fontSize="sm">
                        Check back later for new cafés
                      </Text>
                      <Button
                        colorScheme="orange"
                        variant="outline"
                        size="sm"
                        onClick={fetchAllCafes}
                      >
                        Refresh
                      </Button>
                    </VStack>
                  </Center>
                ) : (
                  <VStack w="full" spacing={0}>
                    {allCafes.map((cafe) => (
                      <CafeCard key={cafe.id} cafe={cafe} />
                    ))}
                  </VStack>
                )}
              </VStack>
            </TabPanel>

            {/* My Stamps Tab */}
            <TabPanel p={0}>
              <VStack align="start" spacing={4}>
                <Heading size="lg" color="gray.800">
                  My Stamp Collection ({userStamps.length})
                </Heading>

                {userStamps.length === 0 ? (
                  <Center py={8} w="full">
                    <VStack spacing={4}>
                      <Icon as={Star} w={12} h={12} color="gray.400" />
                      <Text color="gray.600">No stamps collected yet</Text>
                      <Text color="gray.500" fontSize="sm">
                        Visit cafes to start collecting!
                      </Text>
                    </VStack>
                  </Center>
                ) : (
                  <VStack w="full" spacing={0}>
                    {userStamps.map((stamp) => (
                      <StampCard key={stamp.id} stamp={stamp} />
                    ))}
                  </VStack>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default CafePassport;
