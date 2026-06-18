import { Provider } from "@/components/ui/provider";
import {
  Box,
} from '@chakra-ui/react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <Box minH="100vh" bg="gray.100">
        {children}
      </Box>
    </Provider>
  );
}