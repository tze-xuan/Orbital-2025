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
  onSubmitSuccess: () => void;
}

type ReviewFormData = {
  rating: number;
  comment?: string;
  avgPricePerPax: number;
};

const ReviewForm = ({ 
  cafe_id, 
  isOpen, 
  onClose, 
  onSubmitSuccess 
}: ReviewFormProps) => {
const toast = useToast();
const { 
  register, 
  handleSubmit, 
  setValue,
  watch,
  formState: { errors, isSubmitting },
  reset
  } = useForm<ReviewFormData>({
    defaultValues: {
      rating: 0,
      avgPricePerPax: 0
    }
  });

const ratingValue = watch('rating');
const submitReview = async (formData: ReviewFormData) => {

    try {
      await axios.post('https://cafechronicles.vercel.app/api/reviews/submit', {
      cafe_id,
      rating: formData.rating,
      comment: formData.comment || null,
      avgPricePerPax: formData.avgPricePerPax
    },
    { withCredentials: true }
  );

    // Clear form on successful submission
    reset();
    onClose();
    onSubmitSuccess(); 
    
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

  const setRating = (value: number) => {
      setValue("rating", value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Review Cafe</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(submitReview)}>
          <ModalBody>
            {/* Rating Control */}
            <FormControl isInvalid={!!errors.rating} mb={4}>
              <Flex justify="center">
                {[...Array(5)].map((_, i) => (
                  <IconButton
                    key={i}
                    aria-label={`Rate ${i+1} stars`}
                    icon={<StarIcon />}
                    variant="ghost"
                    color={i < ratingValue ? "yellow.400" : "gray.300"}
                    fontSize="3xl"
                    onClick={() => setRating(i+1)}
                    _hover={{ color: "yellow.500" }}
                    size="lg"
                  />
                ))}
              </Flex>
              
              <Box bg="gray.50" p={3} borderRadius="md" mt={2} textAlign="center">
                Your rating: {ratingValue}/5
              </Box>
              
              <input
                type="hidden"
                {...register("rating", { 
                  required: "Rating is required",
                  validate: value => value > 0 || "Please select a rating"
                })}
              />
              <FormErrorMessage>
                {errors.rating && errors.rating.message}
              </FormErrorMessage>
            </FormControl>

            {/* Average Price Per Pax */}
            <FormControl isInvalid={!!errors.avgPricePerPax} mb={4}>
              <FormLabel>Average Price Per Person (SGD)</FormLabel>
              <Input
                type="number"
                placeholder="e.g., 10.50"
                min="0"
                step="0.01"
                bg="white"
                {...register("avgPricePerPax", { 
                  required: "Price is required",
                  min: { value: 0.01, message: "Price must be greater than 0" }
                })}
              />
              <FormErrorMessage>
                {errors.avgPricePerPax && errors.avgPricePerPax.message}
              </FormErrorMessage>
            </FormControl>

            {/* Comment */}
            <FormControl isInvalid={!!errors.comment} mb={4}>
              <Textarea
                placeholder="Share your experience..."
                minH="150px"
                focusBorderColor="orange.200"
                {...register("comment")}
              />
              <FormErrorMessage>
                {errors.comment && errors.comment.message}
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
              isDisabled={ratingValue === 0}
            >
              Submit Review
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

export default ReviewForm;