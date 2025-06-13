import { Flex, Button, Image, Wrap, Text, Box } from "@chakra-ui/react";
import { NavButton } from "../components/Buttons.tsx";
import { HomePosts } from "../components/HomePosts.tsx";
import { default as Map } from "../images/Map.png";
import { default as waffles } from "../images/wafflesthecat.jpg";

const Home = () => {
  return (
    <Wrap align="center">
      <Flex height="100vh" width="100vw" direction="column" alignItems="center">
        {/* Header */}
        <Flex
          direction="row"
          bgColor="#FFCE58"
          width="100vw"
          height="12vh"
          alignItems="center"
          justifyContent="center"
          gap="10vw"
          paddingY="5vh"
        >
          <NavButton>button</NavButton>
          <NavButton>button</NavButton>
          <Button
            variant="plain"
            fontFamily="darumadrop"
            color="#DC6739"
            fontSize={`min(4vw, 4vh)`}
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

        <Text fontFamily="afacad" fontSize="3xl" margin="2vh">
          Discover Cafés Nearby!
        </Text>
        <Flex></Flex>

        <Image src={Map} width="100%"></Image>

        {/* Recent Reviews Header */}
        <Flex
          direction="row"
          width="100vw"
          gap="5vw"
          justifyContent="center"
          alignItems="center"
          margin="2vh"
        >
          <Box height="4px" width="30vw" bgColor="#3e405b" />
          <Text
            fontSize="5xl"
            fontWeight="black"
            fontFamily="afacad"
            textAlign="center"
          >
            Recent Reviews
          </Text>
          <Box height="4px" width="30vw" bgColor="#3e405b" />
        </Flex>

        {/* Flex Container for HomePosts */}
        <Flex
          direction="row"
          overflowX="scroll"
          maxW="100vw"
          w="100%"
          flexShrink="0"
        >
          <HomePosts>
            <Image src={waffles} fit="cover"></Image>
          </HomePosts>
          <HomePosts>
            <Image src={waffles} fit="cover"></Image>
          </HomePosts>
          <HomePosts>
            <Image src={waffles} fit="cover"></Image>
          </HomePosts>
          <HomePosts>
            <Image src={waffles} fit="cover"></Image>
          </HomePosts>
          <HomePosts>
            <Image src={waffles} fit="cover"></Image>
          </HomePosts>
          <HomePosts>
            <Image src={waffles} fit="cover"></Image>
          </HomePosts>
        </Flex>
        <Flex bg="#DC6739" width="100vw" minH="40vh" marginTop="5vh"></Flex>
      </Flex>
    </Wrap>
  );
};

export default Home;
