import React, { useState } from "react";
import {
  Button,
  Flex,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  IconButton,
  Textarea,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import { useForm } from "react-hook-form";
import axios from "axios";

interface ReviewFormProps {
  cafe_id: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmitCallback: (reviewData: { rating: number; comment: string; avgPricePerPax: number; }) => void;
  isSubmitting: boolean;
}

const ReviewForm = ({ 
  cafe_id, 
  isOpen, 
  onClose, 
  isSubmitting 
}: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [avgPricePerPax, setAvgPricePerPax] = useState<string>('');
  const toast = useToast();
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm();

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate average price
    const priceValue = parseFloat(avgPricePerPax);
    if (isNaN(priceValue)) {
      toast({
        title: "Price required",
        description: "Please enter a valid average price",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      await axios.post('https://cafechronicles.vercel.app/api/reviews/submit', {
      cafe_id,
      rating, 
      comment: comment || null,
      avgPricePerPax: priceValue
    },
    { withCredentials: true }
  );

    // Clear form on successful submission
    setRating(0);
    setComment('');
    setAvgPricePerPax('');
    onClose(); 
    
    // Success notification
    toast({
      title: "Review Submitted!",
      description: "Thank you for your feedback",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

  } catch (error: any) {
    // Error handling
    const errorMessage = error.response?.data?.error || 
                         error.message || 
                         'Failed to submit review';
    toast({
      title: "Submission Failed",
      description: errorMessage,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};

function getSafeErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message?: unknown }).message as string || 'Validation error';
  }
  return 'Validation error';
}

  return (
    <form onSubmit={submitReview}>
      {/* Review Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Review Cafe</ModalHeader>
          <ModalCloseButton />
          
          <form onSubmit={handleSubmit(submitReview)}>
            <ModalBody>
              <FormControl isInvalid={!!errors.comment}>
                <Flex mb={4} justify="center">
                  {[...Array(5)].map((_, i) => (
                    <IconButton
                      key={i}
                      aria-label={`Rate ${i+1} stars`}
                      icon={<StarIcon />}
                      variant="ghost"
                      color={i < rating ? "yellow.400" : "gray.300"}
                      fontSize="3xl"
                      onClick={() => setRating(i+1)}
                      _hover={{ color: "yellow.500" }}
                      size="lg"
                    />
                  ))}
                </Flex>
                
                <Box bg="gray.50" p={3} borderRadius="md" mb={3}>
                  Your rating: {rating}/5
                </Box>

                {/* Average Price Per Pax Field */}
                <FormControl mb={4} isInvalid={!!errors.avgPricePerPax}>
                  <FormLabel>Average Price Per Person (SGD)</FormLabel>
                  <Input
                    type="number"
                    placeholder="e.g., 10.50"
                    value={avgPricePerPax}
                    onChange={(e) => setAvgPricePerPax(e.target.value)}
                    min="0"
                    step="0.01"
                    bg="white"
                  />
                </FormControl>

                <Textarea
                  placeholder="Share your experience..."
                  minH="150px"
                  focusBorderColor="orange.200"
                  {...register("comment", )}
                />
                <FormErrorMessage>
                    {errors.comment && (
                        <span className="error">
                            {getSafeErrorMessage(errors.comment)}
                        </span>
                    )}
                </FormErrorMessage>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button 
                type="submit" 
                colorScheme="blue" 
                fontSize="l"
                fontFamily="afacad"
                isLoading={isSubmitting}
                isDisabled={rating === 0 || isSubmitting}
              >
                Submit Review
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </form>
  );
}

export default ReviewForm;