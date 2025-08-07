import React, { useState, useEffect } from "react";
import { View, StatusBar, SafeAreaView } from "react-native";
import ColorfulCard from "react-native-colorful-card";
import {PRODUCTION_URL} from "../../constants/Api"
import axios from "axios";
import {useAuthContext} from "../../hooks/useAuthContext"

const cardData = [
  { title: "Task", value: "126" },
  // { title: "Troubleshooting", value: "8", style: { backgroundColor: "#7954ff" } },
  { title: "ORM 1", value: "10", style: { backgroundColor: "#fe8f62" } },
  { title: "ONT", value: "16", style: { backgroundColor: "#2bc3ff" } },
  {
    title: "Drop Cable",
    value: "500",
    valuePostfix: "m",
    style: { backgroundColor: "#5a65ff" },
  },
  {
    title: "CAT 6",
    value: "120",
    valuePostfix: "m",
    style: { backgroundColor: "#96da45" },
  },
];

// Function to split array into chunks of 2
const chunkArray = (arr, size) => {
  return arr.reduce((acc, _, i) => {
    if (i % size === 0) acc.push(arr.slice(i, i + size));
    return acc;
  }, []);
};

export default function Card() {
  const { state} = useAuthContext()

  const [data, setData] = useState([]);
  

  useEffect(() => {
    const fetchData = async () => { 
      try {
        const response = await axios.get(`${PRODUCTION_URL}/stats/count/${state.userData.contractor_id}` )
        setData([
          { title: "In Progress Task", value: response.data.inProgress, style: { backgroundColor: "#1B946F" } },
          { title: "On Hold Task", value: response.data.onHold, style: { backgroundColor: "#41114D" } },
          { title: "ONT", value: response.data.ontCount, style: { backgroundColor: "#2E4F08" } },
          {title: "Drop Cable",
            value: response.data.dropcableCount,
            valuePostfix: "m",
            style: { backgroundColor: "#5a65ff" }},
          {title: "CAT 6",
            value: response.data.utpCableCount,
            valuePostfix: "m",
            style: { backgroundColor: "#96da45" }},
          {title: "ATB",
            value: response.data.atbCount,
            style: { backgroundColor: "#fe8f62" }},
          {title: "Patch",
            value: response.data.patchCount,
           }
        ])
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  const cardRows = chunkArray(data, 2);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="items-center">
        {cardRows.map((row, rowIndex) => (
          <View
            key={rowIndex}
            className="flex-row justify-evenly w-full px-3"
            style={{ marginTop: rowIndex === 0 ? 0 : 16 }}
          >
            {row.map((card, index) => (
              <ColorfulCard
                key={index}
                title={card.title}
                value={card.value}
                valuePostfix={card.valuePostfix}
                style={card.style}
                onPress={() => {}}
              />
            ))}
          </View>
        ))}
      </SafeAreaView>
    </>
  );
}
