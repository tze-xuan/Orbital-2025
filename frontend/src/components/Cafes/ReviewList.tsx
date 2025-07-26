import React, { useState, useEffect } from "react";
import {
  Box,
  useDisclosure,
  Text,
  Textarea,
  Avatar,
  Flex,
  Button,
  Skeleton,
  SkeletonText,
  useToast,
  Badge,
  SkeletonCircle,
  IconButton,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Divider,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { Review } from "../../interfaces/ReviewInterface.tsx";
import axios from "axios";
axios.defaults.withCredentials = true;

interface CafeReviewsProps {
  cafeId: string | number;
  currentUserId: string | number | null;
}

const CafeReviews: React.FC<CafeReviewsProps> = ({ cafeId, currentUserId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editedComment, setEditedComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `https://cafechronicles.vercel.app/api/reviews/${cafeId}`
        );
        setReviews(response.data.reviews);
        setAverageRating(response.data.averageRating || 0);
      } catch (error) {
        console.error("Error fetching reviews:", error);

        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
        }

        toast({
          title: "Error",
          description: error.message || "Failed to load reviews",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (cafeId) {
      fetchReviews();
    }
  }, [cafeId, toast]);

  // Function to render star ratings with better styling
  const renderStars = (rating) => {
    return (
      <HStack spacing={0}>
        {[...Array(5)].map((_, i) => (
          <Text
            key={i}
            color={i < rating ? "#FFD700" : "gray.300"}
            fontSize="lg"
            textShadow={i < rating ? "0 0 3px rgba(255, 215, 0, 0.3)" : "none"}
          >
            ★
          </Text>
        ))}
      </HStack>
    );
  };

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Calculate average price & price range only from reviews with valid prices
  const validPriceReviews = reviews.filter(
    (review) =>
      review.avgPricePerPax !== null &&
      review.avgPricePerPax !== undefined &&
      !isNaN(Number(review.avgPricePerPax)) &&
      review.avgPricePerPax > 0
  );

  const avgPrice =
    validPriceReviews.length > 0
      ? validPriceReviews.reduce(
          (sum, review) => sum + Number(review.avgPricePerPax),
          0
        ) / validPriceReviews.length
      : null;

  const hasValidPrices = validPriceReviews.length > 0;

  const priceRange = hasValidPrices
    ? validPriceReviews.reduce(
        (acc, review) => ({
          min: Math.min(acc.min, review.avgPricePerPax),
          max: Math.max(acc.max, review.avgPricePerPax),
        }),
        { min: Infinity, max: -Infinity }
      )
    : null;

  const handleEditClick = (review: Review) => {
    setEditingReviewId(review.id);
    setEditedComment(review.comment || "");
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditedComment("");
  };

  const handleSaveEdit = async (reviewId: number) => {
    if (!editedComment.trim()) {
      toast({
        title: "Validation Error",
        description: "Comment cannot be empty",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await axios.put(
        `https://cafechronicles.vercel.app/api/reviews/${reviewId}`,
        { comment: editedComment }
      );

      setReviews(
        reviews.map((review) =>
          review.id === reviewId
            ? { ...review, comment: editedComment }
            : review
        )
      );

      toast({
        title: "Review Updated",
        description: "Your review has been updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setEditingReviewId(null);
      setEditedComment("");
    } catch (error) {
      console.error("Error updating review:", error);
      toast({
        title: "Update Failed",
        description:
          error instanceof Error ? error.message : "Failed to update review",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (reviewId: number) => {
    setDeleteReviewId(reviewId);
    onOpen();
  };

  const handleDelete = async () => {
    if (!deleteReviewId) return;

    try {
      setIsSubmitting(true);

      await axios.delete(
        `https://cafechronicles.vercel.app/api/reviews/${deleteReviewId}`
      );

      setReviews(reviews.filter((review) => review.id !== deleteReviewId));

      const remainingReviews = reviews.filter(
        (review) => review.id !== deleteReviewId
      );
      if (remainingReviews.length > 0) {
        const newAverage =
          remainingReviews.reduce((sum, review) => sum + review.rating, 0) /
          remainingReviews.length;
        setAverageRating(newAverage);
      } else {
        setAverageRating(0);
      }

      toast({
        title: "Review Deleted",
        description: "Your review has been deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Delete Failed",
        description:
          error instanceof Error ? error.message : "Failed to delete review",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
      setDeleteReviewId(null);
      onClose();
    }
  };

  if (isLoading) {
    return (
      <Box p={6} bg="gray.50" borderRadius="xl" boxShadow="sm">
        <Skeleton height="50px" mb={8} borderRadius="lg" />
        <VStack spacing={6}>
          {[...Array(3)].map((_, i) => (
            <Box
              key={i}
              p={6}
              shadow="lg"
              borderWidth="0"
              borderRadius="xl"
              bg="white"
              w="full"
            >
              <Flex mb={4} align="center">
                <SkeletonCircle size="12" mr={4} />
                <VStack align="start" spacing={2}>
                  <Skeleton height="20px" width="140px" />
                  <Skeleton height="15px" width="100px" />
                </VStack>
              </Flex>
              <SkeletonText mt="4" noOfLines={3} spacing="4" />
            </Box>
          ))}
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      p={6}
      maxWidth="900px"
      mx="auto"
      bg="gray.50"
      borderRadius="xl"
      boxShadow="sm"
    >
      {/* Header */}
      <VStack spacing={6} mb={8}>
        <Text
          fontFamily="afacad"
          fontWeight="black"
          fontSize="xl"
          color="gray.800"
          textAlign="center"
        >
          Reviews
        </Text>

        {/* Stats Badges */}
        {(averageRating > 0 || hasValidPrices) && (
          <Flex wrap="wrap" justify="center" gap={4}>
            {averageRating > 0 && (
              <Badge
                colorScheme="yellow"
                fontSize="lg"
                px={4}
                py={2}
                borderRadius="full"
                boxShadow="md"
              >
                ⭐ {averageRating.toFixed(1)} / 5
              </Badge>
            )}

            {priceRange &&
              priceRange.min !== null &&
              priceRange.max !== null && (
                <Badge
                  colorScheme="green"
                  fontSize="lg"
                  px={4}
                  py={2}
                  borderRadius="full"
                  boxShadow="md"
                >
                  💰 SGD {Number(priceRange.min).toFixed(2)} -{" "}
                  {Number(priceRange.max).toFixed(2)}
                </Badge>
              )}

            {avgPrice && !isNaN(avgPrice) && avgPrice > 0 && (
              <Badge
                colorScheme="blue"
                fontSize="lg"
                px={4}
                py={2}
                borderRadius="full"
                boxShadow="md"
              >
                📊 Avg: SGD {avgPrice.toFixed(2)}
              </Badge>
            )}
          </Flex>
        )}
      </VStack>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              🗑️ Delete Review
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this review? This action cannot be
              undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onClose}
                isDisabled={isSubmitting}
                borderRadius="lg"
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={isSubmitting}
                borderRadius="lg"
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Box
          textAlign="center"
          py={12}
          bg="white"
          borderRadius="xl"
          boxShadow="md"
        >
          <Text fontSize="6xl" mb={4}>
            ☕
          </Text>
          <Text fontSize="xl" color="gray.600" fontWeight="medium">
            No reviews yet
          </Text>
          <Text fontSize="md" color="gray.500" mt={2}>
            Be the first to share your experience!
          </Text>
        </Box>
      ) : (
        <VStack spacing={6}>
          {reviews.map((review, index) => (
            <Box
              key={review.id}
              p={6}
              shadow="lg"
              borderWidth="0"
              borderRadius="xl"
              bg="white"
              position="relative"
              w="full"
              transition="all 0.2s"
              _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
            >
              {/* Edit/Delete buttons */}
              {currentUserId &&
                String(review.user_id) === String(currentUserId) && (
                  <HStack
                    position="absolute"
                    top={4}
                    right={4}
                    spacing={2}
                    zIndex={10}
                  >
                    {editingReviewId === review.id ? (
                      <>
                        <IconButton
                          aria-label="Save edit"
                          icon={<CheckIcon />}
                          colorScheme="green"
                          size="sm"
                          borderRadius="lg"
                          onClick={() => handleSaveEdit(review.id)}
                          isLoading={isSubmitting}
                        />
                        <IconButton
                          aria-label="Cancel edit"
                          icon={<CloseIcon />}
                          colorScheme="gray"
                          size="sm"
                          borderRadius="lg"
                          onClick={handleCancelEdit}
                          isDisabled={isSubmitting}
                        />
                      </>
                    ) : (
                      <>
                        <IconButton
                          aria-label="Edit review"
                          icon={<EditIcon />}
                          colorScheme="blue"
                          size="sm"
                          borderRadius="lg"
                          onClick={() => handleEditClick(review)}
                        />
                        <IconButton
                          aria-label="Delete review"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          size="sm"
                          borderRadius="lg"
                          onClick={() => confirmDelete(review.id)}
                        />
                      </>
                    )}
                  </HStack>
                )}

              {/* User Info & Rating */}
              <Flex align="center" mb={4}>
                <Avatar name={review.username} mr={4} size="md" bg="blue.500" />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold" fontSize="lg" color="gray.800">
                    {review.username}
                  </Text>
                  <HStack>
                    {renderStars(review.rating)}
                    <Text fontSize="sm" color="gray.500" ml={2}>
                      • {formatDate(review.created_at)}
                    </Text>
                  </HStack>
                </VStack>
              </Flex>

              <Divider mb={4} />

              {/* Rating Badge */}
              <Badge
                colorScheme="orange"
                mb={4}
                fontSize="md"
                px={3}
                py={1}
                borderRadius="lg"
              >
                {review.rating} {review.rating === 1 ? "star" : "stars"}
              </Badge>

              {/* Comment */}
              {editingReviewId === review.id ? (
                <Textarea
                  value={editedComment}
                  onChange={(e) => setEditedComment(e.target.value)}
                  placeholder="Edit your comment..."
                  minH="120px"
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                  bg="gray.50"
                />
              ) : (
                review.comment && (
                  <Text
                    whiteSpace="pre-line"
                    fontSize="md"
                    lineHeight="1.6"
                    color="gray.700"
                    bg="gray.50"
                    p={4}
                    borderRadius="lg"
                  >
                    {review.comment}
                  </Text>
                )
              )}
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default CafeReviews;
