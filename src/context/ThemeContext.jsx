import React, { createContext, useContext, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('meralot-theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('meralot-theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('meralot-theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = (x, y) => {
        const originX = typeof x === 'number' ? x : window.innerWidth / 2;
        const originY = typeof y === 'number' ? y : window.innerHeight / 2;

        document.documentElement.style.setProperty('--theme-vt-x', `${originX}px`);
        document.documentElement.style.setProperty('--theme-vt-y', `${originY}px`);

        if (!document.startViewTransition) {
            setIsDark(prev => !prev);
            return;
        }

        const transition = document.startViewTransition(() => {
            flushSync(() => {
                setIsDark(prev => !prev);
            });
        });

        // Remove vt-active class once animation finishes
        transition.finished.finally(() => {
            document.documentElement.classList.remove('vt-active');
        });

        document.documentElement.classList.add('vt-active');
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};
