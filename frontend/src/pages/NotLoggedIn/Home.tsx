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
          direction={{ base: "column", md: "row" }}
          bgColor="#FFCE58"
          width="100vw"
          height={{ base: "auto", md: "12vh" }}
          minHeight={{ base: "120px", md: "12vh" }}
          alignItems="center"
          justifyContent="center"
          gap={{ base: "2vh", md: "10vw" }}
          paddingY={{ base: "10vh", md: "10vh" }}
          paddingX={{ base: "4", md: "0" }}
        >
          <HomeSideBar />
          <NavButton
            as="a"
            href="/discovercafes"
            display={{ base: "none", md: "flex" }}
          >
            Discover Cafés
          </NavButton>
          <Button
            variant="plain"
            fontFamily="darumadrop"
            color="#DC6739"
            fontSize={{ base: "6vw", md: "min(4vw, 4vh)" }}
          >
            <a href="/">Café Chronicles</a>
          </Button>
          <NavButton display={{ base: "none", md: "flex" }}>button</NavButton>
          <NavButton
            bgColor="#80B29B"
            color="#FEF1C5"
            borderRadius="50px"
            border="1px"
            shadow="md"
            _hover={{ shadow: "dark-lg" }}
            fontSize={{ base: "sm", md: "md" }}
            px={{ base: "4", md: "6" }}
            minH="3vh"
          >
            <a href="/login">Login</a>
          </NavButton>
        </Flex>

        <Flex
          position="relative"
          height={{ base: "50vh", md: "90%" }}
          width="100%"
          justifyContent="center"
          alignItems="center"
          overflow="clip"
        >
          <MapWithoutInput />
        </Flex>

        {/* Recent Reviews Header */}
        <Flex
          direction={{ base: "column", md: "row" }}
          width="100vw"
          gap={{ base: "2vh", md: "5vw" }}
          justifyContent="center"
          alignItems="center"
          margin={{ base: "4vh", md: "2vh" }}
          px={{ base: "4", md: "0" }}
        >
          <Box
            height="4px"
            width={{ base: "20vw", md: "30vw" }}
            bgColor="#3e405b"
          />
          <Text
            fontSize={{ base: "3xl", md: "5xl" }}
            fontWeight="black"
            fontFamily="afacad"
            textAlign="center"
          >
            Recent Reviews
          </Text>
          <Box
            height="4px"
            width={{ base: "20vw", md: "30vw" }}
            bgColor="#3e405b"
          />
        </Flex>

        {/* Flex Container for HomePosts */}
        <Flex
          direction="row"
          overflowX="scroll"
          maxW="100vw"
          w="100%"
          flexShrink="0"
          px={{ base: "2", md: "0" }}
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
        <Flex
          bg="#DC6739"
          width="100vw"
          minH={{ base: "20vh", md: "40vh" }}
          marginTop="5vh"
        ></Flex>
      </Flex>
    </Wrap>
  );
};

export default Home;
