import React from "react";
import { Button, Flex, Text } from "@chakra-ui/react";

const Cafes = () => {
  return (
    <Flex alignItems="center" direction="column" gap="2vh" padding="3vh">
      <Button
        fontFamily="darumadrop"
        fontSize="5xl"
        color="#DC6739"
        variant="plain"
      >
        <a href="/home">Café Chronicles</a>
      </Button>

      <Text fontSize="3xl"> Cafes List hehe </Text>
      {/* Flex Container */}
      <Flex
        alignItems="center"
        maxH="70vh"
        overflowY="auto"
        scrollBehavior="smooth"
        direction="column"
        width="100%"
        gap="2vh"
      >
        {/* Container 1 for Cafe Items */}
        <Flex
          direction="column"
          bgColor="white"
          width="80%"
          alignItems="center"
          justifyContent="center"
          gap="1vh"
          padding="2vh"
          borderRadius="40px"
          shadow="2xl"
        >
          <Text fontSize="2xl">Cafe Name</Text>
          <Text fontSize="lg">Location</Text>
          <Button background="#DC6739">Edit</Button>
          <Button background="#DC6739">Delete</Button>
        </Flex>

        {/* Container 2 for Cafe Items */}
        <Flex
          direction="column"
          bgColor="white"
          width="80%"
          alignItems="center"
          justifyContent="center"
          gap="1vh"
          padding="2vh"
          borderRadius="40px"
          shadow="2xl"
        >
          <Text fontSize="2xl">Cafe Name</Text>
          <Text fontSize="lg">Location</Text>
          <Button background="#DC6739">Edit</Button>
          <Button background="#DC6739">Delete</Button>
        </Flex>

        {/* Container 3 for Cafe Items */}
        <Flex
          direction="column"
          bgColor="white"
          width="80%"
          alignItems="center"
          justifyContent="center"
          gap="1vh"
          padding="2vh"
          borderRadius="40px"
          shadow="2xl"
        >
          <Text fontSize="2xl">Cafe Name</Text>
          <Text fontSize="lg">Location</Text>
          <Button background="#DC6739">Edit</Button>
          <Button background="#DC6739">Delete</Button>
        </Flex>
      </Flex>

      {/* Add New Cafe Button */}
      <Button
        background="#3970B5"
        color="white"
        borderRadius="50px"
        width="50%"
      >
        Add New
      </Button>
    </Flex>
  );
};

export default Cafes;
