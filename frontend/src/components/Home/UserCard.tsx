import {
  HStack,
  VStack,
  Text,
  Avatar,
  Box,
  Heading,
  Flex,
} from "@chakra-ui/react";
import { FiUser, FiChevronRight } from "react-icons/fi";

export const UserCard = () => {
  return (
    <Box>
      {/* Title */}
      <Heading
        as="h3"
        size="md"
        fontFamily="Afacad"
        fontWeight="600"
        mb={2}
        color="#FEF1C5"
        mx={4}
      >
        My Account
      </Heading>

      {/* Card Content */}
      <Flex
        align="center"
        justify="space-between"
        gap={4}
        mb={4}
        p={3}
        bg="rgba(255,255,255,0.1)"
        borderRadius="lg"
      >
        <HStack spacing={4}>
          <Avatar
            size="md"
            bg="rgba(255,255,255,0.3)"
            icon={<FiUser size="20px" />}
            border="2px solid rgba(255,255,255,0.4)"
          />
          <VStack align="start" spacing={0} flex={1}>
            <Text fontSize="md" fontFamily="Afacad" fontWeight="600">
              @wlwx_15
            </Text>
            <Text fontSize="sm" fontFamily="Afacad" opacity={0.9}>
              wlwx15@gmail.com
            </Text>
          </VStack>
        </HStack>

        {/* Right arrow indicator */}
        <Box color="#FEF1C5" as="a" href="/account">
          <FiChevronRight size="20px" />
        </Box>
      </Flex>
    </Box>
  );
};

export default UserCard;
