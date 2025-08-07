import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import CustomButton from "../components/CustomButton";
import images from "../constants/images";
import { Redirect, router, Link } from "expo-router";
import { useAuthContext } from "../hooks/useAuthContext";

export default function Index() {
  const { state } = useAuthContext();

  if (state.isLoading) {
    return (
      <ActivityIndicator
        size={"large"}
        color="#161622"
        style={{ marginTop: "70%" }}
      />
    );
  }

  if (state.userToken !== null) return <Redirect href="/tabs/home" />;
  return (
    <SafeAreaView className="h-full">
      <View style={{ backgroundColor: "#161622", height: 30 }} />
      {/* StatusBar background */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="w-full justify-center items-center flex-1 px-4">
          <Image source={images.logo} className="w-[200px] h-[94px] mb-10" />
          <View className="relative -mt-4">
            <Text className="text-2xl text-black font-bold text-center">
              FFTH REPORTING SYSTEM <Text className="text-blue-900">SDU</Text>
            </Text>
          </View>
          <CustomButton
            title="Continue with Email"
            handlePress={() => router.push("/auth/signIn")}
            containerStyles="w-full mt-7 bg-blue-900"
            textStyles="text-white"
            isLoading={false}
          />
        </View>
      </ScrollView>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}
