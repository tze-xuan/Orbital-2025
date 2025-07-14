import {
  Badge,
  Button,
  ButtonGroup,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
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
          colorScheme={!showBookmarked ? "orange" : "gray"}
          onClick={() => setShowBookmarked(false)}
          bg={!showBookmarked ? "#DC6739" : "white"}
          color={!showBookmarked ? "white" : "#DC6739"}
          borderColor="#DC6739"
          borderRadius="100px"
        >
          All Cafés
        </Button>
        <Button
          colorScheme={showBookmarked ? "orange" : "gray"}
          onClick={() => setShowBookmarked(true)}
          bg={showBookmarked ? "#DC6739" : "white"}
          color={showBookmarked ? "white" : "#DC6739"}
          borderColor="#DC6739"
          borderRadius="100px"
        >
          Bookmarked Cafés ({bookmarksCount})
        </Button>
      </ButtonGroup>

      {/* Search Bar */}
      <InputGroup width="100%" maxWidth="500px" bg="white" borderRadius="100px">
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
          variant="flushed"
          shadow="lg"
        />
      </InputGroup>

      {/* Location Filter Section */}
      <VStack spacing={2}>
        <Button
          leftIcon={<FaLocationArrow />}
          onClick={onLocationModalOpen}
          bg={userLocation ? "#DC6739" : "white"}
          color={userLocation ? "white" : "#DC6739"}
          borderColor="#DC6739"
          border="1px solid"
          borderRadius="100px"
          _hover={{
            bg: userLocation ? "#B8552E" : "#FFF5F5",
          }}
        >
          {userLocation
            ? `Filtering within ${filterRadius}km`
            : "Filter by Location"}
        </Button>

        {userLocation && (
          <Flex align="center" gap={2}>
            <Badge
              colorScheme="orange"
              variant="subtle"
              borderRadius="full"
              px={3}
              py={1}
            >
              📍 {userLocation.formattedAddress}
            </Badge>
            <IconButton
              aria-label="Clear location filter"
              icon={<FaTimes />}
              size="sm"
              variant="ghost"
              colorScheme="gray"
              onClick={onClearLocationFilter}
            />
          </Flex>
        )}
      </VStack>
    </>
  );
};

export default CafeFilterSection;
