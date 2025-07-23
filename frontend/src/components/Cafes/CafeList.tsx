import { Flex, Text } from "@chakra-ui/react";
import { CafeType } from "../../interfaces/CafeInterface.tsx";
import { LocationResult } from "./LocationFilterModal.tsx";
import CafeCard from "./CafeCard";

interface CafeListProps {
  cafes: CafeType[];
  user:{ id: string } | null;
  currentUserId?: string;
  showBookmarked: boolean;
  searchTerm: string;
  userLocation: LocationResult | null;
  filterRadius: number;
  isBookmarked: (cafeId: number) => boolean;
  onBookmark: (cafeId: number) => void;
  onEdit: (index: number) => void;
  onDelete: (cafeId: number) => void;
  onReviewSubmit: (cafeId: number) => void;
}

const CafeList = ({
  cafes,
  user,
  currentUserId,
  showBookmarked,
  searchTerm,
  userLocation,
  filterRadius,
  isBookmarked,
  onBookmark,
  onEdit,
  onDelete,
  onReviewSubmit,
}: CafeListProps) => {
  // Results Info
  const showResultsInfo = searchTerm || userLocation;

  // Empty state messages
  const getEmptyStateMessage = () => {
    if (showBookmarked) {
      return searchTerm || userLocation
        ? "No bookmarked cafés match your filters."
        : "No bookmarked cafés yet. Start exploring and bookmark your favorites!";
    }
    return searchTerm || userLocation
      ? "No cafés match your filters."
      : "No cafés found.";
  };
  
  return (
    <>
      {/* Results Info */}
      {showResultsInfo && (
        <Text fontSize="md" fontFamily="afacad" textAlign="center">
          {cafes.length} café{cafes.length !== 1 ? "s" : ""} found
          {searchTerm && ` for "${searchTerm}"`}
          {userLocation && ` within ${filterRadius}km`}
        </Text>
      )}

      {/* Empty State */}
      {cafes.length === 0 && (
        <Text fontSize="lg" fontFamily="afacad" textAlign="center">
          {getEmptyStateMessage()}
        </Text>
      )}

      {/* Cafe Cards */}
      <Flex
        alignItems="center"
        maxH="60vh"
        overflowY="auto"
        scrollBehavior="smooth"
        direction="column"
        width="100%"
        gap="2vh"
        paddingBottom="18px"
      >
        {cafes.map((cafe: CafeType, index: number) => (
          <CafeCard
            key={cafe.id}
            cafe={cafe}
            user={user}
            currentUserId={currentUserId}
            index={index}
            isBookmarked={isBookmarked(cafe.id)}
            userLocation={userLocation}
            onBookmark={onBookmark}
            onEdit={onEdit}
            onDelete={onDelete}
            onReviewSubmit={() => onReviewSubmit(cafe.id)}
          />
        ))}
      </Flex>
    </>
  );
};

export default CafeList;
