import React, { ChangeEvent } from "react";
import {
  Flex,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { LuUser, LuLock } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export interface Values {
  username: string;
  password: string;
}

export interface Errors {
  username?: string; // optional
  password?: string; // optional
  general?: string;
}

async function LoginValidation(values: Values) {
  const errors: Errors = {};

  // Username validation
  if (!values.username) {
    errors.username = "Username is required";
  } else {
    const isAvailable = await checkUsernameAvailability(values.username);
    if (isAvailable) {
      errors.username = "Invalid username";
    }
  }

  // Password validation
  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }
  return errors;
}

const checkUsernameAvailability = async (username: string) => {
  try {
    // Add cache-busting parameter to prevent stale responses
    const cacheBuster = Date.now();
    const url = `https://cafechronicles.vercel.app/api/auth/check-username?username=${encodeURIComponent(
      username.trim().toLowerCase()
    )}&_=${cacheBuster}`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-cache", // Prevent browser caching
    });

    if (!response.ok) throw new Error("Username check failed");
    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error("Username check failed:", error);
    throw error; // Treat errors as unavailable
  }
};

export async function SignupValidation(values: Values): Promise<Errors> {
  const errors: Errors = {};
  const username = values.username.trim().toLowerCase();

  // Username validation
  if (!username) {
    errors.username = "Username is required";
  } else if (username.length < 3) {
    errors.username = "Username must be at least 3 characters";
  } else {
    try {
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        errors.username = "Username is already taken";
      }
    } catch (error) {
      // Add specific error handling
      console.error("Username availability check failed:", error);
      errors.username =
        "Username verification service unavailable. Please try again later.";
    }
  }

  // Password validation
  if (!values.password) {
    errors.password = "Password is required";
  } else {
    if (values.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    } else if (!/[A-Z]/.test(values.password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(values.password)) {
      errors.password = "Password must contain at least one lowercase letter";
    } else if (!/\d/.test(values.password)) {
      errors.password = "Password must contain at least one digit";
    } else if (!/^[a-zA-Z0-9]+$/.test(values.password)) {
      errors.password = "Password can only contain letters and numbers";
    }
  }

  return errors;
}

const Login = () => {
  const [show, setShow] = React.useState(false);
  const [values, setValues] = React.useState<Values>({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const toast = useToast();

  const [errors, setErrors] = React.useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));

    // Clear specific error
    if (name === "username" && errors.username) {
      setErrors((prev) => ({ ...prev, username: undefined }));
    } else if (name === "password" && errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }

    // Clear general error
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  const handleClick = () => {
    setShow(!show);
    axios.post("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const validationErrors = await LoginValidation(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setIsSubmitting(false);
      return;
    }

    const normalizedValues = {
      username: values.username.trim().toLowerCase(),
      password: values.password,
    };

    try {
      const response = await axios.post(
        "https://cafechronicles.vercel.app/api/auth/login",
        normalizedValues,
        { withCredentials: true }
      );

      if (response.data.message === "Login successful") {
        toast({
          title: "Logged in successfully!",
          description: "Redirecting to homepage...",
          status: "success",
          duration: 2000, // show for 2 seconds
          isClosable: true,
          onCloseComplete: () => navigate("/dashboard"),
        });
        
      } else {
        toast({
          title: "Login Failed",
          description: response.data.message || "Unknown error occurred",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      let errorMessage = "An unexpected error occurred";

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          errorMessage =
            err.response.data?.message || "Invalid username or password";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = "Login failed. Please try again.";
        }
      }

      // Show error toast
      toast({
        title: "Login Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
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
              placeholder="Username"
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

      <form
        onSubmit={handleSubmit}
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        {/* Login Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          // as="a"
          // href="/home"
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
      </form>

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
