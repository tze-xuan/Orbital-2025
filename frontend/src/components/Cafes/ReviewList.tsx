import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Heading, 
  Text, 
  Stack, 
  Avatar, 
  Flex, 
  Skeleton, 
  SkeletonText,
  useToast,
  Badge,
  SkeletonCircle
} from '@chakra-ui/react';
import { Review } from "../../interfaces/ReviewInterface.tsx"

interface CafeReviewsProps {
  cafeId: string | number;
}

const CafeReviews: React.FC<CafeReviewsProps> = ({ cafeId }) => {
  const { cafe_id } = useParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToast();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/reviews/${cafe_id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await response.json();
        setReviews(data.reviews);
        setAverageRating(data.averageRating || 0);
      } catch (error) {
        console.error('Error fetching reviews:', error);
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

    fetchReviews();
  }, [cafe_id, toast]);

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
      
      {averageRating > 0 && (
        <Flex align="center" justify="center" mb={10}>
          <Badge 
            colorScheme="orange" 
            fontSize="xl" 
            p={3} 
            borderRadius="lg"
          >
            Average Rating: {averageRating.toFixed(1)} / 5
          </Badge>
        </Flex>
      )}

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
            >
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
              
              {review.comment && (
                <Text whiteSpace="pre-line">{review.comment}</Text>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default CafeReviews;