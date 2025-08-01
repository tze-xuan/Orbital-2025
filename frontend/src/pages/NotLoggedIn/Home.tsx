import { Flex, Button, Image, Wrap, Text, Box } from "@chakra-ui/react";
import { NavButton } from "../../components/Buttons.tsx";
import { HomePosts } from "../../components/Home/HomePosts.tsx";
import { MapWithoutInput } from "../../components/Home/MapWithoutInput.tsx";
import HomeSideBar from "../../components/Home/HomeSideBar.tsx";
import Waffles from "../../images/wafflesthecat.jpg";

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
          <HomeSideBar />
          <NavButton as="a" href="/discovercafes">
            Discover Cafés
          </NavButton>
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

        <Flex
          position="relative" // Crucial for proper containment
          height="90%"
          width="100%"
          justifyContent="center"
          alignItems="center"
          overflow="clip"
        >
          <MapWithoutInput />
        </Flex>

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
            <Image src={Waffles} fit="cover"></Image>
          </HomePosts>
          <HomePosts>
            <Image src={Waffles} fit="cover"></Image>
          </HomePosts>
          <HomePosts>
            <Image src={Waffles} fit="cover"></Image>
          </HomePosts>
          <HomePosts>
            <Image src={Waffles} fit="cover"></Image>
          </HomePosts>
          <HomePosts>
            <Image src={Waffles} fit="cover"></Image>
          </HomePosts>
          <HomePosts>
            <Image src={Waffles} fit="cover"></Image>
          </HomePosts>
        </Flex>
        <Flex bg="#DC6739" width="100vw" minH="40vh" marginTop="5vh"></Flex>
      </Flex>
    </Wrap>
  );
};

export default Home;
