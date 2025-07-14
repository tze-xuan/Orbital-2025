import {
  Button,
  Flex,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Box,
  FormErrorMessage,
  useToast,
  InputGroup,
  InputLeftElement,
  IconButton,
  Tooltip,
  ButtonGroup,
  Badge,
  VStack,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import {
  FaBookmark,
  FaRegBookmark,
  FaLocationArrow,
  FaTimes,
} from "react-icons/fa";
import React, { useState, useEffect, useCallback } from "react";
import Axios from "axios";
import LocationFilterModal, {
  LocationResult,
  calculateDistance,
} from "../components/LocationFilterModal";
import { CafeType } from "../interfaces/CafeInterface";
import { Bookmark } from "../interfaces/BookmarkInterface";

const Cafes = () => {
  const CAFE_API_ROUTE = "https://cafechronicles.vercel.app/api/cafes/";
  const BOOKMARK_API_ROUTE = "https://cafechronicles.vercel.app/api/bookmarks/";
  const [data, setData] = useState<CafeType[] | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [showBookmarked, setShowBookmarked] = useState(false);
  const toast = useToast();

  // Location filter state - using LocationResult type
  const [filterRadius, setFilterRadius] = useState(5);
  const [userLocation, setUserLocation] = useState<LocationResult | null>(null);

  // Modals
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isLocationModalOpen,
    onOpen: onLocationModalOpen,
    onClose: onLocationModalClose,
  } = useDisclosure();

  // Edit cafe state
  const initialRef = React.useRef<HTMLInputElement>(null);
  const [cafeName, setCafeName] = useState("");
  const [cafeLocation, setCafeLocation] = useState("");
  const [editedId, setEditedId] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isValidatingAddress] = useState(false);

  // Get user ID from authentication or session
  const getUserId = async () => {
    try {
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        const user = JSON.parse(currentUser);
        setUserId(user.id);
      } else {
        setUserId(1);
      }
    } catch (error) {
      console.error("Error getting user ID:", error);
      setUserId(1);
    }
  };

  const handleEdit = async () => {
    if (!cafeName) return;

    try {
      await fetch(CAFE_API_ROUTE + editedId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cafeName: cafeName,
          cafeLocation: cafeLocation,
        }),
      });
      setCafeName("");
      setCafeLocation("");
      onClose();
      getData();
      toast({
        title: "Café updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error editing cafe:", error);
      toast({
        title: "Error updating café",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(CAFE_API_ROUTE + id, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      getData();
      toast({
        title: "Café deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting cafe:", error);
      toast({
        title: "Error deleting café",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAdd = async () => {
    if (!cafeName) return;

    try {
      const response = await fetch(CAFE_API_ROUTE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cafeName: cafeName,
          cafeLocation: cafeLocation,
        }),
      });
      if (!response.ok) throw new Error("Failed to add café");
      setCafeName("");
      setCafeLocation("");
      setIsAddModalOpen(false);
      await getData();
      toast({
        title: "Café added",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error adding cafe:", error);
      toast({
        title: "Error adding café",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const editIndex = (i: number) => {
    if (!data) return;
    setEditedId(data[i].id.toString());
    setCafeName(data[i].cafeName);
    setCafeLocation(data[i].cafeLocation);
    setLocationError("");
  };

  const getData = async () => {
    try {
      const response = await Axios.get(CAFE_API_ROUTE);
      console.log("API Response:", response.data); // Debug log
      setData(response.data);
    } catch (error) {
      console.error("Error fetching cafes:", error);
    }
  };

  const getBookmarks = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await Axios.get(`${BOOKMARK_API_ROUTE}user/${userId}`);
      setBookmarks(response.data);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  }, [userId]);

  const handleBookmark = async (cafeId: number) => {
    if (!userId) return;
    try {
      const isBookmarked = bookmarks.some(
        (bookmark: Bookmark) => bookmark.cafe_id === cafeId
      );

      if (isBookmarked) {
        await Axios.delete(
          `${BOOKMARK_API_ROUTE}user/${userId}/cafe/${cafeId}`
        );
        toast({
          title: "Bookmark removed",
          status: "info",
          duration: 2000,
          isClosable: true,
        });
      } else {
        await Axios.post(BOOKMARK_API_ROUTE, {
          user_id: userId,
          cafe_id: cafeId,
        });
        toast({
          title: "Café bookmarked",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }

      await getBookmarks();
    } catch (error) {
      console.error("Error handling bookmark:", error);
      toast({
        title: "Error updating bookmark",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const isBookmarked = (cafeId: number) => {
    return bookmarks.some((bookmark: Bookmark) => bookmark.cafe_id === cafeId);
  };

  const getBookmarkedCafes = (): CafeType[] => {
    if (!data || !bookmarks.length) return [];

    const bookmarkedCafeIds = bookmarks.map(
      (bookmark: Bookmark) => bookmark.cafe_id
    );
    return data.filter((cafe: CafeType) => bookmarkedCafeIds.includes(cafe.id));
  };

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

  // Enhanced filtering logic with better debugging
  const filteredCafes = (() => {
    const cafesToFilter = showBookmarked ? getBookmarkedCafes() : data || [];

    console.log("Starting filter process:");
    console.log("- Total cafes:", cafesToFilter.length);
    console.log("- Search term:", searchTerm);
    console.log("- User location:", userLocation);
    console.log("- Filter radius:", filterRadius);

    // First filter by search term if it exists
    let filtered = searchTerm
      ? cafesToFilter.filter((cafe: CafeType) => {
          const nameMatch = cafe.cafeName
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const locationMatch = cafe.cafeLocation
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          return nameMatch || locationMatch;
        })
      : cafesToFilter;

    console.log("- After search filter:", filtered.length);

    // Then filter by location if userLocation is set
    if (userLocation) {
      console.log("Applying location filter...");

      const locationFiltered = filtered.filter((cafe: CafeType) => {
        console.log(`Checking cafe: ${cafe.cafeName}`);
        console.log(`- Cafe location: ${cafe.cafeLocation}`);
        console.log(`- Cafe coordinates: lat=${cafe.lat}, lng=${cafe.lng}`);

        // Check if cafe has coordinates
        if (!cafe.lat || !cafe.lng) {
          console.log(
            `- No coordinates for ${cafe.cafeName}, excluding from location filter`
          );
          return false;
        }

        const cafeLat = parseFloat(cafe.lat.toString());
        const cafeLng = parseFloat(cafe.lng.toString());

        console.log(`- Parsed coordinates: lat=${cafeLat}, lng=${cafeLng}`);

        if (isNaN(cafeLat) || isNaN(cafeLng)) {
          console.log(`- Invalid coordinates for ${cafe.cafeName}`);
          return false;
        }

        const distance = calculateDistance(
          userLocation.coordinates.lat,
          userLocation.coordinates.lng,
          cafeLat,
          cafeLng
        );

        console.log(
          `- Distance: ${distance.toFixed(2)}km (limit: ${filterRadius}km)`
        );
        console.log(`- Within range: ${distance <= filterRadius}`);

        return distance <= filterRadius;
      });

      console.log("- After location filter:", locationFiltered.length);
      filtered = locationFiltered;
    }

    // Sort by relevance
    const sortedResults = filtered
      .map((cafe: CafeType) => {
        const name = cafe.cafeName.toLowerCase();
        const location = cafe.cafeLocation.toLowerCase();
        const search = searchTerm.toLowerCase();

        let score = 0;

        // Name matches
        if (name === search) score = 1000;
        else if (name.startsWith(search)) score = 100;
        else if (name.includes(` ${search}`) || name.includes(`${search} `))
          score = 50;
        else if (name.includes(search)) score = 10;

        // Location matches
        if (location.includes(search)) score += 20;

        // Prefer shorter names
        score += Math.max(0, 50 - name.length);

        // Boost score if within filter radius
        if (userLocation && cafe.lat && cafe.lng) {
          const distance = calculateDistance(
            userLocation.coordinates.lat,
            userLocation.coordinates.lng,
            parseFloat(cafe.lat.toString()),
            parseFloat(cafe.lng.toString())
          );
          if (distance <= filterRadius) {
            score += 30;
          }
        }
        return { ...cafe, relevanceScore: score };
      })
      .sort(
        (a: CafeType, b: CafeType) =>
          (b.relevanceScore || 0) - (a.relevanceScore || 0)
      );

    console.log("- Final filtered results:", sortedResults.length);
    return sortedResults;
  })();

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      getData();
      getBookmarks();
    }
  }, [userId, getBookmarks]);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCafeLocation(e.target.value);
    if (locationError) {
      setLocationError("");
    }
  };

  return (
    <Flex alignItems="center" direction="column" gap="4vh" padding="6vh">
      <Button
        fontFamily="darumadrop"
        fontSize="6xl"
        color="#DC6739"
        variant="plain"
      >
        <a href="/dashboard">Café Chronicles</a>
      </Button>
      <Flex
        direction="row"
        width="100vw"
        gap="5vw"
        justifyContent="center"
        alignItems="center"
      >
        <Box height="4px" width="35vw" bgColor="#3e405b" />
        <Text fontSize="6xl" fontWeight="black" fontFamily="afacad">
          Cafés
        </Text>
        <Box height="4px" width="35vw" bgColor="#3e405b" />
      </Flex>

      <ButtonGroup variant="outline">
        <Button
          colorScheme={!showBookmarked ? "orange" : "gray"}
          onClick={() => setShowBookmarked(false)}
          bg={!showBookmarked ? "#DC6739" : "white"}
          color={!showBookmarked ? "white" : "#DC6739"}
          borderColor="#DC6739"
          borderRadius="100px"
        >
          All Cafés
        </Button>
        <Button
          colorScheme={showBookmarked ? "orange" : "gray"}
          onClick={() => setShowBookmarked(true)}
          bg={showBookmarked ? "#DC6739" : "white"}
          color={showBookmarked ? "white" : "#DC6739"}
          borderColor="#DC6739"
          borderRadius="100px"
        >
          Bookmarked Cafés ({bookmarks.length})
        </Button>
      </ButtonGroup>

      {/* Search Bar */}
      <InputGroup width="100%" maxWidth="500px" bg="white" borderRadius="100px">
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="#DC6739" />
        </InputLeftElement>
        <Input
          placeholder={`Search ${
            showBookmarked ? "bookmarked " : ""
          }cafés by name...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          borderRadius="100px"
          variant="flushed"
          shadow="lg"
        />
      </InputGroup>

      {/* Location Filter Section */}
      <VStack spacing={2}>
        <Button
          leftIcon={<FaLocationArrow />}
          onClick={onLocationModalOpen}
          bg={userLocation ? "#DC6739" : "white"}
          color={userLocation ? "white" : "#DC6739"}
          borderColor="#DC6739"
          border="1px solid"
          borderRadius="100px"
          _hover={{
            bg: userLocation ? "#B8552E" : "#FFF5F5",
          }}
        >
          {userLocation
            ? `Filtering within ${filterRadius}km`
            : "Filter by Location"}
        </Button>

        {userLocation && (
          <Flex align="center" gap={2}>
            <Badge
              colorScheme="orange"
              variant="subtle"
              borderRadius="full"
              px={3}
              py={1}
            >
              📍 {userLocation.formattedAddress}
            </Badge>
            <IconButton
              aria-label="Clear location filter"
              icon={<FaTimes />}
              size="sm"
              variant="ghost"
              colorScheme="gray"
              onClick={handleClearLocationFilter}
            />
          </Flex>
        )}
      </VStack>

      {/* Results Info */}
      {(searchTerm || userLocation) && (
        <Text fontSize="sm" color="gray.600" textAlign="center">
          {filteredCafes.length} café{filteredCafes.length !== 1 ? "s" : ""}{" "}
          found
          {searchTerm && ` for "${searchTerm}"`}
          {userLocation && ` within ${filterRadius}km`}
        </Text>
      )}

      {showBookmarked && filteredCafes.length === 0 && (
        <Text fontSize="lg" color="gray.500" textAlign="center">
          {searchTerm || userLocation
            ? "No bookmarked cafés match your filters."
            : "No bookmarked cafés yet. Start exploring and bookmark your favorites!"}
        </Text>
      )}

      {!showBookmarked && filteredCafes.length === 0 && (
        <Text fontSize="lg" color="gray.500" textAlign="center">
          {searchTerm || userLocation
            ? "No cafés match your filters."
            : "No cafés found."}
        </Text>
      )}

      <Flex
        alignItems="center"
        maxH="50vh"
        overflowY="auto"
        scrollBehavior="smooth"
        direction="column"
        width="100%"
        gap="2vh"
        paddingBottom="18px"
      >
        {filteredCafes.map((cafe: CafeType, index: number) => (
          <Flex
            key={cafe.id}
            direction="column"
            bgColor="white"
            width="90%"
            height="25vh"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            padding="2vh"
            borderRadius="40px"
            shadow="xl"
            position="relative"
          >
            <Box position="absolute" top="15px" right="15px">
              <Tooltip
                label={
                  isBookmarked(cafe.id) ? "Remove bookmark" : "Bookmark café"
                }
                hasArrow
              >
                <IconButton
                  aria-label="Bookmark café"
                  icon={
                    isBookmarked(cafe.id) ? <FaBookmark /> : <FaRegBookmark />
                  }
                  size="sm"
                  colorScheme={isBookmarked(cafe.id) ? "orange" : "gray"}
                  variant="ghost"
                  onClick={() => handleBookmark(cafe.id)}
                />
              </Tooltip>
            </Box>

            <Text fontSize="2xl" fontFamily="afacad" fontWeight="black">
              {cafe.cafeName}
            </Text>
            <Text fontSize="lg" fontFamily="afacad">
              {cafe.cafeLocation}
            </Text>
            {userLocation && cafe.lat && cafe.lng && (
              <Text fontSize="sm" color="gray.500">
                {calculateDistance(
                  userLocation.coordinates.lat,
                  userLocation.coordinates.lng,
                  parseFloat(cafe.lat.toString()),
                  parseFloat(cafe.lng.toString())
                ).toFixed(1)}{" "}
                km away
              </Text>
            )}
            <Button
              background="#DC6739"
              margin="2"
              borderRadius="3xl"
              width="15vw"
              bgColor="#FFCE58"
              onClick={() => {
                editIndex(index);
                onOpen();
              }}
            >
              Edit
            </Button>
            <Button
              background="#DC6739"
              borderRadius="3xl"
              width="15vw"
              bgColor="#FFCE58"
              onClick={async () => {
                await handleDelete(cafe.id);
              }}
            >
              Delete
            </Button>
          </Flex>
        ))}
      </Flex>

      {!showBookmarked && (
        <Button
          background="#3970B5"
          color="white"
          borderRadius="50px"
          width="70%"
          onClick={() => {
            setCafeName("");
            setCafeLocation("");
            setLocationError("");
            setIsAddModalOpen(true);
          }}
        >
          Add New
        </Button>
      )}

      {/* Edit Modal */}
      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Café</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired isInvalid={!cafeName}>
              <FormLabel>Café Name</FormLabel>
              <Input
                ref={initialRef}
                placeholder={cafeName}
                value={cafeName}
                onChange={(e) => setCafeName(e.target.value)}
              />
              <FormErrorMessage>This field is required</FormErrorMessage>
            </FormControl>

            <FormControl mt={4} isRequired isInvalid={!!locationError}>
              <FormLabel>Café Location</FormLabel>
              <Input
                placeholder={cafeLocation}
                value={cafeLocation}
                onChange={handleLocationChange}
              />
              <FormErrorMessage>{locationError}</FormErrorMessage>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleEdit}
              isLoading={isValidatingAddress}
              isDisabled={!cafeName || !!locationError || isValidatingAddress}
            >
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setCafeName("");
          setCafeLocation("");
          setLocationError("");
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Café</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired isInvalid={!cafeName}>
              <FormLabel>Café Name</FormLabel>
              <Input
                placeholder="Enter café name"
                value={cafeName}
                onChange={(e) => setCafeName(e.target.value)}
              />
              <FormErrorMessage>This field is required</FormErrorMessage>
            </FormControl>

            <FormControl mt={4} isRequired isInvalid={!!locationError}>
              <FormLabel>Café Location</FormLabel>
              <Input
                placeholder="Enter café location"
                value={cafeLocation}
                onChange={handleLocationChange}
              />
              <FormErrorMessage>{locationError}</FormErrorMessage>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleAdd}
              isLoading={isValidatingAddress}
              isDisabled={!cafeName || !!locationError || isValidatingAddress}
            >
              Add Café
            </Button>
            <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Location Filter Modal */}
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

export default Cafes;
