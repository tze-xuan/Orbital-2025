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
} from "../../components/Cafes/LocationFilterModal.tsx";
import { CafeType } from "../../interfaces/CafeType.tsx";
import { Bookmark } from "../../interfaces/BookmarkInterface.tsx";
import CafeFilterSection from "../../components/Cafes/CafeFilterSection.tsx";
import CafeList from "../../components/Cafes/CafeList.tsx";
import CafeEditModal from "../../components/Cafes/CafeEditModal.tsx";
import CafeAddModal from "../../components/Cafes/CafeAddModal.tsx";
import { FaHome } from "react-icons/fa";
import CafeReviews from "../../components/Cafes/ReviewList.tsx";

const Cafes = () => {
  const CAFE_API_ROUTE = "https://cafechronicles.vercel.app/api/cafes/";
  const BOOKMARK_API_ROUTE = "https://cafechronicles.vercel.app/api/bookmarks";

  const [data, setData] = useState<CafeType[] | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [, setError] = useState<string | null>(null); // Add error state
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

  const getCurrentUser = (): { id: string } | null => {
    try {
      const userString = localStorage.getItem("currentUser");
      if (!userString) return null;

      const user = JSON.parse(userString);
      return user ? { ...user, id: user.id.toString() } : null;
    } catch (error) {
      console.error("Error parsing current user:", error);
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const [userId, setUserId] = useState<number | null>(null);

  // Debug logging
  const debug = (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEBUG] ${message}`, data || "");
    }
  };

  // User ID fetch
  const getUserId = useCallback(async () => {
    try {
      debug("Attempting to get user ID");

      const config = {
        timeout: 3000,
        withCredentials: true,
      };

      const response = await Axios.get(
        "https://cafechronicles.vercel.app/api/auth/me",
        config
      );

      if (response.data?.id) {
        debug("User ID retrieved", response.data.id);
        setUserId(response.data.id);
        return;
      }

      debug("No user ID found in response");
      setUserId(null);
      toast({
        title: "Please log in",
        description: "You need to be logged in to use bookmarks",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      debug("Error in getUserId", error);
      setUserId(null);
    }
  }, [toast]);

  // Data fetching
  const getData = useCallback(async () => {
    try {
      debug("Fetching cafes");
      setIsLoading(true);
      setError(null);

      const response = await Axios.get(CAFE_API_ROUTE, {
        timeout: 10000,
        headers: { "Content-Type": "application/json" },
      });

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid data format received");
      }

      setData(response.data);
      debug("Cafes fetched successfully", response.data.length);
    } catch (error) {
      debug("Error fetching cafes", error);
      setError(`Failed to fetch cafes: ${error.message}`);
      setData([]);

      toast({
        title: "Error loading cafes",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [CAFE_API_ROUTE, toast]);

  // Bookmarks fetching
  const getBookmarks = useCallback(async () => {
    if (!userId) {
      debug("No user ID, clearing bookmarks");
      setBookmarks([]);
      return;
    }

    try {
      debug("Fetching bookmarks for user", userId);

      const response = await Axios.get(`${BOOKMARK_API_ROUTE}/user/${userId}`, {
        withCredentials: true,
        timeout: 5000,
      });

      setBookmarks(response.data || []);
      debug("Bookmarks fetched", response.data?.length);
    } catch (error) {
      debug("Error fetching bookmarks", error);
      setBookmarks([]);

      if (error.code !== "ECONNABORTED") {
        toast({
          title: "Could not load bookmarks",
          description: "Bookmarks feature temporarily unavailable",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  }, [userId, BOOKMARK_API_ROUTE, toast]);

  // Load cafes regardless of auth status
  useEffect(() => {
    getData();
  }, [getData]);

  // Only bookmarks require auth
  useEffect(() => {
    if (userId) getBookmarks();
  }, [userId, getBookmarks]);

  // Bookmark handling
  const handleBookmark = async (cafeId: number) => {
    if (!userId) {
      toast({
        title: "Please log in to bookmark",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const isBookmarked = bookmarks.some((b) => b.cafe_id === cafeId);
      const url = `${BOOKMARK_API_ROUTE}/user/${userId}/cafe/${cafeId}`;

      if (isBookmarked) {
        await Axios.delete(url, { withCredentials: true });
        toast({ title: "Bookmark removed", status: "info", duration: 2000 });
      } else {
        await Axios.post(
          BOOKMARK_API_ROUTE,
          { user_id: userId, cafe_id: cafeId },
          { withCredentials: true }
        );
        toast({ title: "Café bookmarked", status: "success", duration: 2000 });
      }

      await getBookmarks();
    } catch (error) {
      debug("Error handling bookmark", error);
      toast({
        title: "Error updating bookmark",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // const isBookmarked = (cafeId: number) => {
  //   return bookmarks.some((bookmark: Bookmark) => bookmark.cafe_id === cafeId);
  // };

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

  // Enhanced filtering logic
  const filteredCafes = (() => {
    if (!data) {
      console.log("No data available for filtering");
      return [];
    }

    const cafesToFilter = showBookmarked ? getBookmarkedCafes() : data;
    console.log("Cafes to filter:", cafesToFilter.length);

    // Apply search filter
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

    console.log("After search filter:", filtered.length);

    // Apply location filter
    if (userLocation) {
      filtered = filtered.filter((cafe: CafeType) => {
        if (!cafe.lat || !cafe.lng) return false;

        const distance = calculateDistance(
          userLocation.coordinates.lat,
          userLocation.coordinates.lng,
          parseFloat(cafe.lat.toString()),
          parseFloat(cafe.lng.toString())
        );

        return distance <= filterRadius;
      });
      console.log("After location filter:", filtered.length);
    }

    console.log("Final filtered cafes:", filtered);
    return filtered;
  })();

  useEffect(() => {
    getUserId();
  }, [getUserId]);

  // Use effects with better dependency management
  useEffect(() => {
    console.log("User ID changed:", userId);
    if (userId !== null) {
      // Fetch both data and bookmarks when user ID is available
      getData();
      getBookmarks();
    } else {
      // Clear data when no user
      setData([]);
      setBookmarks([]);
    }
  }, [userId, getBookmarks, getData]); // Only depend on userId

  // Simplified useEffect to avoid circular dependencies
  useEffect(() => {
    // This effect runs when getBookmarks changes, but we want to avoid circular calls
    if (userId && data === null && !isLoading) {
      console.log("Data is null but user exists, fetching data");
      getData();
    }
  }, [getBookmarks, userId, data, isLoading, getData]);

  // Your other handler functions remain the same...
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

  const editIndex = (i: number) => {
    if (!data) return;
    setEditedId(data[i].id.toString());
    setCafeName(data[i].cafeName);
    setCafeLocation(data[i].cafeLocation);
    setLocationError("");
  };

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

  // const refetchCafes = useCallback(() => {
  //   getData();
  //   getBookmarks();
  // }, [getData, getBookmarks]);

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
        onClearLocationFilter={() => setUserLocation(null)}
      />

      <CafeList
        cafes={filteredCafes}
        user={currentUser}
        currentUserId={currentUser?.id}
        showBookmarked={showBookmarked}
        searchTerm={searchTerm}
        userLocation={userLocation}
        filterRadius={filterRadius}
        isBookmarked={(id) => bookmarks.some((b) => b.cafe_id === id)}
        onBookmark={handleBookmark}
        onEdit={handleEditIndex}
        onDelete={handleDelete}
        onReviewSubmit={setReviewingCafeId}
      />

      {reviewingCafeId && (
        <CafeReviews cafeId={reviewingCafeId} currentUserId={userId} />
      )}

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

      {/* Your modals remain the same... */}
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
    </Flex>
  );
};

export default Cafes;
