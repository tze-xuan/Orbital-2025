import { Button, ButtonProps } from "@chakra-ui/react";
import { ReactNode } from "react";

interface NavButtonProps extends ButtonProps {
  children: ReactNode;
}

export const NavButton = ({ children, ...props }: NavButtonProps) => {
  return (
    <Button
      fontFamily="afacad"
      fontSize="lg"
      fontWeight="medium"
      color="#3E405B"
      _hover={{ textDecoration: "underline", color: "#DC6739" }}
      variant="plain"
      {...props}
    >
      {children}
    </Button>
  );
};
