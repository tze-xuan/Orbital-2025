import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Flex,
  Text,
  Image,
  Tooltip,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, StarIcon } from "@chakra-ui/icons";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { CafeType } from "../../interfaces/CafeType.tsx";
import {
  GeocodingService,
  LocationResult,
  calculateDistance,
} from "./LocationFilterModal.tsx";
import ReviewForm from "./Review.tsx";
import CafeReviews from "./ReviewList.tsx";
import cafePhoto from "../../images/cafePhoto.jpg";
import cafePhoto2 from "../../images/cafePhoto2.jpeg";

interface CafeCardProps {
  cafe: CafeType;
  user: { id: string } | null;
  currentUserId?: string;
  index: number;
  isBookmarked: boolean;
  userLocation: LocationResult | null;
  onBookmark: (cafeId: number) => void;
  onEdit: (index: number) => void;
  onDelete: (cafeId: number) => void;
  onReviewSubmit: (cafeId: number) => void;
}

const CafeCard: React.FC<CafeCardProps> = ({
  cafe,
  user,
  index,
  isBookmarked,
  onBookmark,
  onEdit,
  onDelete,
  onReviewSubmit,
}: CafeCardProps) => {
  const toast = useToast();
  const {
    isOpen: isReviewFormOpen,
    onOpen: onReviewFormOpen,
    onClose: onReviewFormClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

  const [activeTab, setActiveTab] = useState(0);
  const [reviewsKey, setReviewsKey] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<LocationResult | null>(
    null
  );

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  const handleReviewSubmitSuccess = () => {
    onReviewFormClose();
    onReviewSubmit(cafe.id);
    setReviewsKey((prev) => prev + 1);
    setActiveTab(2);
  };

  const handleConfirmDelete = () => {
    onDelete(cafe.id);
    onDeleteModalClose();
  };

  const getCurrentLocation =
    useCallback(async (): Promise<LocationResult | null> => {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000,
            });
          }
        );

        const { latitude, longitude } = position.coords;
        const geocodingService = GeocodingService.getInstance();
        return await geocodingService.reverseGeocode(latitude, longitude);
      } catch (error) {
        toast({
          title: "Location Error",
          description:
            error instanceof Error ? error.message : "Failed to get location",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return null;
      }
    }, [toast]);

  useEffect(() => {
    const fetchLocation = async () => {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
    };

    fetchLocation();
  }, [getCurrentLocation]);
  return (
    <Flex
      direction="column"
      bgColor="white"
      width="80%"
      minH="40vh"
      padding="4vh"
      borderRadius="30px"
      shadow="xl"
      position="relative"
      overflow="scroll"
    >
      {/* Bookmark Button & Edit and Delete Icons */}
      <Box position="absolute" top="4vh" right="4vh">
        <Flex>
          <Tooltip
            label={isBookmarked ? "Remove bookmark" : "Bookmark café"}
            hasArrow
          >
            <IconButton
              aria-label="Bookmark café"
              icon={isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
              size="lg"
              colorScheme={isBookmarked ? "orange" : "gray"}
              variant="ghost"
              onClick={() => onBookmark(cafe.id)}
            />
          </Tooltip>
          <Tooltip label="Edit café" hasArrow>
            <IconButton
              aria-label="Edit café"
              icon={<EditIcon />}
              size="lg"
              variant="ghost"
              color="black"
              _hover={{ color: "#3970B5" }}
              onClick={() => onEdit(index)}
            />
          </Tooltip>
          <Tooltip label="Delete café" hasArrow>
            <IconButton
              aria-label="Delete café"
              icon={<DeleteIcon />}
              size="lg"
              variant="ghost"
              color="gray.600"
              _hover={{ color: "#DC6739" }}
              onClick={onDeleteModalOpen}
            />
          </Tooltip>
        </Flex>
      </Box>

      {/* Header Section */}
      <Flex
        justifyItems="flex-start"
        textAlign="left"
        width="80%"
        dir="row"
        align="start"
      >
        {/* Left Side - Cafe Info */}
        <Flex direction="column" align="start">
          <Box mb={2}>
            <Text fontSize="3xl" fontFamily="afacad" fontWeight="black">
              {cafe.cafeName}
            </Text>
            <Text fontSize="lg" fontFamily="afacad" mb={2}>
              {cafe.cafeLocation}
            </Text>
          </Box>

          {/* Distance display */}
          <Box mb={2}>
            {currentLocation ? (
              cafe?.lat && cafe?.lng ? (
                <Text
                  fontFamily="afacad"
                  fontSize="md"
                  color="gray.500"
                  fontWeight="light"
                >
                  {calculateDistance(
                    currentLocation.coordinates.lat,
                    currentLocation.coordinates.lng,
                    Number(cafe.lat),
                    Number(cafe.lng)
                  ).toFixed(1)}{" "}
                  km away
                </Text>
              ) : (
                <Text fontSize="md" color="red" fontWeight="light">
                  Cafe location missing
                </Text>
              )
            ) : (
              <Text fontSize="md" color="gray.500" fontWeight="light">
                Location not available
              </Text>
            )}
          </Box>
        </Flex>

        {/* Action Buttons */}
        <Flex
          alignItems="center"
          paddingTop={2}
          marginLeft="2vw"
          marginRight="8vw"
        >
          <Button
            onClick={onReviewFormOpen}
            borderRadius="3xl"
            size="md"
            colorScheme="orange"
            variant="outline"
            leftIcon={<StarIcon />}
            fontFamily="afacad"
            fontWeight="light"
          >
            Leave Review
          </Button>
        </Flex>

        {/* Right Side - Rating and Price */}
        <Box textAlign="left" alignItems="start">
          <Flex align="center" mb={2}>
            <Text
              fontFamily="afacad"
              fontSize="lg"
              fontWeight="semibold"
              mr={2}
            >
              Rating:
            </Text>
            {cafe.avg_rating ? (
              <>
                <Text
                  fontFamily="afacad"
                  fontSize="lg"
                  fontWeight="normal"
                  mr={2}
                >
                  {cafe.avg_rating}
                </Text>
                <StarIcon color="#FFCE58" boxSize={5} mr={2} />
                <Text fontFamily="afacad" fontSize="lg" color="gray.600">
                  ({cafe.review_count})
                </Text>
              </>
            ) : (
              <Text
                fontFamily="afacad"
                fontSize="lg"
                fontWeight="normal"
                color="gray.500"
              >
                No ratings yet
              </Text>
            )}
          </Flex>

          {/* Price Range */}
          <Flex align="center" mb={2}>
            <Text
              fontFamily="afacad"
              fontSize="lg"
              fontWeight="semibold"
              mr={2}
            >
              Price Range:
            </Text>
            {cafe.avg_price_per_pax ? (
              <>
                <Text fontFamily="afacad" fontSize="lg" fontWeight="semibold">
                  ${cafe.avg_price_per_pax}
                </Text>
              </>
            ) : (
              <Text
                fontFamily="afacad"
                fontSize="lg"
                fontWeight="normal"
                color="gray.500"
              >
                No price range available
              </Text>
            )}
          </Flex>
        </Box>
      </Flex>

      {/* Navigation Tabs */}
      <Tabs
        variant="line"
        colorScheme="teal"
        mb={4}
        index={activeTab}
        onChange={handleTabChange}
      >
        <TabList>
          <Tab
            _selected={{ color: "teal.500", borderColor: "teal.500" }}
            fontWeight="semibold"
          >
            Overview
          </Tab>
          <Tab fontWeight="semibold">Menu</Tab>
          <Tab fontWeight="semibold">Images</Tab>
          <Tab fontWeight="semibold">Reviews</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Flex py={4} textAlign="left">
              {/* Price Range */}
              <Text
                fontFamily="afacad"
                fontSize="lg"
                fontWeight="normal"
                mr={2}
              >
                Opening Hours:
              </Text>
              {cafe.opening_hours ? (
                <>
                  <Text fontFamily="afacad" fontSize="lg" fontWeight="light">
                    {cafe.opening_hours}
                  </Text>
                </>
              ) : (
                <Text
                  fontFamily="afacad"
                  fontSize="lg"
                  fontWeight="normal"
                  color="gray.500"
                >
                  Opening hours not stated
                </Text>
              )}
            </Flex>
          </TabPanel>

          <TabPanel px={0}>
            <Box p={7} textAlign="center" color="gray.500">
              Menu currently unavailable
            </Box>
          </TabPanel>

          <TabPanel px={0}>
            <Flex overflow="hidden" dir="row" gap={1}>
              <Image
                src={cafePhoto}
                alt="Cafe interior"
                width="40vh"
                height="40vh"
                fit="cover"
              />
              <Image
                src={cafePhoto2}
                alt="Cafe interior"
                width="40vh"
                height="40vh"
                fit="cover"
              />
            </Flex>
          </TabPanel>

          <TabPanel px={0}>
            <Box>
              <CafeReviews
                key={reviewsKey} // Force re-render when reviews are updated
                cafeId={cafe.id}
                currentUserId={user ? user.id : null}
              />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Review Form Modal */}
      <Modal isOpen={isReviewFormOpen} onClose={onReviewFormClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Leave Review for {cafe.cafeName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ReviewForm
              cafe_id={cafe.id}
              isOpen={isReviewFormOpen}
              onClose={onReviewFormClose}
              onSubmitSuccess={handleReviewSubmitSuccess}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Café</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to delete "{cafe.cafeName}"? This action
              cannot be undone.
            </Text>
          </ModalBody>
          <Flex justify="flex-end" gap={3} p={6}>
            <Button variant="ghost" onClick={onDeleteModalClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </Flex>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default CafeCard;
