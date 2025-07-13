import { Flex, Text } from "@chakra-ui/react";
import { MapWithInput } from "../components/MapWithInput";

const Maps = () => {
  return (
    <>
      <Text
        fontFamily="afacad"
        fontSize="4xl"
        color="#DC6739"
        marginY={7}
        marginX={10}
        fontWeight="bold"
      >
        Cafés Nearby
      </Text>
      <Flex direction="column" gap={4}>
        <Flex
          position="relative" // Crucial for proper containment
          height="40%"
          width="100%"
          justifyContent="center"
          alignItems="center"
          overflow="clip"
        >
          <MapWithInput />
        </Flex>
      </Flex>
    </>
  );
};

export default Maps;
