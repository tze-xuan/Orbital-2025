import { useState } from "react";
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
  Box,
  IconButton,
  Divider,
} from "@chakra-ui/react";
import { RxHamburgerMenu } from "react-icons/rx";
import { FiCoffee, FiUsers, FiSettings } from "react-icons/fi";

const HomeSidebar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeItem, setActiveItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    {
      label: "Discover Cafés",
      icon: FiCoffee,
      route: "/discovercafes",
    },
    {
      label: "Our Community",
      icon: FiUsers,
      route: "/community",
    },
  ];

  const bottomMenuItems = [
    { label: "Settings", icon: FiSettings, description: "App preferences" },
  ];

  const handleMenuClick = (item) => {
    setActiveItem(item.label);
    // Auto-close drawer on mobile-like behavior
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <>
      <IconButton
        icon={<RxHamburgerMenu />}
        onClick={onOpen}
        _hover={{
          color: "#DC6739",
          transform: "scale(1.1)",
        }}
        color="#3E405B"
        aria-label="Open menu"
        size="lg"
        variant="ghost"
        transition="all 0.2s ease"
      />

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay bg="rgba(0,0,0,0.4)" />
        <DrawerContent
          bg="linear-gradient(135deg, #E67E22 0%, #D35400 100%)"
          color="#FEF1C5"
          boxShadow="2xl"
        >
          <DrawerCloseButton
            p={6}
            size="lg"
            color="white"
            _hover={{
              transform: "rotate(90deg)",
            }}
            transition="all 0.2s ease"
          />

          <DrawerHeader py={6}>
            <Box py={6} pb={0}>
              <Text
                fontSize="3xl"
                fontFamily="DarumaDrop One"
                fontWeight="bold"
                mb={6}
                letterSpacing="wide"
                textAlign="center"
                textShadow="2px 2px 4px rgba(0,0,0,0.3)"
              >
                Café Chronicles
              </Text>
            </Box>
          </DrawerHeader>

          <DrawerBody p={0} display="flex" flexDirection="column">
            <VStack spacing={1} align="stretch" flex={1}>
              {menuItems.map((item, index) => {
                const isActive = activeItem === item.label;
                const isHovered = hoveredItem === item.label;

                return (
                  <Box
                    key={index}
                    px={6}
                    py={4}
                    cursor="pointer"
                    bg={
                      isActive
                        ? "rgba(255,255,255,0.25)"
                        : isHovered
                        ? "rgba(255,255,255,0.15)"
                        : "transparent"
                    }
                    borderRight={
                      isActive ? "2px solid rgba(255,255,255,0.3)" : "none"
                    }
                    _hover={{
                      bg: "rgba(255,255,255,0.15)",
                      transform: "translateX(8px)",
                    }}
                    transition="all 0.3s ease"
                    onClick={() => handleMenuClick(item)}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                    position="relative"
                  >
                    <HStack
                      spacing={4}
                      justify="space-between"
                      as="a"
                      href={item.route}
                    >
                      <HStack spacing={4}>
                        <Box
                          w="12px"
                          h="12px"
                          borderRadius="2px"
                          transform={isActive ? "scale(1.2)" : "scale(1)"}
                          transition="all 0.2s ease"
                        ></Box>
                        <item.icon size="18px" />
                        <VStack align="start" spacing={0}>
                          <Text
                            fontSize="lg"
                            fontFamily="Afacad"
                            fontWeight={isActive ? "700" : "500"}
                            textDecoration={isActive ? "underline" : "none"}
                            textUnderlineOffset="4px"
                          >
                            {item.label}
                          </Text>
                          {isHovered && (
                            <Text
                              fontSize="xs"
                              fontFamily="Afacad"
                              opacity={0.8}
                              mt={1}
                            ></Text>
                          )}
                        </VStack>
                      </HStack>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>

            <Box mt="auto">
              <Divider borderColor="rgba(255,255,255,0.3)" mb={2} />
              <VStack spacing={1} align="stretch">
                {bottomMenuItems.map((item, index) => (
                  <Box
                    key={index}
                    px={6}
                    py={4}
                    cursor="pointer"
                    _hover={{
                      bg: "rgba(255,255,255,0.1)",
                      transform: "translateX(4px)",
                    }}
                    transition="all 0.2s ease"
                  >
                    <HStack spacing={4}>
                      <item.icon size="16px" opacity={0.8} />
                      <Text
                        fontSize="md"
                        fontFamily="Afacad"
                        fontWeight="500"
                        opacity={0.9}
                      >
                        {item.label}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default HomeSidebar;
