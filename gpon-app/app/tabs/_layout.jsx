import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout (){
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#0dcbd9",
          tabBarInactiveTintColor: "#CDCDE0",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#070829",
            borderTopWidth: 1,
            borderTopColor: "#232533",
            height: 65,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({ color }) => (
              // console.log(color)
              <Ionicons name="home" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="task"
          options={{
            tabBarLabel: "Tasks",
            tabBarIcon: ({ color }) => (
              <Ionicons name="list" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarLabel: "Profile",
            tabBarIcon: ({ color }) => (
              <Ionicons name="people-circle" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    );
}