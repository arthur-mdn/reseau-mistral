// TopBarContext.js
import React, { createContext, useState, useContext } from 'react';

const TopBarContext = createContext();

export const TopBarProvider = ({ children }) => {
    const [topBarState, setTopBarState] = useState({
        backLink: {},
        title: '',
        isVisible: false,
        actions: []
    });

    return (
        <TopBarContext.Provider value={{ topBarState, setTopBarState }}>
            {children}
        </TopBarContext.Provider>
    );
};

export const useTopBar = () => useContext(TopBarContext);
