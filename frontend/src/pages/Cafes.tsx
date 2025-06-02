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
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import Axios from "axios";

const Cafes = () => {
  const [data, setData] = useState(null);
  // Handle edit cafe info
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef(null);
  const finalRef = React.useRef(null);
  const [cafeName, setCafeName] = useState("");
  const [cafeLocation, setCafeLocation] = useState("");
  const [editedId, setEditedId] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleEdit = async () => {
    try {
      await fetch(`http://localhost:5002/cafes/` + editedId, {
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
      await fetch(`http://localhost:5002/cafes/` + id, {
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

  // TODO
  const handleAdd = async () => {
    try {
      await fetch(`http://localhost:5002/cafes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cafeName: cafeName,
          cafeLocation: cafeLocation,
        }),
      });
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
    const response = await Axios.get("http://localhost:5002/cafes");
    setData(response.data);
  };

  useEffect(() => {
    getData();
  }, []);
  return (
    <Flex alignItems="center" direction="column" gap="2vh" padding="7vh">
      <Button
        fontFamily="darumadrop"
        fontSize="7xl"
        color="#DC6739"
        variant="plain"
        marginBottom="2vh"
      >
        <a href="/home">Café Chronicles</a>
      </Button>
      <Text fontSize="5xl"> Cafés </Text>
      {/* Flex Container */}
      <Flex
        alignItems="center"
        maxH="70vh"
        overflowY="auto"
        scrollBehavior="smooth"
        direction="column"
        width="100%"
        gap="2vh"
        padding="18px"
      >
        {data == null ||
          Object(data).map((cafe, index) => (
            <Flex
              key={index}
              direction="column"
              bgColor="white"
              width="80%"
              alignItems="center"
              justifyContent="center"
              gap="1vh"
              padding="2vh"
              borderRadius="40px"
              shadow="xl"
            >
              <Text fontSize="2xl">{cafe.cafeName}</Text>
              <Text fontSize="lg">{cafe.cafeLocation}</Text>
              <Button
                background="#DC6739"
                onClick={() => {
                  editIndex(index);
                  onOpen();
                }}
              >
                Edit
              </Button>
              <Button
                background="#DC6739"
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
        width="50%"
        onClick={async () => {
          setCafeName("");
          setCafeLocation("");
          setIsAddModalOpen(true);
          await getData();
          onClose();
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
