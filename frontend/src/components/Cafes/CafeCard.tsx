import { Box, Button, Flex, IconButton, Text, Tooltip } from "@chakra-ui/react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { CafeType } from "../../interfaces/CafeInterface.tsx";
import { LocationResult, calculateDistance } from "./LocationFilterModal.tsx";

interface CafeCardProps {
  cafe: CafeType;
  index: number;
  isBookmarked: boolean;
  userLocation: LocationResult | null;
  onBookmark: (cafeId: number) => void;
  onEdit: (index: number) => void;
  onDelete: (cafeId: number) => void;
  onReviewSubmit: (reviewId: number) => void;
}

const CafeCard = ({
  cafe,
  index,
  isBookmarked,
  userLocation,
  onBookmark,
  onEdit,
  onDelete,
  onReviewSubmit
}: CafeCardProps) => {
  return (
    <Flex
      direction="column"
      bgColor="white"
      width="90%"
      height="25vh"
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
    </Flex>
  );
};

export default CafeCard;
