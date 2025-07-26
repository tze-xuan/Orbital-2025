import {
  Badge,
  Button,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FaLocationArrow, FaTimes } from "react-icons/fa";
import { LocationResult } from "./LocationFilterModal.tsx";

interface DashboardCafeFilterSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  userLocation: LocationResult | null;
  filterRadius: number;
  onLocationModalOpen: () => void;
  onClearLocationFilter: () => void;
}

const DashboardCafeFilterSection = ({
  searchTerm,
  setSearchTerm,
  userLocation,
  filterRadius,
  onLocationModalOpen,
  onClearLocationFilter,
}: DashboardCafeFilterSectionProps) => {
  return (
    <Flex dir="column" gap={10}>
      <Flex dir="row" gap={4}>
        {/* Search Bar */}
        <InputGroup maxWidth="500px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="#DC6739" />
          </InputLeftElement>
          <Input
            placeholder={"Search cafés by name..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            borderRadius="100px"
            height="40px"
            width="500px"
            bg="white"
            variant="flushed"
            shadow="lg"
            fontFamily="afacad"
          />
        </InputGroup>

        {/* Location Filter Section */}
        <Flex direction="row" gap={4}>
          <Button
            leftIcon={<FaLocationArrow />}
            onClick={onLocationModalOpen}
            bg={!userLocation ? "#80B29B" : "white"}
            color={!userLocation ? "white" : "#80B29B"}
            borderRadius="100px"
            _hover={{
              bg: !userLocation ? "#6F9D88" : "#EEEEEE",
              color: !userLocation ? "#EEEEEE" : "#6F9D88",
            }}
            fontFamily="afacad"
          >
            {userLocation ? `Filtering within ${filterRadius}km` : "Filter"}
          </Button>

          {userLocation && (
            <Flex align="center" gap={1}>
              <Badge
                colorScheme="#80B29B"
                variant="subtle"
                borderRadius="full"
                fontFamily="afacad"
                fontSize="sm"
              >
                📍 {userLocation.formattedAddress}
              </Badge>
              <IconButton
                aria-label="Clear location filter"
                icon={<FaTimes />}
                size="sm"
                variant="subtle"
                onClick={onClearLocationFilter}
                fontFamily="afacad"
              />
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default DashboardCafeFilterSection;
