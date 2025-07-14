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

interface CafeAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  cafeName: string;
  setCafeName: (name: string) => void;
  cafeLocation: string;
  setCafeLocation: (location: string) => void;
  locationError: string;
  isValidatingAddress: boolean;
  onAdd: () => void;
  handleLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CafeAddModal = ({
  isOpen,
  onClose,
  cafeName,
  setCafeName,
  cafeLocation,
  setCafeLocation,
  locationError,
  isValidatingAddress,
  onAdd,
  handleLocationChange,
}: CafeAddModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Café</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired isInvalid={!cafeName}>
            <FormLabel>Café Name</FormLabel>
            <Input
              placeholder="Enter café name"
              value={cafeName}
              onChange={(e) => setCafeName(e.target.value)}
            />
            <FormErrorMessage>This field is required</FormErrorMessage>
          </FormControl>

          <FormControl mt={4} isRequired isInvalid={!!locationError}>
            <FormLabel>Café Location</FormLabel>
            <Input
              placeholder="Enter café location"
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
            onClick={onAdd}
            isLoading={isValidatingAddress}
            isDisabled={!cafeName || !!locationError || isValidatingAddress}
          >
            Add Café
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CafeAddModal;
