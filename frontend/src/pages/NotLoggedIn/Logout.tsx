import {useState} from "react";
import {
  Flex,
  Text,
  Button,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LogoutButton = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLogout = async () => {
  setIsLoggingOut(true);
  try {
    const response = await axios.post(
      "https://cafechronicles.vercel.app/api/auth/logout", 
       null,  
      { withCredentials: true }
    );
    
    if (response.status === 200) {
      // Clear client-side user data
      localStorage.removeItem('user');
      sessionStorage.removeItem('sessionData');
      
      // Show success notification
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      
      // Redirect to login
      navigate('/login');
    } 
  } catch (error) {
    const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         "Could not log out";
    
    toast({
      title: "Logout Failed",
      description: errorMessage,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  } finally {
    setIsLoggingOut(false);
    onClose();
  }
};

return (
    <>
      <Flex width="100%" justifyContent="center">
        <Button
          onClick={onOpen}
          borderRadius="50px"
          height="40px"
          width="100px"
          fontSize="xl"
          fontFamily="afacad"
          bg="#3970B5"
          color="white"
          shadow="xl"
          _hover={{
            bg: "white",
            color: "#3970B5",
          }}
        >
          Log out
        </Button>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl" mx={4}>
          <ModalHeader fontFamily="afacad">Confirm Logout</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontFamily="afacad" fontSize="lg">
              Are you sure you want to log out?
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={onClose}
              fontFamily="afacad"
              borderRadius="50px"
              px={6}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleLogout}
              isLoading={isLoggingOut}
              fontFamily="afacad"
              borderRadius="50px"
              px={6}
              bg="#3970B5"
              _hover={{ bg: "#2c5a8c" }}
            >
              Log out
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LogoutButton;