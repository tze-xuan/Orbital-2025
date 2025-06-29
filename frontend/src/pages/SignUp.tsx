import React, { ChangeEvent } from "react";
import {
  Flex,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  useToast,
  FormErrorMessage,
  Box,
} from "@chakra-ui/react";
import { LuUser, LuLock } from "react-icons/lu";
import { Values, Errors, SignupValidation } from "./Login.tsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [show, setShow] = React.useState(false);
  const [values, setValues] = React.useState<Values>({
    username: "",
    password: "",
  });
  const [errors, setErrors] = React.useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const valuesRef = React.useRef(values);
  valuesRef.current = values;

  const handleClick = () => setShow(!show);

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const newValues = {
      ...valuesRef.current,
      [event.target.name]: event.target.value,
    };
    setValues(newValues);
    setErrors((prev) => ({ ...prev, username: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const validationErrors = await SignupValidation(valuesRef.current);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setIsSubmitting(false);
      return;
    }

    try {
      const normalizedValues = {
        ...values,
        username: values.username.trim().toLowerCase(),
      };
      const response = await axios.post(
        "http://localhost:5002/api/auth/signup",
        normalizedValues
      );

      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Account created successfully!",
          description: "Redirecting to login...",
          status: "success",
          duration: 2000, // show for 2 seconds
          isClosable: true,
          onCloseComplete: () => navigate("/"),
        });
      }
    } catch (err) {
      console.log(err);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setErrors((prev) => ({
            ...prev,
            username: "Username is already taken",
          }));
        } else {
          toast({
            title: "Error",
            description: err.response?.data?.message || "An error occurred",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex
      direction="column"
      bgColor="#3970B5"
      width="100vw"
      height="100vh"
      align="center"
      justify="center"
      gap="2vh"
    >
      <Text
        fontFamily="darumadrop"
        fontSize="430%"
        maxW="80vw"
        color="#FFCE58"
        textAlign="center"
      >
        Café Chronicles
      </Text>

      {/* Sign Up Card */}
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
        marginY="2vh"
      >
        <Text
          fontSize="6vh"
          fontFamily="afacad"
          color="#3E405B"
          fontWeight="bold"
          textAlign="center"
        >
          SIGN UP
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
              name="username"
              value={values.username}
              onChange={handleInput}
              variant="subtle"
              color="#DC6739"
              border="1px solid black"
              borderRadius="50px"
              placeholder="Enter username"
              _placeholder={{
                color: "inherit",
                fontFamily: "afacad",
                fontSize: "xl",
              }}
            />
          </InputGroup>

          <FormErrorMessage
            mt="-1"
            mb={0}
            ml={1}
            fontSize="sm"
            lineHeight="tight"
          >
            {errors.username}
          </FormErrorMessage>

          {errors.username && (
            <Text color="red.500" mt={1} ml={2} fontSize="sm">
              {errors.username}
            </Text>
          )}

          {/* Password Input */}
          {/* TODO ADD EDGE CASES*/}
          <InputGroup size="lg">
            <InputLeftElement>
              <LuLock color="#DC6739" />
            </InputLeftElement>
            <Input
              type={show ? "text" : "password"}
              name="password"
              value={values.password}
              onChange={handleInput}
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

          {errors.password && (
            <Text color="red.500" mt={1} ml={2} fontSize="sm">
              {errors.password}
            </Text>
          )}
        </Flex>
      </Flex>

      <Box
        as="form"
        onSubmit={handleSubmit}
        width="100%"
        display="flex"
        justifyContent="center"
      >
        {/* Signup Button */}
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          borderRadius="50px"
          height="50px"
          width="120px"
          fontSize="xl"
          fontFamily="afacad"
          bg="#80B29B"
          color="white"
          shadow="xl"
          _hover={{
            bg: "white",
            color: "#3970B5",
          }}
        >
          Register
        </Button>
      </Box>

      {/* Login Link */}
      <Flex direction="row" gap="4px">
        <Text fontFamily="afacad" fontSize="lg">
          Already have an account?
        </Text>
        <Button
          variant="link"
          size="2xs"
          fontFamily="afacad"
          fontSize="lg"
          color="#FFCE58"
          _hover={{
            color: "#DC6739",
            textDecor: "underline",
          }}
        >
          <a href="/login">Log In</a>
        </Button>
      </Flex>
    </Flex>
  );
};

export default SignUp;
