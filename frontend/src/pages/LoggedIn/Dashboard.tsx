import { Flex, Text, Button } from "@chakra-ui/react";
import { MapWithoutInput } from "../../components/Home/MapWithoutInput.tsx";
import DashboardSideBar from "../../components/Home/DashboardSideBar.tsx";
import { NavButton } from "../../components/Buttons.tsx";
import LogoutButton from "../NotLoggedIn/Logout.tsx";

const Dashboard = () => {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      direction="column"
      gap={2}
    >
      <Flex
        direction="row"
        width="100vw"
        gap="200px"
        justifyContent="center"
        marginTop="25px"
      >
        <DashboardSideBar />
        <Button
          variant="link"
          fontFamily="afacad"
          fontSize="2xl"
          fontWeight="medium"
          color="#3E405B"
          _hover={{ textColor: "#DC6739", textDecoration: "underline" }}
        >
          <a href="/cafes">Cafés</a>
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
          <a href="/maps">Maps</a>
        </Button>
        <NavButton>
          <LogoutButton />
        </NavButton>
      </Flex>

      <Text fontFamily="darumadrop" fontSize="8xl" color="#DC6739">
        Café Chronicles
      </Text>

      <Flex
        position="relative" // Crucial for proper containment
        height="80%"
        width="100%"
        justifyContent="center"
        alignItems="center"
        overflow="clip"
      >
        <MapWithoutInput />
      </Flex>
    </Flex>
  );
};

export default Dashboard;
