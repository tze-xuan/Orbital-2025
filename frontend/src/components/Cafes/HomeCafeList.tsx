import { Flex, Text } from "@chakra-ui/react";
import { CafeType } from "../../interfaces/CafeType.tsx";
import { LocationResult } from "./LocationFilterModal.tsx";
import DashboardCafeCard from "./HomeCafeCard.tsx";

interface DashboardCafeListProps {
  cafes: CafeType[];
  user?: { id: string } | null;
  searchTerm: string;
  userLocation: LocationResult | null;
  filterRadius: number;
}

const DashboardCafeList = ({
  cafes,
  user,
  searchTerm,
  userLocation,
  filterRadius,
}: DashboardCafeListProps) => {
  // Results Info
  const showResultsInfo = searchTerm || userLocation;

  // Empty state messages
  const getEmptyStateMessage = () => {
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
        maxH="75vh"
        overflowY="auto"
        scrollBehavior="smooth"
        direction="column"
        width="100%"
        gap="2vh"
        paddingBottom="18px"
      >
        {cafes.map((cafe: CafeType, index: number) => (
          <DashboardCafeCard
            key={cafe.id}
            cafe={cafe}
            user={user}
            index={index}
            userLocation={userLocation}
          />
        ))}
      </Flex>
    </>
  );
};

export default DashboardCafeList;
