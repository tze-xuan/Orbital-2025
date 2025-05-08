import React from "react";
import {
  Flex,
  Text,
  Image,
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react";
import tempPhoto from "../images/LoginPhoto.png";
import { LuUser, LuLock } from "react-icons/lu";

const Login = () => {
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  return (
    <Box width="100vw" height="100vh" bgColor="#FFCE58">
      <Flex justifyContent="center" alignItems="center" direction="column">
        <Text
          fontFamily="darumadrop"
          fontSize="8xl"
          color="#DC6739"
          marginTop="50px"
          marginBottom="10px"
        >
          Café Chronicles
        </Text>

        {/* Card */}
        <Flex
          bgColor="#FEF1C5"
          shadow="xl"
          width="650px"
          height="360px"
          borderRadius="30px"
          direction="column"
          overflow="hidden"
          paddingTop="20px"
        >
          <Text
            fontSize="5xl"
            fontFamily="afacad"
            color="#3E405B"
            fontWeight="bold"
            marginBottom="5px"
            marginLeft="50px"
          >
            LOGIN ID
          </Text>
          {/* Decor Line */}
          <Box bgColor="#3E405B" width="100%" height="20px"></Box>

          {/* Picture & Details */}
          <Flex
            direction="row"
            width="550px"
            height="100%"
            alignItems="center"
            justifyContent="center"
            marginLeft="50px"
          >
            <Image src={tempPhoto} width="180px" height="180px"></Image>

            <Box width="90px"></Box>

            {/* Username & Password*/}
            <Flex direction="column" gap="40px">
              {/* Username */}
              {/* TODO ADD EDGE CASES*/}
              <InputGroup size="lg">
                <InputLeftElement>
                  <LuUser color="#DC6739" />
                </InputLeftElement>
                <Input
                  variant="subtle"
                  color="#DC6739"
                  placeholder="Username"
                  _placeholder={{
                    color: "inherit",
                    fontFamily: "afacad",
                    fontSize: "xl",
                  }}
                />
              </InputGroup>

              {/* Password */}
              {/* TODO ADD EDGE CASES*/}
              <InputGroup size="lg">
                <InputLeftElement>
                  <LuLock color="#DC6739" />
                </InputLeftElement>
                <Input
                  type={show ? "text" : "password"}
                  color="#DC6739"
                  _placeholder={{
                    color: "inherit",
                    fontFamily: "afacad",
                    fontSize: "xl",
                  }}
                  placeholder="Enter password"
                  variant="subtle"
                />
                <InputRightElement width="5rem">
                  <Button
                    bg="white"
                    color="#DC6739"
                    onClick={handleClick}
                    fontFamily="afacad"
                    variant="link"
                    fontSize="lg"
                  >
                    {show ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Flex>
          </Flex>
        </Flex>

        {/* Login Button */}
        <Button
          asChild
          marginTop="25px"
          borderRadius="50px"
          height="50px"
          width="120px"
          fontSize="xl"
          fontFamily="afacad"
          bg="#3970B5"
          color="white"
          shadow="xl"
          _hover={{
            bg: "white",
            color: "#3970B5",
          }}
        >
          <a href="/home">Login</a>
        </Button>
        <Flex direction="row" marginTop="15px">
          <Text fontFamily="afacad" fontSize="lg">
            Don’t have an account?
          </Text>
          <Button
            variant="link"
            size="2xs"
            fontFamily="afacad"
            fontSize="lg"
            marginLeft="7px"
            marginRight="5px"
            marginTop="1px"
            color="#3E405B"
            _hover={{
              color: "#DC6739",
              textDecor: "underline",
            }}
          >
            <a href="/signup">Sign Up</a>
          </Button>
          <Text fontFamily="afacad" fontSize="lg">
            now!
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Login;
