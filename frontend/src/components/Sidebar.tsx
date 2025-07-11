import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  HStack,
  Text,
  Avatar,
  Box,
  Badge,
  IconButton,
} from "@chakra-ui/react";
import { RxHamburgerMenu } from "react-icons/rx";
import {
  FiBook,
  FiMap,
  FiAward,
  FiCoffee,
  FiUsers,
  FiEdit3,
  FiUser,
} from "react-icons/fi";

const CafeChroniclesSidebar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const menuItems = [
    { label: "My Passport", icon: FiBook },
    { label: "My Routes", icon: FiMap },
    { label: "Achievements", icon: FiAward, badge: 3 },
    { label: "Discover Cafés", icon: FiCoffee, isActive: true },
    { label: "Our Community", icon: FiUsers },
    { label: "My Journal", icon: FiEdit3 },
  ];

  return (
    <>
      <IconButton
        icon={<RxHamburgerMenu />}
        onClick={onOpen}
        _hover={{ color: "#DC6739" }}
        color="#3E405B"
        aria-label="Open menu"
        size="lg"
        variant="subtle"
      />

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent
          bg="linear-gradient(135deg, #E67E22 0%, #D35400 100%)"
          color="white"
        >
          <DrawerCloseButton
            size="lg"
            color="white"
            _hover={{ bg: "rgba(255,255,255,0.2)" }}
          />

          <DrawerHeader p={0}>
            <Box p={6} pb={4}>
              <Text
                fontSize="2xl"
                fontFamily="DarumaDrop One"
                fontWeight="bold"
                mb={6}
                letterSpacing="wide"
              >
                Café Chronicles
              </Text>

              <HStack spacing={4} mb={4}>
                <Avatar
                  size="md"
                  bg="rgba(255,255,255,0.3)"
                  icon={<FiUser size="20px" />}
                />
                <VStack align="start" spacing={0}>
                  <Text fontSize="md" fontFamily="Afacad" fontWeight="600">
                    @wlwx_15
                  </Text>
                  <Text fontSize="sm" fontFamily="Afacad" opacity={0.9}>
                    wlwx15@mail.com
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </DrawerHeader>

          <DrawerBody p={0}>
            <VStack spacing={0} align="stretch">
              {menuItems.map((item, index) => (
                <Box
                  key={index}
                  px={6}
                  py={4}
                  cursor="pointer"
                  bg={item.isActive ? "rgba(255,255,255,0.2)" : "transparent"}
                  borderLeft={
                    item.isActive
                      ? "4px solid #F39C12"
                      : "4px solid transparent"
                  }
                  _hover={{
                    bg: "rgba(255,255,255,0.1)",
                    transform: "translateX(4px)",
                  }}
                  transition="all 0.2s ease"
                >
                  <HStack spacing={4} justify="space-between">
                    <HStack spacing={4}>
                      <Box
                        w="12px"
                        h="12px"
                        bg="rgba(255,255,255,0.8)"
                        borderRadius="2px"
                      />
                      <item.icon size="18px" />
                      <Text
                        fontSize="lg"
                        fontFamily="Afacad"
                        fontWeight={item.isActive ? "700" : "500"}
                        textDecoration={item.isActive ? "underline" : "none"}
                        textDecorationColor="#F39C12"
                        textUnderlineOffset="4px"
                      >
                        {item.label}
                      </Text>
                    </HStack>
                    {item.badge && (
                      <Badge
                        bg="#F39C12"
                        color="white"
                        borderRadius="full"
                        fontSize="xs"
                        fontFamily="Afacad"
                        fontWeight="bold"
                        minW="24px"
                        h="24px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </HStack>
                </Box>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default CafeChroniclesSidebar;
