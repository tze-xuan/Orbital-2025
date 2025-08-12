import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Badge,
  Text,
  Heading,
  VStack,
  HStack,
  Progress,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Grid,
  GridItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  CircularProgress,
  CircularProgressLabel,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import {
  Trophy,
  MapPin,
  Route,
  Coffee,
  Star,
  Target,
  Award,
  TrendingUp,
  Calendar,
  Navigation,
} from "lucide-react";
import type { Achievement, UserStats } from "../../interfaces/Achievement.tsx";
import { FaHome } from "react-icons/fa";

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-cafe",
    title: "First Sip",
    description: "Visit your first cafe",
    icon: "Coffee",
    category: "exploration",
    requirement: 1,
    currentProgress: 0,
    isUnlocked: false,
    points: 10,
  },
  {
    id: "cafe-explorer",
    title: "Cafe Explorer",
    description: "Visit 5 different cafes",
    icon: "MapPin",
    category: "exploration",
    requirement: 5,
    currentProgress: 0,
    isUnlocked: false,
    points: 50,
  },
  {
    id: "route-master",
    title: "Route Master",
    description: "Complete 3 cafe routes",
    icon: "Route",
    category: "exploration",
    requirement: 3,
    currentProgress: 0,
    isUnlocked: false,
    points: 75,
  },
  {
    id: "distance-walker",
    title: "Distance Walker",
    description: "Walk 10km total across all routes",
    icon: "Navigation",
    category: "distance",
    requirement: 10,
    currentProgress: 0,
    isUnlocked: false,
    points: 100,
  },
  {
    id: "streak-keeper",
    title: "Streak Keeper",
    description: "Visit cafes for 7 consecutive days",
    icon: "Calendar",
    category: "frequency",
    requirement: 7,
    currentProgress: 0,
    isUnlocked: false,
    points: 150,
  },
  {
    id: "social-butterfly",
    title: "Social Butterfly",
    description: "Share 5 cafe experiences",
    icon: "Star",
    category: "social",
    requirement: 5,
    currentProgress: 0,
    isUnlocked: false,
    points: 80,
  },
];

const getIconComponent = (iconName: string) => {
  const icons = {
    Coffee,
    MapPin,
    Route,
    Navigation,
    Calendar,
    Star,
    Trophy,
    Award,
    Target,
    TrendingUp,
  };
  return icons[iconName as keyof typeof icons] || Coffee;
};

export default function AchievementSystem() {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [userStats, setUserStats] = useState<UserStats>({
    cafesVisited: 0,
    routesCompleted: 0,
    totalDistance: 0,
    favoriteNeighborhood: "Downtown",
    streakDays: 0,
    totalPoints: 0,
    level: 1,
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const toast = useToast();

  useEffect(() => {
    const savedStats = localStorage.getItem("cafeUserStats");
    const savedAchievements = localStorage.getItem("cafeAchievements");

    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }

    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cafeUserStats", JSON.stringify(userStats));
    localStorage.setItem("cafeAchievements", JSON.stringify(achievements));
  }, [userStats, achievements]);

  useEffect(() => {
    const updatedAchievements = achievements.map((achievement) => {
      if (!achievement.isUnlocked) {
        let progress = 0;

        switch (achievement.id) {
          case "first-cafe":
          case "cafe-explorer":
            progress = userStats.cafesVisited;
            break;
          case "route-master":
            progress = userStats.routesCompleted;
            break;
          case "distance-walker":
            progress = userStats.totalDistance;
            break;
          case "streak-keeper":
            progress = userStats.streakDays;
            break;
          case "social-butterfly":
            progress = Math.floor(userStats.cafesVisited / 2); // Mock social sharing
            break;
        }

        const updatedAchievement = {
          ...achievement,
          currentProgress: Math.min(progress, achievement.requirement),
        };

        if (progress >= achievement.requirement && !achievement.isUnlocked) {
          updatedAchievement.isUnlocked = true;
          updatedAchievement.unlockedAt = new Date();

          toast({
            title: "Achievement Unlocked! 🏆",
            description: `${achievement.title} - ${achievement.points} points earned!`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        }

        return updatedAchievement;
      }
      return achievement;
    });

    const hasChanges = updatedAchievements.some(
      (updated, index) =>
        updated.currentProgress !== achievements[index].currentProgress ||
        updated.isUnlocked !== achievements[index].isUnlocked
    );

    if (hasChanges) {
      setAchievements(updatedAchievements);
    }
  }, [
    userStats.cafesVisited,
    userStats.routesCompleted,
    userStats.totalDistance,
    userStats.streakDays,
    achievements,
    toast,
  ]);

  useEffect(() => {
    const totalPoints = achievements
      .filter((a) => a.isUnlocked)
      .reduce((sum, a) => sum + a.points, 0);
    const level = Math.floor(totalPoints / 100) + 1;

    if (userStats.totalPoints !== totalPoints || userStats.level !== level) {
      setUserStats((prev) => ({
        ...prev,
        totalPoints,
        level,
      }));
    }
  }, [achievements, userStats.totalPoints, userStats.level]);

  const simulateProgress = () => {
    setUserStats((prev) => ({
      ...prev,
      cafesVisited: prev.cafesVisited + 1,
      routesCompleted: prev.routesCompleted + (Math.random() > 0.7 ? 1 : 0),
      totalDistance: prev.totalDistance + Math.random() * 3,
      streakDays: prev.streakDays + (Math.random() > 0.8 ? 1 : 0),
    }));
  };

  const filteredAchievements =
    selectedCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const progressPercentage = (unlockedCount / achievements.length) * 100;

  const openAchievementDetail = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    onOpen();
  };

  return (
    <Flex p={6} dir="column">
      <VStack spacing={6} maxW="1200px" mx="auto">
        <IconButton
          as="a"
          href="/dashboard"
          aria-label="Home"
          icon={<FaHome />}
          color="#3E405B"
          variant="link"
          size="lg"
          _hover={{ color: "#DC6739" }}
          m={2}
        />
        {/* Header */}
        <Box textAlign="center" w="full">
          <Heading size="3xl" fontFamily="darumadrop" color="#DC6739" mb={2}>
            Achievements
          </Heading>
          <Text fontFamily="afacad" fontSize="2xl" mb={4}>
            Track your cafe exploration journey
          </Text>

          {/* Overall Progress */}
          <Card w="full" maxW="400px" mx="auto">
            <CardBody textAlign="center">
              <CircularProgress
                value={progressPercentage}
                size="120px"
                color="#DC6739"
                thickness="8px"
              >
                <CircularProgressLabel>
                  <VStack spacing={0}>
                    <Text fontSize="2xl" fontWeight="bold" color="#DC6739">
                      {unlockedCount}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      of {achievements.length}
                    </Text>
                  </VStack>
                </CircularProgressLabel>
              </CircularProgress>
              <Text mt={4} fontWeight="semibold" color="gray.900">
                Level {userStats.level} Explorer
              </Text>
              <Text fontSize="sm" color="gray.600">
                {userStats.totalPoints} points earned
              </Text>
            </CardBody>
          </Card>
        </Box>

        {/* Stats Cards */}
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
          gap={4}
          w="full"
        >
          <GridItem>
            <Card>
              <CardBody textAlign="center">
                <Icon as={Coffee} boxSize={8} color="#DC6739" mb={2} />
                <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                  {userStats.cafesVisited}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Cafes Visited
                </Text>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody textAlign="center">
                <Icon as={Route} boxSize={8} color="#DC6739" mb={2} />
                <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                  {userStats.routesCompleted}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Routes Completed
                </Text>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody textAlign="center">
                <Icon as={Navigation} boxSize={8} color="#DC6739" mb={2} />
                <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                  {userStats.totalDistance.toFixed(1)}km
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Distance Walked
                </Text>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody textAlign="center">
                <Icon as={Calendar} boxSize={8} color="#DC6739" mb={2} />
                <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                  {userStats.streakDays}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Day Streak
                </Text>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Demo Button */}
        <Button
          onClick={simulateProgress}
          bg="#80B29B"
          color="white"
          _hover={{ bg: "#62927cff" }}
          leftIcon={<Icon as={TrendingUp} />}
        >
          Simulate Cafe Visit (Demo)
        </Button>

        {/* Achievement Filters */}
        <Tabs variant="soft-rounded" colorScheme="orange" w="full">
          <TabList justifyContent="center" flexWrap="wrap">
            <Tab onClick={() => setSelectedCategory("all")}>All</Tab>
            <Tab onClick={() => setSelectedCategory("exploration")}>
              Exploration
            </Tab>
            <Tab onClick={() => setSelectedCategory("distance")}>Distance</Tab>
            <Tab onClick={() => setSelectedCategory("frequency")}>
              Frequency
            </Tab>
            <Tab onClick={() => setSelectedCategory("social")}>Social</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              {/* Achievement Grid */}
              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                }}
                gap={4}
              >
                {filteredAchievements.map((achievement) => (
                  <Card
                    key={achievement.id}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                    onClick={() => openAchievementDetail(achievement)}
                    opacity={achievement.isUnlocked ? 1 : 0.7}
                    bg={achievement.isUnlocked ? "white" : "gray.50"}
                  >
                    <CardBody>
                      <VStack spacing={3} align="center">
                        <Box position="relative">
                          <Icon
                            as={getIconComponent(achievement.icon)}
                            boxSize={12}
                            color={
                              achievement.isUnlocked ? "#DC6739" : "gray.400"
                            }
                          />
                          {achievement.isUnlocked && (
                            <Badge
                              position="absolute"
                              top="-8px"
                              right="-8px"
                              colorScheme="green"
                              borderRadius="full"
                              fontSize="xs"
                            >
                              ✓
                            </Badge>
                          )}
                        </Box>

                        <VStack spacing={1} textAlign="center">
                          <Heading size="sm" color="gray.900">
                            {achievement.title}
                          </Heading>
                          <Text fontSize="sm" color="gray.600" noOfLines={2}>
                            {achievement.description}
                          </Text>
                        </VStack>

                        {!achievement.isUnlocked && (
                          <Box w="full">
                            <Progress
                              value={
                                (achievement.currentProgress /
                                  achievement.requirement) *
                                100
                              }
                              colorScheme="orange"
                              size="sm"
                              borderRadius="full"
                            />
                            <Text
                              fontSize="xs"
                              color="gray.500"
                              mt={1}
                              textAlign="center"
                            >
                              {achievement.currentProgress} /{" "}
                              {achievement.requirement}
                            </Text>
                          </Box>
                        )}

                        <Badge colorScheme="orange" fontSize="xs">
                          {achievement.points} points
                        </Badge>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Achievement Detail Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={3}>
                {selectedAchievement && (
                  <Icon
                    as={getIconComponent(selectedAchievement.icon)}
                    boxSize={8}
                    color="#DC6739"
                  />
                )}
                <VStack align="start" spacing={0}>
                  <Text>{selectedAchievement?.title}</Text>
                  {selectedAchievement?.isUnlocked && (
                    <Badge colorScheme="green" fontSize="xs">
                      Unlocked
                    </Badge>
                  )}
                </VStack>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedAchievement && (
                <VStack spacing={4} align="start">
                  <Text color="gray.600">
                    {selectedAchievement.description}
                  </Text>

                  <Box w="full">
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="medium">
                        Progress
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {selectedAchievement.currentProgress} /{" "}
                        {selectedAchievement.requirement}
                      </Text>
                    </HStack>
                    <Progress
                      value={
                        (selectedAchievement.currentProgress /
                          selectedAchievement.requirement) *
                        100
                      }
                      colorScheme="orange"
                      size="lg"
                      borderRadius="full"
                    />
                  </Box>

                  <HStack justify="space-between" w="full">
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color="gray.600">
                        Category
                      </Text>
                      <Badge colorScheme="blue" textTransform="capitalize">
                        {selectedAchievement.category}
                      </Badge>
                    </VStack>
                    <VStack align="end" spacing={0}>
                      <Text fontSize="sm" color="gray.600">
                        Points
                      </Text>
                      <Badge colorScheme="orange">
                        {selectedAchievement.points}
                      </Badge>
                    </VStack>
                  </HStack>

                  {selectedAchievement.isUnlocked &&
                    selectedAchievement.unlockedAt && (
                      <Box
                        w="full"
                        p={3}
                        bg="green.50"
                        borderRadius="md"
                        border="1px"
                        borderColor="green.200"
                      >
                        <Text fontSize="sm" color="green.700">
                          🎉 Unlocked on{" "}
                          {new Date(
                            selectedAchievement.unlockedAt
                          ).toLocaleDateString()}
                        </Text>
                      </Box>
                    )}
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Flex>
  );
}
