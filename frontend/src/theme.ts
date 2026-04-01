import { createSystem, defineConfig, defaultConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#EFF6FF" },
          100: { value: "#DBEAFE" },
          200: { value: "#BFDBFE" },
          300: { value: "#93C5FD" },
          400: { value: "#60A5FA" },
          500: { value: "#2563EB" },
          600: { value: "#1D4ED8" },
          700: { value: "#1E40AF" },
          800: { value: "#1E3A8A" },
          900: { value: "#172554" },
        },

        success: {
          500: { value: "#22C55E" },
        },

        warning: {
          500: { value: "#F59E0B" },
        },

        danger: {
          500: { value: "#EF4444" },
        },
      },

      fonts: {
        heading: { value: "Inter, system-ui, sans-serif" },
        body: { value: "Inter, system-ui, sans-serif" },
      },

      radii: {
        md: { value: "12px" },
        lg: { value: "16px" },
        xl: { value: "20px" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);