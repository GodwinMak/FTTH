import { View, Text, SafeAreaView, ScrollView, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import images from "../../constants/images";
import FormField from "../../components/FormFiled";
import CustomButton from "../../components/CustomButton";
import { Link, router } from "expo-router";
import Container, { Toast } from "toastify-react-native";
import axios from "axios"
import { PRODUCTION_URL } from "../../constants/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthContext } from "../../hooks/useAuthContext";

export default function SignIN() {
  const { dispatch } = useAuthContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    interfaceType: "mobile"
  });

  const submit = async (e) => {
    e.preventDefault();
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
      router.replace("/tabs/home");
    } catch (error) {
      console.error(error);
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      {/* Simulated status bar background */}
      <View style={{ height: StatusBar.currentHeight, backgroundColor: "#ffffff" }} />
      <ScrollView className="flex-1">
        <View className="w-full min-h-[90vh] px-4 my-6 justify-center items-center">
          <Container position="top" />
          <Image source={images.logo} className="w-[200px] h-[94px]" />
          <Text className="text-xl text-black font-spaceMono">Login in to RTS</Text>
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
