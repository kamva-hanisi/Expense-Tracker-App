import { createContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
	theme: Theme;
	toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const getInitialTheme = (): Theme => {
	const storedTheme = localStorage.getItem("theme");
	if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

type ThemeProviderProps = { children: ReactNode };

const ThemeProvider = ({ children }: ThemeProviderProps) => {
	const [theme, setTheme] = useState<Theme>(getInitialTheme);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		document.documentElement.style.colorScheme = theme;
		localStorage.setItem("theme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((currentTheme) => currentTheme === "light" ? "dark" : "light");
	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export default ThemeProvider;
