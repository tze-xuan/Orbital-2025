import {
  Button,
  Flex,
  IconButton,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState, useEffect, useCallback } from "react";
import Axios from "axios";
import LocationFilterModal, {
  LocationResult,
  calculateDistance,
} from "../components/Cafes/LocationFilterModal.tsx";
import { CafeType } from "../interfaces/CafeInterface.tsx";
import { Bookmark } from "../interfaces/BookmarkInterface.tsx";
import CafeFilterSection from "../components/Cafes/CafeFilterSection.tsx";
import CafeList from "../components/Cafes/CafeList.tsx";
import CafeEditModal from "../components/Cafes/CafeEditModal.tsx";
import CafeAddModal from "../components/Cafes/CafeAddModal.tsx";
import { FaHome } from "react-icons/fa";
import ReviewForm from "../components/Cafes/Review.tsx";

const Cafes = () => {
  const CAFE_API_ROUTE = "https://cafechronicles.vercel.app/api/cafes/";
  const BOOKMARK_API_ROUTE = "https://cafechronicles.vercel.app/api/bookmarks/";
  const [data, setData] = useState<CafeType[] | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [showBookmarked, setShowBookmarked] = useState(false);
  const toast = useToast();

  // Location filter state - using LocationResult type
  const [filterRadius, setFilterRadius] = useState(5);
  const [userLocation, setUserLocation] = useState<LocationResult | null>(null);

  // Modals
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isLocationModalOpen,
    onOpen: onLocationModalOpen,
    onClose: onLocationModalClose,
  } = useDisclosure();

  // Edit cafe state
  const initialRef = React.useRef<HTMLInputElement>(null);
  const [cafeName, setCafeName] = useState("");
  const [cafeLocation, setCafeLocation] = useState("");
  const [editedId, setEditedId] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isValidatingAddress] = useState(false);

  // Review state
  const [reviewingCafeId, setReviewingCafeId] = useState<number | null>(null);

  // Get user ID from authentication or session
  const getUserId = async () => {
    try {
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        const user = JSON.parse(currentUser);
        setUserId(user.id);
      } else {
        setUserId(1);
      }
    } catch (error) {
      console.error("Error getting user ID:", error);
      setUserId(1);
    }
  };

  const handleEdit = async () => {
    if (!cafeName) return;

    try {
      await fetch(CAFE_API_ROUTE + editedId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cafeName: cafeName,
          cafeLocation: cafeLocation,
        }),
      });
      setCafeName("");
      setCafeLocation("");
      onClose();
      getData();
      toast({
        title: "Café updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error editing cafe:", error);
      toast({
        title: "Error updating café",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(CAFE_API_ROUTE + id, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      getData();
      toast({
        title: "Café deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting cafe:", error);
      toast({
        title: "Error deleting café",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAdd = async () => {
    if (!cafeName) return;

    try {
      const response = await fetch(CAFE_API_ROUTE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cafeName: cafeName,
          cafeLocation: cafeLocation,
        }),
      });
      if (!response.ok) throw new Error("Failed to add café");
      setCafeName("");
      setCafeLocation("");
      setIsAddModalOpen(false);
      await getData();
      toast({
        title: "Café added",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error adding cafe:", error);
      toast({
        title: "Error adding café",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // const [refreshTrigger, setRefreshTrigger] = useState(0);

  const editIndex = (i: number) => {
    if (!data) return;
    setEditedId(data[i].id.toString());
    setCafeName(data[i].cafeName);
    setCafeLocation(data[i].cafeLocation);
    setLocationError("");
  };

  const getData = async () => {
    try {
      const response = await Axios.get(CAFE_API_ROUTE);
      console.log("API Response:", response.data); // Debug log
      setData(response.data);
    } catch (error) {
      console.error("Error fetching cafes:", error);
    }
  };

  const getBookmarks = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await Axios.get(`${BOOKMARK_API_ROUTE}user/${userId}`);
      setBookmarks(response.data);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  }, [userId]);

  const handleBookmark = async (cafeId: number) => {
    if (!userId) return;
    try {
      const isBookmarked = bookmarks.some(
        (bookmark: Bookmark) => bookmark.cafe_id === cafeId
      );

      if (isBookmarked) {
        await Axios.delete(
          `${BOOKMARK_API_ROUTE}user/${userId}/cafe/${cafeId}`
        );
        toast({
          title: "Bookmark removed",
          status: "info",
          duration: 2000,
          isClosable: true,
        });
      } else {
        await Axios.post(BOOKMARK_API_ROUTE, {
          user_id: userId,
          cafe_id: cafeId,
        });
        toast({
          title: "Café bookmarked",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }

      await getBookmarks();
    } catch (error) {
      console.error("Error handling bookmark:", error);
      toast({
        title: "Error updating bookmark",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const isBookmarked = (cafeId: number) => {
    return bookmarks.some((bookmark: Bookmark) => bookmark.cafe_id === cafeId);
  };

  const getBookmarkedCafes = (): CafeType[] => {
    if (!data || !bookmarks.length) return [];

    const bookmarkedCafeIds = bookmarks.map(
      (bookmark: Bookmark) => bookmark.cafe_id
    );
    return data.filter((cafe: CafeType) => bookmarkedCafeIds.includes(cafe.id));
  };

  // Location filter handlers
  const handleApplyLocationFilter = useCallback(
    (location: LocationResult, radius: number) => {
      console.log("Location filter applied:", location, "Radius:", radius);
      setUserLocation(location);
      setFilterRadius(radius);
    },
    []
  );

  const handleClearLocationFilter = useCallback(() => {
    console.log("Location filter cleared");
    setUserLocation(null);
  }, []);

  // Enhanced filtering logic with better debugging
  const filteredCafes = (() => {
    const cafesToFilter = showBookmarked ? getBookmarkedCafes() : data || [];

    console.log("Starting filter process:");
    console.log("- Total cafes:", cafesToFilter.length);
    console.log("- Search term:", searchTerm);
    console.log("- User location:", userLocation);
    console.log("- Filter radius:", filterRadius);

    // First filter by search term if it exists
    let filtered = searchTerm
      ? cafesToFilter.filter((cafe: CafeType) => {
          const nameMatch = cafe.cafeName
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const locationMatch = cafe.cafeLocation
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          return nameMatch || locationMatch;
        })
      : cafesToFilter;

    console.log("- After search filter:", filtered.length);

    // Then filter by location if userLocation is set
    if (userLocation) {
      console.log("Applying location filter...");

      const locationFiltered = filtered.filter((cafe: CafeType) => {
        console.log(`Checking cafe: ${cafe.cafeName}`);
        console.log(`- Cafe location: ${cafe.cafeLocation}`);
        console.log(`- Cafe coordinates: lat=${cafe.lat}, lng=${cafe.lng}`);

        // Check if cafe has coordinates
        if (!cafe.lat || !cafe.lng) {
          console.log(
            `- No coordinates for ${cafe.cafeName}, excluding from location filter`
          );
          return false;
        }

        const cafeLat = parseFloat(cafe.lat.toString());
        const cafeLng = parseFloat(cafe.lng.toString());

        console.log(`- Parsed coordinates: lat=${cafeLat}, lng=${cafeLng}`);

        if (isNaN(cafeLat) || isNaN(cafeLng)) {
          console.log(`- Invalid coordinates for ${cafe.cafeName}`);
          return false;
        }

        const distance = calculateDistance(
          userLocation.coordinates.lat,
          userLocation.coordinates.lng,
          cafeLat,
          cafeLng
        );

        console.log(
          `- Distance: ${distance.toFixed(2)}km (limit: ${filterRadius}km)`
        );
        console.log(`- Within range: ${distance <= filterRadius}`);

        return distance <= filterRadius;
      });

      console.log("- After location filter:", locationFiltered.length);
      filtered = locationFiltered;
    }

    // Sort by relevance
    const sortedResults = filtered
      .map((cafe: CafeType) => {
        const name = cafe.cafeName.toLowerCase();
        const location = cafe.cafeLocation.toLowerCase();
        const search = searchTerm.toLowerCase();

        let score = 0;

        // Name matches
        if (name === search) score = 1000;
        else if (name.startsWith(search)) score = 100;
        else if (name.includes(` ${search}`) || name.includes(`${search} `))
          score = 50;
        else if (name.includes(search)) score = 10;

        // Location matches
        if (location.includes(search)) score += 20;

        // Prefer shorter names
        score += Math.max(0, 50 - name.length);

        // Boost score if within filter radius
        if (userLocation && cafe.lat && cafe.lng) {
          const distance = calculateDistance(
            userLocation.coordinates.lat,
            userLocation.coordinates.lng,
            parseFloat(cafe.lat.toString()),
            parseFloat(cafe.lng.toString())
          );
          if (distance <= filterRadius) {
            score += 30;
          }
        }
        return { ...cafe, relevanceScore: score };
      })
      .sort(
        (a: CafeType, b: CafeType) =>
          (b.relevanceScore || 0) - (a.relevanceScore || 0)
      );

    console.log("- Final filtered results:", sortedResults.length);
    return sortedResults;
  })();

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      getData();
      getBookmarks();
    }
  }, [userId, getBookmarks]);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCafeLocation(e.target.value);
    if (locationError) {
      setLocationError("");
    }
  };

  const handleEditIndex = (index: number) => {
    editIndex(index);
    onOpen();
  };

  const handleAddNewClick = () => {
    setCafeName("");
    setCafeLocation("");
    setLocationError("");
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setCafeName("");
    setCafeLocation("");
    setLocationError("");
  };

  const refetchCafes = useCallback(() => {
    getData();
    getBookmarks();
  }, [getBookmarks]);

  useEffect(() => {
    if (userId) {
      getData();
      getBookmarks();
    }
  }, [userId, refetchCafes, getBookmarks]);

  return (
    <Flex alignItems="center" direction="column" gap={4} padding="6vh">
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

      <CafeFilterSection
        showBookmarked={showBookmarked}
        setShowBookmarked={setShowBookmarked}
        bookmarksCount={bookmarks.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        userLocation={userLocation}
        filterRadius={filterRadius}
        onLocationModalOpen={onLocationModalOpen}
        onClearLocationFilter={handleClearLocationFilter}
      />

      <CafeList
        cafes={filteredCafes}
        showBookmarked={showBookmarked}
        searchTerm={searchTerm}
        userLocation={userLocation}
        filterRadius={filterRadius}
        isBookmarked={isBookmarked}
        onBookmark={handleBookmark}
        onEdit={handleEditIndex}
        onDelete={handleDelete}
        onReviewSubmit={(cafeId) => setReviewingCafeId(cafeId)}
      />

      {!showBookmarked && (
        <Button
          background="#3970B5"
          color="white"
          borderRadius="50px"
          width="70%"
          onClick={handleAddNewClick}
        >
          Add New
        </Button>
      )}

      {/* Edit Modal */}
      <CafeEditModal
        isOpen={isOpen}
        onClose={onClose}
        initialRef={initialRef}
        cafeName={cafeName}
        setCafeName={setCafeName}
        cafeLocation={cafeLocation}
        setCafeLocation={setCafeLocation}
        locationError={locationError}
        isValidatingAddress={isValidatingAddress}
        onSave={handleEdit}
        handleLocationChange={handleLocationChange}
      />

      {/* Add Modal */}
      <CafeAddModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        cafeName={cafeName}
        setCafeName={setCafeName}
        cafeLocation={cafeLocation}
        setCafeLocation={setCafeLocation}
        locationError={locationError}
        isValidatingAddress={isValidatingAddress}
        onAdd={handleAdd}
        handleLocationChange={handleLocationChange}
      />

      {/* Location Filter Modal */}
      <LocationFilterModal
        isOpen={isLocationModalOpen}
        onClose={onLocationModalClose}
        filterRadius={filterRadius}
        setFilterRadius={setFilterRadius}
        userLocation={userLocation}
        setUserLocation={setUserLocation}
        onApplyFilter={handleApplyLocationFilter}
        onClearFilter={handleClearLocationFilter}
      />

      {/* Review Form Modal */}
      <ReviewForm
        cafe_id={reviewingCafeId}
        isOpen={!!reviewingCafeId}
        onClose={() => setReviewingCafeId(null)}
        onSubmitSuccess={() => {
          setReviewingCafeId(null);
          refetchCafes(); // Refresh cafe data after review submission
        }}
      />
    </Flex>
  );
};
export default Cafes;
