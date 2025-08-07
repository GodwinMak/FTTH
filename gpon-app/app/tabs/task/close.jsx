import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import FormField from "../../../components/FormFiled";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { SelectList } from "react-native-dropdown-select-list";
import { useSearchContext } from "../../../hooks/useSerachContext";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { AntDesign } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { PRODUCTION_URL } from "../../../constants/Api";

export default function Close() {
  const { state } = useSearchContext();
  const { state: authState } = useAuthContext();

  // Local state to store the task and avoid flickering
  const [localTask, setLocalTask] = useState(null);

  const [noSleeve, setNoSleeve] = useState("");
  const [noAtb, setNoAtb] = useState("");
  const [cableLength, setCableLength] = useState("");
  const [comment, setComment] = useState("");
  const [patchCode, setPatchCode] = useState("");

  const [accountOrTicket, setAccountOrTicket] = useState("");
  const [taskName, setTaskName] = useState("");
  const [ontSerial, setOntSerial] = useState("");
  const [serialSearch, setSerialSearch] = useState("");
  const [filteredSerials, setFilteredSerials] = useState([]);
  const [id, setId] = useState("");
  const [images, setImages] = useState([]);
  const [serialNumbers, setSerialNumbers] = useState([]);

  /** Determine if task allows ONT serial search */
  const taskType = localTask?.task_type?.trim() || "";
  const isEditableTask =
    taskType === "New Installation" || taskType === "Router Change";

  // Initialize localTask when state.selectedTask changes
  useEffect(() => {
    if (state?.selectedTask) {
      setLocalTask(state.selectedTask);
    }
  }, [state?.selectedTask]);

  // When localTask updates, set related states
  useEffect(() => {
    if (!localTask) return;

    const { account_number, case_ticket, task_type, serial_number, id } = localTask;

    setId(id);
    setAccountOrTicket(`${account_number}${case_ticket ? ` | ${case_ticket}` : ""}`);
    setTaskName(task_type);

    if (task_type === "New Installation" || task_type === "Router Change") {
      setOntSerial("");
    } else {
      setOntSerial(serial_number || "");
    }
  }, [localTask]);

  useEffect(() => {
    const fetchSerialNumbers = async () => {
      try {
        const response = await axios.get(
          `${PRODUCTION_URL}/stock/get-ont-serial-numbers?contractor_id=${authState.userData.contractor_id}`
        );
        console.log(response.data)
        setSerialNumbers(response.data.ontSerialNumbers);
        setFilteredSerials(response.data.ontSerialNumbers);
      } catch (error) {
        console.error("Error fetching serial numbers:", error);
      }
    };
    fetchSerialNumbers();
  }, [authState.userData.contractor_id]);

  const handleSerialSearch = (text) => {
    setSerialSearch(text);
    setOntSerial(text);
    const filtered = serialNumbers.filter((item) =>
      item.serial_number?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredSerials(filtered);
  };

  const [selected, setSelected] = useState("");
  const [selectedTaskType, setSelectedTaskType] = useState("");

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

  const handlePress = () => router.back();

  /** Pick from gallery **/
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets]);
    }
  };

  /** Open Camera **/
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please allow camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets]);
    }
  };

  /** Submit Task **/
  const submitCloseTask = async () => {
    try {
      const formData = new FormData();
      formData.append("task_id", id);
      formData.append("serial_number", ontSerial);
      formData.append("no_sleeve", parseInt(noSleeve) || 0);
      formData.append("cable_type", selected);
      formData.append("cable_length", parseFloat(cableLength) || 0);
      formData.append("no_atb", parseInt(noAtb) || 0);
      formData.append("task_type", selectedTaskType);
      formData.append("comments", comment);
      formData.append("user_id", authState.userData.id);
      formData.append("patchCode", parseInt(patchCode) || 0);

      images.forEach((image, index) => {
        formData.append("images", {
          uri: image.uri,
          type: "image/jpeg",
          name: `task_image_${index + 1}.jpg`,
        });
      });

      await axios.post(
        `${PRODUCTION_URL}/task/complete/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      Alert.alert("Success", "Task Closed Successfully");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.message || "Error closing task");
    }
  };

  if (!localTask) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-lg font-semibold">Loading task...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="mt-10 px-4">
        {/* Header */}
        <View className="relative items-center mb-5">
          <TouchableOpacity onPress={handlePress} className="absolute left-0">
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Close Task</Text>
        </View>

        {/* Account & Task */}
        <FormField title="Account | Ticket Number" editable={false} value={accountOrTicket} />
        <FormField title="Task" value={taskName} editable={false} />

        {/* ONT Serial - Visible only for New Installation or Router Change */}
        {isEditableTask && (
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
                  className="p-2 bg-gray-100 mb-1 rounded"
                  onPress={() => {
                    setOntSerial(item.serial_number);
                    setSerialSearch(item.serial_number);
                    setFilteredSerials([]);
                  }}
                >
                  {item.serial_number}
                </Text>
              ))}
          </>
        )}

        {/* Other Inputs */}
        <FormField title="No of Sleeve" keyboardType="numeric" value={noSleeve} handleChangeText={setNoSleeve} />
        <FormField title="No of ATB Used" keyboardType="numeric" value={noAtb} handleChangeText={setNoAtb} />
        <FormField title="No of Patch Code" keyboardType="numeric" value={patchCode} handleChangeText={setPatchCode} />

        {/* Cable Type */}
        <View className="mt-3 mb-3">
          <Text className="font-bold">Cable Type</Text>
          <SelectList
            setSelected={setSelected}
            search={false}
            data={data}
            save="value"
            boxStyles={{
              backgroundColor: "#F3F4F6",
              borderRadius: 10,
              padding: 10,
              marginTop: 6,
              borderColor: "#000",
              borderWidth: 1.5,
            }}
          />
        </View>

        <FormField title="Cable Length Used" keyboardType="numeric" value={cableLength} handleChangeText={setCableLength} />

        {/* Task Type */}
        <View className="mt-3 mb-3">
          <Text className="font-bold">Task Type</Text>
          <SelectList
            setSelected={setSelectedTaskType}
            search={false}
            data={task_type}
            save="value"
            boxStyles={{
              backgroundColor: "#F3F4F6",
              borderRadius: 10,
              padding: 10,
              marginTop: 6,
              borderColor: "#000",
              borderWidth: 1.5,
            }}
          />
        </View>

        {/* Comment */}
        <FormField title="Comment" multText={true} numberOfLines={8} value={comment} handleChangeText={setComment} />

        {/* Image Upload */}
        <View className="mt-5 mb-5">
          <Text className="font-bold mb-2">Attach Images</Text>
          <View className="flex-row space-x-2 mb-3">
            <TouchableOpacity onPress={pickImages} className="bg-blue-600 rounded-md px-4 py-2">
              <Text className="text-white font-semibold">Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openCamera} className="bg-green-600 rounded-md px-4 py-2">
              <Text className="text-white font-semibold">Camera</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((img, index) => (
              <Image key={index} source={{ uri: img.uri }} className="w-24 h-24 rounded-lg mr-3" />
            ))}
          </ScrollView>
        </View>

        {/* Buttons */}
        <View className="flex-row justify-center space-x-3 mt-5 mb-8">
          <TouchableOpacity onPress={submitCloseTask} className="bg-blue-900 rounded-md px-6 py-3">
            <Text className="text-white text-lg font-semibold">Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePress} className="bg-red-500 rounded-md px-6 py-3">
            <Text className="text-white text-lg font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
