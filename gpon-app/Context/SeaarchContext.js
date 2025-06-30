import React, { createContext, useReducer, useContext } from "react";

const initialState = {
  query: "",
  selectedTask: "",
  fromSearch: false, // true when coming from Home with a search
};

const SearchContext = createContext();

function searchReducer(state, action) {
  switch (action.type) {
    case "SET_QUERY":
      return { ...state, query: action.payload, fromSearch: true };
    case "SET_SELECTED_TASK": // ADD THIS
      return { ...state, selectedTask: action.payload };
    case "CLEAR_QUERY":
      return { query: "", fromSearch: false };
    default:
      return state;
  }
}

const SearchProvider = ({ children }) => {
  const [state, dispatch] = useReducer(searchReducer, initialState);
  return (
    <SearchContext.Provider value={{ state, dispatch }}>
      {children}
    </SearchContext.Provider>
  );
}


export {SearchContext, SearchProvider };


