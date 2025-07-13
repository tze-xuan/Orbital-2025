import { Flex, IconButton, Text } from "@chakra-ui/react";
import { FaHome } from "react-icons/fa";

const PageNotFound = () => {
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      h="80vh"
      w="100vw"
      gap={2}
    >
      <Text fontSize="9xl" fontFamily="darumadrop" color="#DC6739">
        404
      </Text>
      <Text fontSize="2xl" fontFamily="darumadrop">
        We are not ready to embark on this journey yet!
      </Text>
      <Text fontSize="2xl" fontFamily="darumadrop">
        Please head back to the previous route while we finish building this!
      </Text>
      <IconButton
        as="a"
        href="/dashboard"
        my={4}
        icon={<FaHome />}
        aria-label="Go back to home"
        bg="#3970B5"
        color="white"
        size="lg"
        shadow="dark-lg"
        _hover={{ shadow: "inner" }}
      >
        FiHiking
      </IconButton>
    </Flex>
  );
};

export default PageNotFound;
