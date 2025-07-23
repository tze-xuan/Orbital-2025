import { useState } from "react";
import {
  Button,
  Flex,
  Text, 
  Tooltip,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { CafeType } from "../../interfaces/CafeInterface.tsx";
import { LocationResult, calculateDistance } from "./LocationFilterModal.tsx";
import ReviewForm from "./Review.tsx";
import CafeReviews from "./ReviewList.tsx";

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
  userLocation,
  onBookmark,
  onEdit,
  onDelete,
  onReviewSubmit
}: CafeCardProps) => {
  const { 
    isOpen: isReviewsOpen, 
    onOpen: onReviewsOpen, 
    onClose: onReviewsClose 
  } = useDisclosure();
  
  const { 
    isOpen: isReviewFormOpen, 
    onOpen: onReviewFormOpen,
    onClose: onReviewFormClose 
  } = useDisclosure();
  
  const [cafeIdForReviews, setCafeIdForReviews] = useState<string | number | null>(null);
  const handleViewReviews = () => {
    setCafeIdForReviews(cafe.id);
    onReviewsOpen();
  };

  const renderStars = (rating) => {
    return (
      <Flex>
        {[...Array(5)].map((_, i) => (
          <Text 
            key={i} 
            color={i < rating ? 'orange.400' : 'gray.300'}
            fontSize="lg"
          >
            ★
          </Text>
        ))}
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      bgColor="white"
      width="90%"
      height="30vh"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      padding="2vh"
      borderRadius="40px"
      shadow="xl"
      position="relative"
    >
      <Box position="absolute" top="15px" right="15px">
        <Tooltip
          label={isBookmarked ? "Remove bookmark" : "Bookmark café"}
          hasArrow
        >
          <IconButton
            aria-label="Bookmark café"
            icon={isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
            size="sm"
            colorScheme={isBookmarked ? "orange" : "gray"}
            variant="ghost"
            onClick={() => onBookmark(cafe.id)}
          />
        </Tooltip>
      </Box>

      <Text fontSize="2xl" fontFamily="afacad" fontWeight="black">
        {cafe.cafeName}
      </Text>
      <Text fontSize="lg" fontFamily="afacad">
        {cafe.cafeLocation}
      </Text>

      {cafe.averageRating > 0 && (
            <Flex align="center" mb={2}>
              {renderStars(Math.round(cafe.averageRating))}
              <Text ml={2} fontSize="sm">
                ({cafe.reviewCount} reviews)
              </Text>
            </Flex>
          )}

      {userLocation && cafe.lat && cafe.lng && (
        <Text fontSize="sm" color="gray.500">
          {calculateDistance(
            userLocation.coordinates.lat,
            userLocation.coordinates.lng,
            parseFloat(cafe.lat.toString()),
            parseFloat(cafe.lng.toString())
          ).toFixed(1)}{" "}
          km away
        </Text>
      )}
      <Button
        background="#DC6739"
        margin="2"
        borderRadius="3xl"
        width="15vw"
        bgColor="#FFCE58"
        onClick={() => onEdit(index)}
      >
        Edit
      </Button>
      <Button
        background="#DC6739"
        borderRadius="3xl"
        width="15vw"
        bgColor="#FFCE58"
        onClick={() => onDelete(cafe.id)}
      >
        Delete
      </Button>

      <Flex 
        alignItems="center" 
        justifyContent="flex-start" 
        mt={2}  
        gap={2}  
      >
      <Button 
        background="#DC6739"
        borderRadius="3xl"
        width="10vw"
        bgColor="#FFCE58"
        onClick={handleViewReviews}
      >
      Reviews
      </Button>

      <Button
        onClick={onReviewFormOpen}
        borderRadius="3xl"
        size="sm"
        colorScheme="orange"
        variant="outline"
        leftIcon={<StarIcon />}
      >
      Leave Review
     </Button>
    </Flex>

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
              onSubmitSuccess={() => {
                onReviewFormClose();
                onReviewSubmit(cafe.id);
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

    {/* Reviews List Modal */}
      <Modal isOpen={isReviewsOpen} onClose={onReviewsClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Reviews for {cafe.cafeName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {cafeIdForReviews && (
              <CafeReviews 
                cafeId={cafeIdForReviews}
                currentUserId={user ? user.id : null}   />
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onReviewsClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default CafeCard;
