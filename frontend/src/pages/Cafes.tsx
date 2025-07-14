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
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import React, { useState, useEffect } from "react";
import Axios from "axios";

const Cafes = () => {
  const CAFE_API_ROUTE = "https://cafechronicles.vercel.app/api/cafes/";
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useToast();

  // Handle edit cafe info
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef(null);
  const [cafeName, setCafeName] = useState("");
  const [cafeLocation, setCafeLocation] = useState("");
  const [editedId, setEditedId] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);

  // Helper Functions
  const validateLocation = async (location: string) => {
    if (!location.trim()) {
      setLocationError("This field is required");
      return false;
    }

    setIsValidatingAddress(true);
    try {
      const response = await Axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          location
        )}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );

      if (response.data.results.length === 0) {
        setLocationError(
          "Invalid address. Please copy the exact address from Google Maps."
        );
        return false;
      }

      const { lat, lng } = response.data.results[0].geometry.location;
      if (!lat || !lng) {
        setLocationError("Invalid coordinates");
        return false;
      }

      setLocationError("");
      return true;
    } catch (error) {
      console.error("Geocoding error:", error);
      setLocationError("Error validating address");
      return false;
    } finally {
      setIsValidatingAddress(false);
    }
  };

  const handleEdit = async () => {
    if (!cafeName || !(await validateLocation(cafeLocation))) return;

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
      console.error("Error editing cafe:", error.response?.data);
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
    if (!cafeName || !(await validateLocation(cafeLocation))) return;

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
    setEditedId(Object(data)[i].id);
    setCafeName(Object(data)[i].cafeName);
    setCafeLocation(Object(data)[i].cafeLocation);
    setLocationError("");
  };

  const getData = async () => {
    const response = await Axios.get(CAFE_API_ROUTE);
    setData(response.data);
  };

  // Filter and sort cafes based on search term accuracy
  const filteredCafes = data
    ? Object(data)
        .filter((cafe: any) =>
          cafe.cafeName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((cafe: any) => {
          const name = cafe.cafeName.toLowerCase();
          const search = searchTerm.toLowerCase();

          // Calculate relevance score
          let score = 0;

          // Exact match gets highest score
          if (name === search) score = 1000;
          // Starts with search term gets high score
          else if (name.startsWith(search)) score = 100;
          // Contains search term as whole word gets medium score
          else if (name.includes(` ${search}`) || name.includes(`${search} `))
            score = 50;
          // Contains search term gets base score
          else if (name.includes(search)) score = 10;

          // Bonus for shorter names (more specific matches)
          score += Math.max(0, 50 - name.length);

          return { ...cafe, relevanceScore: score };
        })
        .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
    : [];

  // Fetch data on initial render
  useEffect(() => {
    getData();
  }, []);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCafeLocation(e.target.value);
    if (locationError) {
      setLocationError("");
    }
  };

  const handleLocationBlur = async () => {
    if (cafeLocation.trim()) {
      await validateLocation(cafeLocation);
    }
  };

  return (
    <Flex alignItems="center" direction="column" gap="4svh" padding="6vh">
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

      {/* Search Bar */}
      <InputGroup width="70%" maxWidth="500px" bg="white" borderRadius="100px">
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="#DC6739" />
        </InputLeftElement>
        <Input
          placeholder="Search cafés by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          borderRadius="100px"
          variant="flushed"
          shadow="lg"
        />
      </InputGroup>

      {/* Flex Container */}
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
        {data == null ||
          filteredCafes.map((cafe: any, index: any) => (
            <Flex
              key={index}
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
            >
              <Text fontSize="2xl" fontFamily="afacad" fontWeight="black">
                {cafe.cafeName}
              </Text>
              <Text fontSize="lg" fontFamily="afacad">
                {cafe.cafeLocation}
              </Text>
              <Button
                background="#DC6739"
                margin="2"
                borderRadius="3xl"
                width="15vw"
                bgColor="#FFCE58"
                onClick={() => {
                  editIndex(Object(data).indexOf(cafe));
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

      {/* Add New Cafe Button */}
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

      {/* Edit cafe popup */}
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
                onBlur={handleLocationBlur}
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

      {/* Add Cafe Pop Up */}
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
                onBlur={handleLocationBlur}
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
    </Flex>
  );
};

export default Cafes;
