import { Stack, SplashScreen } from "expo-router";
import React, { useContext, useEffect } from "react";
import { useFonts } from "expo-font";
import { AuthProvider } from "../Context/AuthContext";
import { SearchProvider } from "../Context/SeaarchContext";

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "Space-mono": require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <SearchProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="tabs" />
        </Stack>
      </SearchProvider>
    </AuthProvider>
  );
}
