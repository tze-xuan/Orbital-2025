import React, { useState } from "react";
import { Flex, Text } from "@chakra-ui/react";
import { CafeType } from "../../interfaces/CafeInterface.tsx";
import { LocationResult } from "./LocationFilterModal.tsx";
import CafeCard from "./CafeCard";
import ReviewForm from "./Review.tsx";

interface ReviewData {
  cafeId: number;
  rating: number;
  comment: string;
  avgPricePerPax: number;
}

interface CafeListProps {
  cafes: CafeType[];
  showBookmarked: boolean;
  searchTerm: string;
  userLocation: LocationResult | null;
  filterRadius: number;
  isBookmarked: (cafeId: number) => boolean;
  onBookmark: (cafeId: number) => void;
  onEdit: (index: number) => void;
  onDelete: (cafeId: number) => void;
  onReviewSubmit: (review: ReviewData) => void;
}

const CafeList = ({
  cafes,
  showBookmarked,
  searchTerm,
  userLocation,
  filterRadius,
  isBookmarked,
  onBookmark,
  onEdit,
  onDelete,
  onReviewSubmit,
}: CafeListProps) => {
  // Results Info
  const showResultsInfo = searchTerm || userLocation;
  const [reviewingCafeId, setReviewingCafeId] = useState<number | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Empty state messages
  const getEmptyStateMessage = () => {
    if (showBookmarked) {
      return searchTerm || userLocation
        ? "No bookmarked cafés match your filters."
        : "No bookmarked cafés yet. Start exploring and bookmark your favorites!";
    }
    return searchTerm || userLocation
      ? "No cafés match your filters."
      : "No cafés found.";
  };

  const handleReviewSubmit = async (reviewData: { 
    rating: number; 
    comment: string;
    avgPricePerPax: number;
  }) => {
    if (!reviewingCafeId) return;
    
    setIsSubmittingReview(true);
    try {
      await onReviewSubmit({
        cafeId: reviewingCafeId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        avgPricePerPax: reviewData.avgPricePerPax
      });
      setReviewingCafeId(null); // Close form on success
    } catch (error) {
      console.error("Review submission failed:", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };


  return (
    <>
      {/* Results Info */}
      {showResultsInfo && (
        <Text fontSize="md" fontFamily="afacad" textAlign="center">
          {cafes.length} café{cafes.length !== 1 ? "s" : ""} found
          {searchTerm && ` for "${searchTerm}"`}
          {userLocation && ` within ${filterRadius}km`}
        </Text>
      )}

      {/* Empty State */}
      {cafes.length === 0 && (
        <Text fontSize="lg" fontFamily="afacad" textAlign="center">
          {getEmptyStateMessage()}
        </Text>
      )}

      {/* Cafe Cards */}
      <Flex
        alignItems="center"
        maxH="60vh"
        overflowY="auto"
        scrollBehavior="smooth"
        direction="column"
        width="100%"
        gap="2vh"
        paddingBottom="18px"
      >
        {cafes.map((cafe: CafeType, index: number) => (
          <CafeCard
            key={cafe.id}
            cafe={cafe}
            index={index}
            isBookmarked={isBookmarked(cafe.id)}
            userLocation={userLocation}
            onBookmark={onBookmark}
            onEdit={onEdit}
            onDelete={onDelete}
            onReviewSubmit={() => setReviewingCafeId(cafe.id)}
          />
        ))}
      </Flex>

      {/* Single Review Form (conditionally rendered) */}
      {reviewingCafeId && (
        <ReviewForm 
          cafe_id={reviewingCafeId}
          isOpen={!!reviewingCafeId}
          onClose={() => setReviewingCafeId(null)}
          onSubmitCallback={handleReviewSubmit}
          isSubmitting={isSubmittingReview}
        />
      )}
    </>
  );
};

export default CafeList;