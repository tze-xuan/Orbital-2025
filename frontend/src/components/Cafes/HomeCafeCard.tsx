import { Flex, Text } from "@chakra-ui/react";
import { CafeType } from "../../interfaces/CafeType.tsx";
import { LocationResult, calculateDistance } from "./LocationFilterModal.tsx";

interface DashboardCafeCardProps {
  cafe: CafeType;
  user?: { id: string } | null;
  currentUserId?: string;
  index: number;
  userLocation: LocationResult | null;
}

const DashboardCafeCard: React.FC<DashboardCafeCardProps> = ({
  cafe,
  userLocation,
}: DashboardCafeCardProps) => {
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
    </Flex>
  );
};

export default DashboardCafeCard;
