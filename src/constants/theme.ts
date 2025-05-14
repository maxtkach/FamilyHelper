export const COLORS = {
  primary: "#1E88E5",
  secondary: "#D32F2F",
  success: "#4CAF50",
  danger: "#F44336",
  warning: "#FFC107",
  info: "#2196F3",
  light: "#F5F5F5",
  dark: "#212121",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#9E9E9E",
  grayLight: "#E0E0E0",
  grayDark: "#616161",
  transparent: "transparent",
  background: "#F9F9F9",
  card: "#FFFFFF",
  text: "#212121",
  error: "#F44336",

  gradient: {
    primary: ["#1E88E5", "#4FC3F7"],
    secondary: ["#D32F2F", "#FF6659"],
    warning: ["#FFA000", "#FFD54F"],
  }
}

export const SIZES = {
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
};

export const FONTS = {
  regular: {
    fontWeight: "400",
  },
  medium: {
    fontWeight: "500",
  },
  bold: {
    fontWeight: "700",
  },
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5.46,
    elevation: 5,
  },
  dark: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.41,
    shadowRadius: 9.11,
    elevation: 14,
  },
};

export default { COLORS, SIZES, FONTS, SHADOWS }; 