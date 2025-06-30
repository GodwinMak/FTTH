import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Button,
  TouchableOpacity,
} from "react-native";
import FormField from "../../../components/FormFiled";
import CustomButton from "../../../components/CustomButton";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
// import { serialNumbersData } from "../../../constants/tempData";
import { SelectList } from "react-native-dropdown-select-list";
import { useSearchContext } from "../../../hooks/useSerachContext";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { AntDesign } from "@expo/vector-icons";
import axios from "axios";
import { PRODUCTION_URL } from "../../../constants/Api";

export default function Close() {
  const [noSleeve, setNoSleeve] = useState("");
  const [noAtb, setNoAtb] = useState("");
  const [cableLength, setCableLength] = useState("");
  const [comment, setComment] = useState("");
  const [patchCode, setPatchCode] = useState("");

  const { state } = useSearchContext();
  const { state: authState } = useAuthContext();

  const [accountOrTicket, setAccountOrTicket] = useState("");
  const [taskName, setTaskName] = useState("");
  const [ontSerial, setOntSerial] = useState("");
  const [serialSearch, setSerialSearch] = useState("");
  const [filteredSerials, setFilteredSerials] = useState([]);
  const [id, setId] = useState("");
  const [userId, setUserId] = useState("");

  console.log("hello", authState.userData);

  const isEditableTask =
    (state.selectedTask &&
      state.selectedTask.task_type === "New Installation") ||
    (state.selectedTask && state.selectedTask.task_type === "Router Change");

  useEffect(() => {
    if (!state.selectedTask) return;

    const {
      account_number,
      case_ticket,
      task_type,
      serial_number,
      id,
      contractor_id,
    } = state.selectedTask;

    setId(id);
    setUserId(authState.userData.id);
    setAccountOrTicket(
      `${account_number}${case_ticket ? ` | ${case_ticket}` : ""}`
    );
    setTaskName(task_type);

    if (task_type !== "New Installation" && task_type !== "Router Change") {
      setOntSerial(serial_number || "");
    } else {
      setOntSerial("");
    }
  }, [state.selectedTask]);

  const [serialNumbers, setSerialNumbers] = useState([]);
  useEffect(() => {
    const fetchSerialNumbers = async () => {
      try {
        const response = await axios.get(
          `${PRODUCTION_URL}/stock/get-ont-serial-numbers?contractor_id=${authState.userData.contractor_id}`
        );
        setSerialNumbers(response.data.ontSerialNumbers);
        setFilteredSerials(response.data.ontSerialNumbers);
      } catch (error) {
        console.error("Error fetching serial numbers:", error);
      }
    };

    fetchSerialNumbers();
  }, []);

  const handleSerialSearch = (text) => {
    setSerialSearch(text);
    setOntSerial(text); // always sync to payload
    const filtered = serialNumbers.filter((item) =>
      item.serial_number?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredSerials(filtered);
  };

  const [selected, setSelected] = React.useState("");
  const [selectedTaskType, setSelectedTaskType] = React.useState("");

  const data = [
    { key: "1", value: "CAT 6 Cable" },
    { key: "2", value: "Drop Cable" },
    { key: "3", value: "Aerial Fiber Cable 4F" },
    { key: "4", value: "Aerial Fiber Cable 96F" },
    { key: "5", value: "Underground Fiber Cable 12F" },
    { key: "6", value: "Underground Fiber Cable 96F" },
  ];

  const task_type = [
    { key: 1, value: "Installation And Activation" },
    { key: 2, value: "Relocation" },
    { key: 3, value: "Activation" },
    { key: 4, value: "Relocation And Activation" },
    { key: 5, value: "Troubleshooting" },
  ];
  const handlePress = () => {
    router.back(); // goes back to previous screen
  };

  const submitCloseTask = async () => {
    try {
      const payload = {
        task_id: id,
        serial_number: ontSerial,
        no_sleeve: parseInt(noSleeve),
        cable_type: selected,
        cable_length: parseFloat(cableLength),
        no_atb: parseInt(noAtb),
        task_type: selectedTaskType,
        comments: comment,
        user_id: authState.userData.id, // adjust if user_id comes from another context
        patchCode: parseInt(patchCode) || 0, // ensure patchCode is a number
      };

      const res = await axios.post(
        `${PRODUCTION_URL}/task/complete/${payload.task_id}`,
        payload
      );

      alert("Task Closed Successfully");
      router.back();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error closing task");
    }
  };
  return (
    <SafeAreaView className="h-full">
      <ScrollView className="flex mt-10 p-3">
        <View className="relative items-center mb-4">
          <TouchableOpacity onPress={handlePress} className="absolute left-0">
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-lg font-bold">Close Task</Text>
        </View>
        <FormField
          title="Account|Ticket Number"
          editable={false}
          value={accountOrTicket}
        />
        <FormField title="Task" value={taskName} editable={false} />
        <>
          <FormField
            title="Search ONT Serial Number"
            value={serialSearch}
            handleChangeText={handleSerialSearch}
          />
          {serialSearch.length > 0 &&
            filteredSerials.map((item, index) => (
              <Text
                key={index}
                className="p-2 bg-gray-100 mb-1 rounded p-3"
                onPress={() => {
                  setOntSerial(item.serial_number);
                  setSerialSearch(item.serial_number); // set selected value back to form field
                  setFilteredSerials([]); // hide dropdown
                }}
              >
                {item.serial_number}
              </Text>
            ))}
        </>
        <FormField
          title="No of Sleeve"
          keyboardType="numeric"
          value={noSleeve}
          handleChangeText={setNoSleeve}
        />
        <FormField
          title="No of ATB Used"
          keyboardType="numeric"
          value={noAtb}
          handleChangeText={setNoAtb}
        />
        <FormField
          title="No of Patch Code"
          keyboardType="numeric"
          value={patchCode}
          handleChangeText={setPatchCode}
        />
        <View className="mt-2 mb-2">
          <Text className="font-bold">Cable Type</Text>
          <SelectList
            setSelected={(val) => setSelected(val)}
            search={false}
            data={data}
            save="value"
            boxStyles={{
              backgroundColor: "#F3F4F6",
              borderRadius: 10,
              padding: 10,
              marginTop: 6,
              borderColor: "#000",
              borderWidth: 2,
            }}
          />
        </View>

        <FormField
          title="Cable Length Used"
          keyboardType="numeric"
          value={cableLength}
          handleChangeText={setCableLength}
        />
        <View className="mt-2 mb-2">
          <Text className="font-bold">Task Type</Text>
          <SelectList
            setSelected={(val) => setSelectedTaskType(val)}
            search={false}
            data={task_type}
            save="value"
            boxStyles={{
              backgroundColor: "#F3F4F6",
              borderRadius: 10,
              padding: 10,
              marginTop: 6,
              borderColor: "#000",
              borderWidth: 2,
            }}
          />
        </View>
        <FormField
          title="Comment"
          multText={true}
          numberOfLines={8}
          value={comment}
          handleChangeText={setComment}
        />
        <View className="flex flex-row  mb-5 mt-5 items-center justify-center">
          <TouchableOpacity
            className="bg-blue-900 rounded-md p-2"
            onPress={submitCloseTask}
          >
            <Text className="text-white text-lg">Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-500 rounded-md p-2 ml-2"
            onPress={handlePress}
          >
            <Text className="text-white text-lg">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
