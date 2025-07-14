import { ReactNode } from "react";
import { Flex, FlexProps, Text } from "@chakra-ui/react";

interface HomePostsProps extends FlexProps {
  children: ReactNode;
}

export const HomePosts = ({ children, ...props }: HomePostsProps) => {
  return (
    <Flex
      direction="column"
      {...props}
      alignItems="center"
      gap="1vh"
      minW="40vh"
    >
      <Flex
        bgColor="white"
        width="40vh"
        height="50vh"
        shadow="lg"
        justifyContent="center"
        alignItems="center"
        overflow="hidden"
        direction="column"
      >
        <Flex
          bgColor="black"
          width="90%"
          height="80%"
          marginTop="5%"
          shadow="lg"
          position="relative"
        >
          {children}
        </Flex>
        <Text fontFamily="afacad" fontSize="3xl" marginLeft="2vh">
          Placeholder
        </Text>
      </Flex>
    </Flex>
  );
};
