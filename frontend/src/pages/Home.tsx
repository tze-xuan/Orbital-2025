import { Flex, Button } from "@chakra-ui/react";
import { NavButton } from "../components/Buttons.tsx";

const Home = () => {
  return (
    <Flex height="100vh" width="100vw">
      <Flex
        direction="row"
        bgColor="#FFCE58"
        width="100vw"
        height="14vh"
        alignItems="center"
        justifyContent="center"
        gap="10vw"
      >
        <NavButton>button</NavButton>
        <NavButton>button</NavButton>
        <Button
          variant="plain"
          fontFamily="darumadrop"
          color="#DC6739"
          fontSize="3xl"
        >
          <a href="/">Café Chronicles</a>
        </Button>
        <NavButton>button</NavButton>
        <NavButton
          bgColor="#80B29B"
          color="#FEF1C5"
          borderRadius="50px"
          border="1px"
          shadow="md"
          _hover={{ shadow: "dark-lg" }}
        >
          <a href="/login">Login</a>
        </NavButton>
      </Flex>
    </Flex>
  );
};

export default Home;
