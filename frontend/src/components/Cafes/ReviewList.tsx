import React, { useState, useEffect} from 'react';
import { 
  Box, 
  useDisclosure,
  Heading, 
  Text, 
  Textarea,
  Stack, 
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
  AlertDialogFooter
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { Review } from "../../interfaces/ReviewInterface.tsx"
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
        `https://cafechronicles.vercel.app/api/reviews/${cafeId}`,
      );
      setReviews(response.data.reviews);
      setAverageRating(response.data.averageRating || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      
      // Error logging
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to load reviews',
        status: 'error',
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

  // Function to render star ratings
  const renderStars = (rating) => {
    return (
      <Flex>
        {[...Array(5)].map((_, i) => (
          <Text key={i} color={i < rating ? 'orange.400' : 'gray.300'}>
            ★
          </Text>
        ))}
      </Flex>
    );
  };

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
        day: 'numeric',month: 'long', year: 'numeric'
    });
  };

  // Calculate average price & price range only from reviews with valid prices
  const validPriceReviews = reviews.filter(review => 
    review.avgPricePerPax !== null && 
    review.avgPricePerPax !== undefined &&
    !isNaN(Number(review.avgPricePerPax)) &&
    review.avgPricePerPax > 0
  );

  // Calculate Avg average price per pax
  const avgPrice = validPriceReviews.length > 0 
    ? validPriceReviews.reduce((sum, review) => sum + Number(review.avgPricePerPax), 0) / validPriceReviews.length
    : null;

  const hasValidPrices = validPriceReviews.length > 0;

  // Price range of avg price per pax
  const priceRange = hasValidPrices 
    ? validPriceReviews.reduce((acc, review) => ({
      min: Math.min(acc.min, review.avgPricePerPax),
      max: Math.max(acc.max, review.avgPricePerPax)
    }), { min: Infinity, max: -Infinity })
  : null;

  // Start editing a review
  const handleEditClick = (review: Review) => {
    setEditingReviewId(review.id);
    setEditedComment(review.comment || "");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditedComment("");
  };

  // Save edited review
  const handleSaveEdit = async (reviewId: number) => {
    if (!editedComment.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Comment cannot be empty',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // API call to update review
      await axios.put(
        `https://cafechronicles.vercel.app/api/reviews/${reviewId}`,
        { comment: editedComment} 
      );

      // Update local state
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, comment: editedComment } 
          : review
      ));

      toast({
        title: 'Review Updated',
        description: 'Your review has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setEditingReviewId(null);
      setEditedComment("");
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update review',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm delete dialog
  const confirmDelete = (reviewId: number) => {
    setDeleteReviewId(reviewId);
    onOpen();
  };

  // Execute delete after confirmation
  const handleDelete = async () => {
    if (!deleteReviewId) return;

    try {
      setIsSubmitting(true);
      
      // API call to delete review
      await axios.delete(
        `https://cafechronicles.vercel.app/api/reviews/${deleteReviewId}`
      );

      // Update local state
      setReviews(reviews.filter(review => review.id !== deleteReviewId));
      
      // Recalculate average rating
      const remainingReviews = reviews.filter(review => review.id !== deleteReviewId);
      if (remainingReviews.length > 0) {
        const newAverage = remainingReviews.reduce((sum, review) => sum + review.rating, 0) / remainingReviews.length;
        setAverageRating(newAverage);
      } else {
        setAverageRating(0);
      }

      toast({
        title: 'Review Deleted',
        description: 'Your review has been deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete review',
        status: 'error',
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
      <Box p={5}>
        <Skeleton height="40px" mb={6} />
        {[...Array(3)].map((_, i) => (
          <Box key={i} p={5} shadow="md" borderWidth="1px" mb={4} borderRadius="md">
            <Flex mb={4}>
              <SkeletonCircle size="10" mr={3} />
              <Box>
                <Skeleton height="20px" width="120px" mb={2} />
                <Skeleton height="15px" width="80px" />
                <Skeleton height="40px" width="180px" borderRadius="lg" />
              </Box>
            </Flex>
            <SkeletonText mt="4" noOfLines={4} spacing="4" />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box p={5} maxWidth="800px" mx="auto">
      <Heading as="h2" size="xl" mb={6} textAlign="center">
        Customer Reviews
      </Heading>

    {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Review
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} isDisabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDelete} 
                ml={3}
                isLoading={isSubmitting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

    {/* Badge Container - Always show if any data exists */}
    <Flex align="center" justify="center" mb={10} wrap="wrap" gap={3}>
      {averageRating > 0 && (
          <Badge colorScheme="orange" fontSize="xl" p={3} borderRadius="lg">
            <Text
                fontFamily="darumadrop"
                fontSize="100%"
                maxW="80vw"
                textAlign="center"
            >
                Average Rating: {averageRating.toFixed(1)} / 5
            </Text> 
          </Badge>
      )}

      {priceRange && priceRange.min !== null && priceRange.max !== null && (
      <Badge colorScheme="green" fontSize="xl" p={3} borderRadius="lg">
        <Text
          fontFamily="darumadrop"
          fontSize="100%"
          maxW="80vw"
          textAlign="center"
        >
          Price Range: SGD {Number(priceRange.min).toFixed(2)} - {Number(priceRange.max).toFixed(2)}
        </Text>  
     </Badge>
      )}
      
      {avgPrice && !isNaN(avgPrice) && avgPrice > 0 && (
        <Badge colorScheme="blue" fontSize="xl" p={3} borderRadius="lg">
          <Text
            fontFamily="darumadrop"
            fontSize="100%"
            maxW="80vw"
            textAlign="center"
          >
            Avg. Price Per Pax: SGD {avgPrice.toFixed(2)}
          </Text>
        </Badge>
      )}
    </Flex>

      {reviews.length === 0 ? (
        <Text textAlign="center" fontSize="lg" color="gray.500">
          No reviews yet. Be the first to review this cafe!
        </Text>
      ) : (
        <Stack spacing={8}>
          {reviews.map((review) => (
            <Box 
              key={review.id}
              p={5} 
              shadow="md" 
              borderWidth="1px" 
              borderRadius="lg"
              bg="white"
              position="relative" 
            >
              {/* Edit/Delete buttons for current user's reviews */}
              {currentUserId && String(review.user_id) === String(currentUserId) && (
                <Flex 
                  position="absolute" 
                  top={4} 
                  right={4} 
                  gap={2} 
                  zIndex={10}
                >
                  {editingReviewId === review.id ? (
                    <>
                      <IconButton
                        aria-label="Save edit"
                        icon={<CheckIcon />}
                        colorScheme="green"
                        size="sm"
                        onClick={() => handleSaveEdit(review.id)}
                        isLoading={isSubmitting}
                      />
                      <IconButton
                        aria-label="Cancel edit"
                        icon={<CloseIcon />}
                        colorScheme="gray"
                        size="sm"
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
                        onClick={() => handleEditClick(review)}
                      />
                      <IconButton
                        aria-label="Delete review"
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => confirmDelete(review.id)}
                      />
                    </>
                  )}
                </Flex>
              )}

              <Flex align="center" mb={4}>
                <Avatar name={review.username} mr={3} />
                <Box>
                  <Text fontWeight="bold">{review.username}</Text>
                  <Flex align="center">
                    {renderStars(review.rating)}
                    <Text ml={2} fontSize="sm" color="gray.500">
                      {formatDate(review.created_at)}
                    </Text>
                  </Flex>
                </Box>
              </Flex>
              
              <Text fontSize="lg" mb={3} fontWeight="semibold">
                { `Rated: ${review.rating} stars`}
              </Text>
              
              {editingReviewId === review.id ? (
                <Textarea
                  value={editedComment}
                  onChange={(e) => setEditedComment(e.target.value)}
                  placeholder="Edit your comment..."
                  mb={3}
                  minH="100px"
                />
              ) : (
                review.comment && (
                  <Text whiteSpace="pre-line">{review.comment}</Text>
                )
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default CafeReviews;