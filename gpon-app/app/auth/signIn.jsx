import { View, Text, SafeAreaView, ScrollView, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import images from "../../constants/images";
import FormField from "../../components/FormFiled";
import CustomButton from "../../components/CustomButton";
import { router } from "expo-router";
import Container, { Toast } from "toastify-react-native";
import axios from "axios";
import { PRODUCTION_URL } from "../../constants/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthContext } from "../../hooks/useAuthContext";
import Spinner from "react-native-loading-spinner-overlay";
import NetInfo from "@react-native-community/netinfo";
import * as Notifications from "expo-notifications";


export default function SignIN() {
  const { dispatch } = useAuthContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    interfaceType: "mobile",
  });

  const submit = async (e) => {
    e.preventDefault();

    // Check internet before attempting login
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      return Toast.error("No internet connection");
    }

    setSubmitting(true);

    try {
      const { email, password, interfaceType } = form;
      if (!email || !password) {
        setSubmitting(false);
        return Toast.error("Please fill all fields");
      }

      const res = await axios.post(`${PRODUCTION_URL}/user/login`, {
        email,
        password,
        interface: interfaceType,
      });

      await AsyncStorage.setItem("userToken", res.data.token);
      await AsyncStorage.setItem("userData", JSON.stringify(res.data.user));

      dispatch({ type: "SIGN_IN_TOKEN", payload: res.data.token });
      dispatch({ type: "SIGN_IN_DATA", payload: res.data.user });

      // --- Add this block to register push token and send to backend ---
      const registerPushToken = async () => {
        try {
          const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;

          if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }

          if (finalStatus !== "granted") {
            console.log("Push notification permission denied");
            return;
          }

          const pushTokenData = await Notifications.getExpoPushTokenAsync();
          const pushToken = pushTokenData.data;

          // Send token to backend
          await axios.post(`${PRODUCTION_URL}/user/updatePushToken`, {
            userId: res.data.user.id,
            pushToken,
          });

          console.log("Push token sent to backend:", pushToken);
        } catch (err) {
          console.error("Error registering push token:", err);
        }
      };

      await registerPushToken();
      // --- End of push token registration ---

      router.replace("/tabs/home");
    } catch (error) {
      console.error(error);
      Toast.error("Invalid credentials or server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      {/* Loader Overlay */}
      <Spinner
        visible={isSubmitting}
        textContent={"Signing in..."}
        textStyle={{ color: "#FFF" }}
        overlayColor="rgba(0, 0, 0, 0.85)"
      />

      <View
        style={{ height: StatusBar.currentHeight, backgroundColor: "#ffffff" }}
      />
      <ScrollView className="flex-1">
        <View className="w-full min-h-[90vh] px-4 my-6 justify-center items-center">
          <Container position="top" />
          <Image source={images.logo} className="w-[200px] h-[94px]" />
          <Text className="text-xl text-black font-spaceMono">
            Login in to RTS
          </Text>
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />
          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles="w-full mt-7"
            isLoading={isSubmitting}
          />
          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-blue-950 font-spaceMono">
              Africa Digital Future
            </Text>
          </View>
        </View>
      </ScrollView>
      <StatusBar barStyle="dark-content" />
    </SafeAreaView>
  );
}
