// context/AuthContext.js
import React, { createContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";


const initialState = {
  isLoading: true,
  isSignout: false,
  userToken: null,
  userData: null,
}

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "RESTORE_TOKEN":
      return { ...state, userToken: action.payload, isLoading: false };
      case "RESTORE_DATA":
      return { ...state, userData: action.payload, isLoading: false };
    case "SIGN_IN_TOKEN":
      return { ...state, isSignout: false, userToken: action.payload,};
      case "SIGN_IN_DATA":
      return { ...state, isSignout: false,  userData: action.payload };
    case "SIGN_OUT":
      return { ...state, isSignout: true, userToken: null, userData: null };
    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;
      let userData;
      try {
        userToken = await AsyncStorage.getItem("userToken");
        userData = await AsyncStorage.getItem("userData");
        userData = JSON.parse(userData)
      } catch (e) {
        console.error(e);
      }

      dispatch({ type: "RESTORE_TOKEN", payload: userToken });
      dispatch({ type: "RESTORE_DATA", payload: userData });

    };

    bootstrapAsync();
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };