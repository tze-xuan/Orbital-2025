import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React from "react";

interface CafeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRef: React.RefObject<HTMLInputElement>;
  cafeName: string;
  setCafeName: (name: string) => void;
  cafeLocation: string;
  setCafeLocation: (location: string) => void;
  locationError: string;
  isValidatingAddress: boolean;
  onSave: () => void;
  handleLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CafeEditModal = ({
  isOpen,
  onClose,
  initialRef,
  cafeName,
  setCafeName,
  cafeLocation,
  setCafeLocation,
  locationError,
  isValidatingAddress,
  onSave,
  handleLocationChange,
}: CafeEditModalProps) => {
  return (
    <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Café</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired isInvalid={!cafeName}>
            <FormLabel>Café Name</FormLabel>
            <Input
              ref={initialRef}
              placeholder={cafeName}
              value={cafeName}
              onChange={(e) => setCafeName(e.target.value)}
            />
            <FormErrorMessage>This field is required</FormErrorMessage>
          </FormControl>

          <FormControl mt={4} isRequired isInvalid={!!locationError}>
            <FormLabel>Café Location</FormLabel>
            <Input
              placeholder={cafeLocation}
              value={cafeLocation}
              onChange={handleLocationChange}
            />
            <FormErrorMessage>{locationError}</FormErrorMessage>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={onSave}
            isLoading={isValidatingAddress}
            isDisabled={!cafeName || !!locationError || isValidatingAddress}
          >
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CafeEditModal;
