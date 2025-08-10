import { useState, useEffect, useCallback } from "react";
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
  Divider,
} from "@chakra-ui/react";
import { FaHome } from "react-icons/fa";
import { Coffee, Star, Clock, Award, CheckCircle, MapPin } from "lucide-react";
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

const CAFE_API_ROUTE = "https://cafechronicles.vercel.app/api/cafes";
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
      );
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
    <Card
      mb={6}
      shadow="lg"
      borderRadius="20px"
      bg="white"
      border="1px solid"
      borderColor="orange.100"
      overflow="hidden"
      transition="all 0.3s ease"
      _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
      width="50vw"
    >
      <CardBody p={6}>
        <VStack align="start" spacing={4}>
          <Box w="full">
            <Heading
              size="lg"
              color="#DC6739"
              mb={2}
              fontFamily="afacad"
              fontWeight="black"
            >
              {cafe.cafeName}
            </Heading>
            <HStack spacing={2} mb={3}>
              <Icon as={MapPin} w={4} h={4} color="gray.500" />
              <Text color="gray.600" fontSize="md" fontFamily="afacad">
                {cafe.cafeLocation}
              </Text>
            </HStack>
            <Divider borderColor="orange.100" />
          </Box>

          <Flex w="full" align="center" pt={2}>
            <Spacer />
            {hasStampToday(cafe.id) ? (
              <Badge
                colorScheme="green"
                px={4}
                py={2}
                borderRadius="full"
                display="flex"
                alignItems="center"
                fontSize="sm"
                fontFamily="afacad"
                fontWeight="bold"
              >
                <Icon as={CheckCircle} w={4} h={4} mr={2} />
                Claimed Today
              </Badge>
            ) : (
              <Button
                bg="#FFCE58"
                color="#DC6739"
                size="md"
                onClick={() => claimStamp(cafe.id, cafe.cafeName)}
                isLoading={claimingStamp}
                isDisabled={!userLocation}
                leftIcon={<Icon as={Star} />}
                borderRadius="full"
                px={6}
                py={3}
                fontFamily="afacad"
                fontWeight="bold"
                _hover={{ bg: "#FFD700", transform: "scale(1.05)" }}
                _active={{ transform: "scale(0.95)" }}
                transition="all 0.2s ease"
              >
                Claim Stamp
              </Button>
            )}
          </Flex>

          {!hasStampToday(cafe.id) && userLocation && (
            <Alert
              status="info"
              borderRadius="15px"
              bg="blue.50"
              border="1px solid"
              borderColor="blue.200"
            >
              <AlertIcon as={Star} color="blue.500" />
              <Text fontSize="sm" fontFamily="afacad" color="blue.700">
                Visit this cafe to claim your stamp!
              </Text>
            </Alert>
          )}
        </VStack>
      </CardBody>
    </Card>
  );

  const StampCard = ({ stamp }) => (
    <Card
      mb={6}
      shadow="lg"
      borderRadius="20px"
      bg="gradient-to-r from-yellow-50 to-orange-50"
      border="1px solid"
      borderColor="yellow.200"
      overflow="hidden"
      width="50vw"
    >
      <CardBody p={6}>
        <Flex align="start">
          <VStack align="start" spacing={3} flex="1">
            <Heading
              size="md"
              color="#DC6739"
              fontFamily="afacad"
              fontWeight="black"
            >
              {stamp.cafe_name}
            </Heading>
            <HStack spacing={2}>
              <Icon as={MapPin} w={4} h={4} color="gray.500" />
              <Text color="gray.600" fontSize="sm" fontFamily="afacad">
                {stamp.address}
              </Text>
            </HStack>
            <HStack spacing={2} color="gray.500" fontSize="sm">
              <Icon as={Clock} w={4} h={4} />
              <Text fontFamily="afacad">
                {new Date(stamp.created_at).toLocaleDateString()} at{" "}
                {new Date(stamp.created_at).toLocaleTimeString()}
              </Text>
            </HStack>
            {stamp.verification_distance && (
              <HStack spacing={2} color="green.600" fontSize="sm">
                <Icon as={CheckCircle} w={4} h={4} />
                <Text fontFamily="afacad">
                  Verified at {stamp.verification_distance}m distance
                </Text>
              </HStack>
            )}
          </VStack>
          <Box
            bg="yellow.400"
            borderRadius="full"
            p={3}
            shadow="lg"
            transform="rotate(15deg)"
            _hover={{ transform: "rotate(0deg)" }}
            transition="transform 0.3s ease"
          >
            <Icon as={Star} w={8} h={8} color="white" />
          </Box>
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
    <Box minH="100vh">
      {/* Header */}
      <Box bg="white" shadow="xl" borderBottomWidth="2px">
        <Container maxW="md" py={8}>
          <Flex align="center" justify="center">
            <IconButton
              as="a"
              href="/dashboard"
              icon={<FaHome />}
              aria-label="Go back to home"
              bg="#DC6739"
              color="white"
              size="lg"
              borderRadius="full"
              shadow="lg"
              _hover={{ bg: "#B8562E", transform: "scale(1.1)" }}
              _active={{ transform: "scale(0.9)" }}
              transition="all 0.2s ease"
            />
          </Flex>
        </Container>
      </Box>

      {/* Content */}
      <Container maxW="md" py={8}>
        {/* Error Message */}
        {error && (
          <Alert
            status="error"
            mb={6}
            borderRadius="15px"
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
          >
            <AlertIcon />
            <Text fontFamily="afacad">{error}</Text>
          </Alert>
        )}

        {/* Location Status */}
        {!userLocation && (
          <Alert
            status="warning"
            mb={6}
            borderRadius="15px"
            bg="yellow.50"
            border="1px solid"
            borderColor="yellow.200"
          >
            <AlertIcon />
            <Text fontFamily="afacad">
              Location access needed to claim stamps
            </Text>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs colorScheme="orange" variant="soft-rounded">
          <TabList bg="white" borderRadius="20px" shadow="lg" p={2} mb={6}>
            <Tab
              flex="1"
              fontFamily="afacad"
              fontWeight="bold"
              _selected={{ bg: "#DC6739", color: "white" }}
              borderRadius="15px"
              mx={1}
            >
              <Icon as={Coffee} w={5} h={5} mr={2} />
              Collect Stamps
            </Tab>
            <Tab
              flex="1"
              fontFamily="afacad"
              fontWeight="bold"
              _selected={{ bg: "#DC6739", color: "white" }}
              borderRadius="15px"
              mx={1}
              onClick={fetchUserStamps}
            >
              <Icon as={Star} w={5} h={5} mr={2} />
              My Stamps
            </Tab>
          </TabList>

          <TabPanels>
            {/* Collect Stamps Tab */}
            <TabPanel p={0}>
              <VStack align="start" spacing={6}>
                <Flex dir="row" width="100%" gap={20} alignItems="center">
                  <VStack spacing={1}>
                    <HStack spacing={3}>
                      <Icon as={Coffee} w={10} h={10} color="#DC6739" />
                      <Heading
                        size="xl"
                        fontFamily="afacad"
                        fontWeight="black"
                        color="#DC6739"
                        fontSize="3xl"
                        letterSpacing="tight"
                      >
                        Café Passport
                      </Heading>
                    </HStack>
                    <Text
                      color="gray.600"
                      fontSize="md"
                      fontFamily="afacad"
                      fontWeight="medium"
                    >
                      Collect stamps, discover cafes
                    </Text>
                  </VStack>
                  <Badge
                    bg="#FFCE58"
                    color="#DC6739"
                    px={4}
                    py={2}
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    fontSize="sm"
                    fontFamily="afacad"
                    fontWeight="bold"
                    shadow="md"
                    height="5vh"
                  >
                    <Icon as={Award} w={4} h={4} mr={2} />
                    {userStamps.length}
                  </Badge>
                </Flex>

                {loading ? (
                  <Center py={12} w="full">
                    <VStack spacing={4}>
                      <Spinner size="xl" color="#DC6739" thickness="4px" />
                      <Text color="gray.600" fontFamily="afacad" fontSize="lg">
                        Loading cafés...
                      </Text>
                    </VStack>
                  </Center>
                ) : allCafes.length === 0 ? (
                  <Center py={12} w="full">
                    <VStack spacing={6}>
                      <Icon as={Coffee} w={16} h={16} color="gray.400" />
                      <VStack spacing={2}>
                        <Text
                          color="gray.600"
                          fontFamily="afacad"
                          fontSize="lg"
                          fontWeight="bold"
                        >
                          No cafés available
                        </Text>
                        <Text
                          color="gray.500"
                          fontSize="md"
                          fontFamily="afacad"
                        >
                          Check back later for new cafés
                        </Text>
                      </VStack>
                      <Button
                        bg="#FFCE58"
                        color="#DC6739"
                        variant="solid"
                        size="md"
                        onClick={fetchAllCafes}
                        borderRadius="full"
                        px={6}
                        fontFamily="afacad"
                        fontWeight="bold"
                        _hover={{ bg: "#FFD700" }}
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
              <VStack align="start" spacing={6}>
                <Box>
                  <Heading
                    size="xl"
                    color="#DC6739"
                    fontFamily="afacad"
                    fontWeight="black"
                  >
                    My Stamp Collection ({userStamps.length})
                  </Heading>
                </Box>

                {userStamps.length === 0 ? (
                  <Center py={12} w="full">
                    <VStack spacing={6}>
                      <Icon as={Star} w={16} h={16} color="gray.400" />
                      <VStack spacing={2}>
                        <Text
                          color="gray.600"
                          fontFamily="afacad"
                          fontSize="lg"
                          fontWeight="bold"
                        >
                          No stamps collected yet
                        </Text>
                        <Text
                          color="gray.500"
                          fontSize="md"
                          fontFamily="afacad"
                        >
                          Visit cafes to start collecting!
                        </Text>
                      </VStack>
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
