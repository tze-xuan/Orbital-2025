import React from "react";
import {
  Flex,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react";
import { LuUser, LuLock } from "react-icons/lu";

const Login = () => {
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);

  return (
    <Flex
      direction="column"
      bgColor="#FFCE58"
      width="100vw"
      height="100vh"
      align="center"
      justify="center"
      gap="3vh"
    >
      <Text
        fontFamily="darumadrop"
        fontSize="430%"
        maxW="80vw"
        color="#DC6739"
        textAlign="center"
      >
        Café Chronicles
      </Text>

      {/* Login Card */}
      <Flex
        bgColor="#FEF1C5"
        shadow="xl"
        minWidth="320px"
        width="40vw"
        height="42vh"
        borderRadius="30px"
        direction="column"
        gap="3vh"
        justifyContent="center"
        alignItems="center"
      >
        <Text
          fontSize="6vh"
          fontFamily="afacad"
          color="#3E405B"
          fontWeight="bold"
          textAlign="center"
        >
          LOGIN ID
        </Text>

        {/* Decorative Line */}
        <Flex bgColor="#3E405B" width="100%" height="1vh" marginBottom="1vh" />

        {/* Login Form */}
        <Flex direction="column" gap="3vh" width="80%">
          {/* Username Input */}
          {/* TODO ADD EDGE CASES*/}
          <InputGroup size="lg">
            <InputLeftElement>
              <LuUser color="#DC6739" />
            </InputLeftElement>
            <Input
              variant="subtle"
              color="#DC6739"
              border="1px solid black"
              borderRadius="50px"
              placeholder="Username"
              _placeholder={{
                color: "inherit",
                fontFamily: "afacad",
                fontSize: "xl",
              }}
            />
          </InputGroup>

          {/* Password Input */}
          {/* TODO ADD EDGE CASES*/}
          <InputGroup size="lg">
            <InputLeftElement>
              <LuLock color="#DC6739" />
            </InputLeftElement>
            <Input
              type={show ? "text" : "password"}
              color="#DC6739"
              border="1px solid black"
              borderRadius="50px"
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

      {/* Login Button */}
      <Button
        as="a"
        href="/home"
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
        Login
      </Button>

      {/* Sign Up Link */}
      <Flex direction="row" gap="4px">
        <Text fontFamily="afacad" fontSize="lg">
          Don’t have an account?
        </Text>
        <Button
          variant="link"
          size="2xs"
          fontFamily="afacad"
          fontSize="lg"
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
  );
};

export default Login;
