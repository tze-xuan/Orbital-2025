import React, { useState } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  IconButton,
  Textarea,
  useDisclosure,
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
  onSubmitCallback: (reviewData: { rating: number; comment: string }) => void;
  isSubmitting: boolean;
}

const ReviewForm = ({ cafe_id, onSubmitCallback, isSubmitting = false }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
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
    
    try {
      await axios.post('https://cafechronicles.vercel.app/api/reviews/submit', { 
      rating, 
      comment 
    });

    // Clear form on successful submission
    setRating(0);
    setComment('');
    
    // Optional success notification
    toast({
      title: "Review Submitted!",
      description: "Thank you for your feedback",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

  } catch (error) {
    // Error handling
    toast({
      title: "Submission Failed",
      description: "There was an error submitting your review",
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
    {/* Add Review Button - To be placed in Cafe Card */}
      <Button 
        onClick={onOpen}
        size="sm"
        colorScheme="orange"
        variant="outline"
        mt={2}
        leftIcon={<StarIcon />}
      >
        Add Review
      </Button>

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

                <Textarea
                  placeholder="Share your experience..."
                  minH="150px"
                  focusBorderColor="orange.200"
                  {...register("comment", { 
                    required: "Review text is required",
                    minLength: { 
                      value: 20, 
                      message: "Please write at least 20 characters" 
                    }
                  })}
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