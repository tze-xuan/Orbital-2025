import { Button, ButtonProps } from "@chakra-ui/react";
import { ReactNode } from "react";

interface NavButtonProps extends ButtonProps {
  children: ReactNode;
  href?: string;
}

export const NavButton = ({ children, ...props }: NavButtonProps) => {
  return (
    <Button
      fontFamily="afacad"
      fontSize={`min(3vw, 3vh)`}
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
