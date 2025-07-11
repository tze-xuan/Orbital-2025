import { Flex, Text, Button } from "@chakra-ui/react";
import { Maps } from "../components/Map.tsx";

const Dashboard = () => {
  return (
    <Flex justifyContent="center" alignItems="center" direction="column">
      <Flex
        direction="row"
        width="100vw"
        gap="200px"
        justifyContent="center"
        marginTop="25px"
      >
        {/* TODO TIDY UP BUTTONS W CONST */}
        <Button
          variant="link"
          fontFamily="afacad"
          fontSize="2xl"
          fontWeight="medium"
          color="#3E405B"
          _hover={{ textColor: "#DC6739", textDecoration: "underline" }}
        >
          sidebar
        </Button>
        <Button
          variant="link"
          fontFamily="afacad"
          fontSize="2xl"
          fontWeight="medium"
          color="#3E405B"
          _hover={{ textColor: "#DC6739", textDecoration: "underline" }}
        >
          <a href="/cafes">Cafes</a>
        </Button>
        <Button
          variant="link"
          fontFamily="afacad"
          fontSize="2xl"
          fontWeight="medium"
          color="#3E405B"
          _hover={{ textColor: "#DC6739", textDecoration: "underline" }}
        >
          <a href="/community">Our Community</a>
        </Button>
        <Button
          variant="link"
          fontFamily="afacad"
          fontSize="2xl"
          fontWeight="medium"
          color="#3E405B"
          _hover={{ textColor: "#DC6739", textDecoration: "underline" }}
        >
          button3
        </Button>
        <Button
          variant="link"
          fontFamily="afacad"
          fontSize="2xl"
          fontWeight="medium"
          color="#3E405B"
          _hover={{ textColor: "#DC6739", textDecoration: "underline" }}
        >
          <a href="/">logout</a>
        </Button>
      </Flex>

      <Text fontFamily="darumadrop" fontSize="8xl" color="#DC6739">
        Café Chronicles
      </Text>

      <Maps></Maps>
    </Flex>
  );
};

export default Dashboard;
