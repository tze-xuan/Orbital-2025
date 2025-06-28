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
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import Axios from "axios";

const Cafes = () => {
  const CAFE_API_ROUTE = "https://cafechronicles.vercel.app/api/cafes/";
  const [data, setData] = useState(null);

  // Handle edit cafe info
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef(null);
  const [cafeName, setCafeName] = useState("");
  const [cafeLocation, setCafeLocation] = useState("");
  const [editedId, setEditedId] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Helper Functions
  const handleEdit = async () => {
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
    } catch (error) {
      console.error("Error editing cafe:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(CAFE_API_ROUTE + id, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cafeName: cafeName,
          cafeLocation: cafeLocation,
        }),
      });
    } catch (error) {
      console.error("Error deleting cafe:", error);
    }
  };

  const handleAdd = async () => {
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
    } catch (error) {
      console.error("Error adding cafe:", error);
    }
  };

  const editIndex = (i: number) => {
    setEditedId(Object(data)[i].id);
    setCafeName(Object(data)[i].cafeName);
    setCafeLocation(Object(data)[i].cafeLocation);
  };

  const getData = async () => {
    const response = await Axios.get(CAFE_API_ROUTE);
    setData(response.data);
  };

  // Fetch data on initial render
  useEffect(() => {
    getData();
  }, []);

  // Add this new useEffect for modal-closed behavior
  useEffect(() => {
    if (!isAddModalOpen) {
      getData(); // Fetch fresh data after add-modal closes
    }
  }, [isAddModalOpen]); // Triggered when isAddModalOpen changes

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
          Object(data).map((cafe: any, index: any) => (
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
                  await getData();
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
        onClick={async () => {
          setCafeName("");
          setCafeLocation("");
          setIsAddModalOpen(true);
          onClose();
          await getData();
        }}
      >
        Add New
      </Button>

      {/* Edit cafe popup */}
      <Modal
        // initialFocusRef={initialRef}
        // finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Café</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired>
              <FormLabel>Café Name</FormLabel>
              <Input
                ref={initialRef}
                placeholder={cafeName}
                value={cafeName}
                onChange={(e) => setCafeName(e.target.value)}
              />
            </FormControl>

            <FormControl mt={4} isRequired>
              <FormLabel>Café Location</FormLabel>
              <Input
                placeholder={cafeLocation}
                value={cafeLocation}
                onChange={(e) => setCafeLocation(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleEdit}>
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
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Café</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired>
              <FormLabel>Café Name</FormLabel>
              <Input
                placeholder="Enter café name"
                value={cafeName}
                onChange={(e) => setCafeName(e.target.value)}
              />
            </FormControl>

            <FormControl mt={4} isRequired>
              <FormLabel>Café Location</FormLabel>
              <Input
                placeholder="Enter café location"
                value={cafeLocation}
                onChange={(e) => setCafeLocation(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleAdd}
              isDisabled={!cafeName || !cafeLocation}
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
