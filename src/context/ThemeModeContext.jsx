import React, { createContext, useContext, useMemo, useState } from "react";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

const ThemeModeContext = createContext(null);

export const useThemeMode = () => useContext(ThemeModeContext);

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem("myringnet-theme") || "light");

  const toggleMode = () => {
    setMode((current) => {
      const next = current === "light" ? "dark" : "light";
      localStorage.setItem("myringnet-theme", next);
      return next;
    });
  };

  const theme = useMemo(
    () => createTheme({
      palette: {
        mode,
        primary: { main: mode === "light" ? "#5b4be8" : "#8072ff" },
        secondary: { main: "#16a3a5" },
        divider: mode === "light" ? "#e5e7ef" : "#303543",
        text: mode === "light"
          ? { primary: "#202330", secondary: "#687083" }
          : { primary: "#f2f3f7", secondary: "#a9afbe" },
        background: mode === "light"
          ? { default: "#f6f7fb", paper: "#ffffff" }
          : { default: "#0f1118", paper: "#1a1d27" },
      },
      shape: { borderRadius: 14 },
      typography: {
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
        h4: { fontWeight: 750 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 },
        button: { textTransform: "none", fontWeight: 650 },
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundImage: "none",
              border: "1px solid",
              borderColor: mode === "light" ? "#eceef5" : "#2b2f3c",
            },
          },
        },
        MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              scrollbarColor: mode === "light" ? "#b7bdca #eef0f5" : "#454b5d #151821",
            },
            "*": { transition: "background-color 160ms ease, border-color 160ms ease, color 120ms ease" },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              backgroundColor: mode === "light" ? "#fff" : "#141720",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: mode === "light" ? "#d8dce6" : "#3a4050",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: mode === "light" ? "#aeb5c4" : "#555d72",
              },
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: { border: `1px solid ${mode === "light" ? "#eceef5" : "#303543"}` },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: { borderColor: mode === "light" ? "#e5e7ef" : "#303543" },
            head: {
              backgroundColor: mode === "light" ? "#f4f6f8" : "#242833",
              color: mode === "light" ? "#252936" : "#f4f6fb",
              fontWeight: 700,
            },
          },
        },
      },
    }),
    [mode]
  );

  const value = useMemo(() => ({ mode, toggleMode }), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};
