import {
  Badge,
  Button,
  ButtonGroup,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FaLocationArrow, FaTimes } from "react-icons/fa";
import { LocationResult } from "./LocationFilterModal.tsx";

interface CafeFilterSectionProps {
  showBookmarked: boolean;
  setShowBookmarked: (show: boolean) => void;
  bookmarksCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  userLocation: LocationResult | null;
  filterRadius: number;
  onLocationModalOpen: () => void;
  onClearLocationFilter: () => void;
}

const CafeFilterSection = ({
  showBookmarked,
  setShowBookmarked,
  bookmarksCount,
  searchTerm,
  setSearchTerm,
  userLocation,
  filterRadius,
  onLocationModalOpen,
  onClearLocationFilter,
}: CafeFilterSectionProps) => {
  return (
    <>
      <ButtonGroup variant="outline">
        <Button
          colorScheme={!showBookmarked ? "#DC6739" : "white"}
          onClick={() => setShowBookmarked(false)}
          bg={!showBookmarked ? "#DC6739" : "white"}
          color={!showBookmarked ? "white" : "#DC6739"}
          borderColor="#DC6739"
          borderRadius="100px"
          fontFamily="afacad"
        >
          All Cafés
        </Button>
        <Button
          colorScheme={showBookmarked ? "#DC6739" : "white"}
          onClick={() => setShowBookmarked(true)}
          bg={showBookmarked ? "#DC6739" : "white"}
          color={showBookmarked ? "white" : "#DC6739"}
          borderColor="#DC6739"
          borderRadius="100px"
          fontFamily="afacad"
        >
          Bookmarked Cafés ({bookmarksCount})
        </Button>
      </ButtonGroup>

      <Flex dir="horizontal" gap={4}>
        {/* Search Bar */}
        <InputGroup maxWidth="500px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="#DC6739" />
          </InputLeftElement>
          <Input
            placeholder={`Search ${
              showBookmarked ? "bookmarked " : ""
            }cafés by name...`}
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
    </>
  );
};

export default CafeFilterSection;
