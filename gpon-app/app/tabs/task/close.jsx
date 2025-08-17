import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SelectList } from "react-native-dropdown-select-list";
import { AntDesign } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";

import FormField from "../../../components/FormFiled";
import { useSearchContext } from "../../../hooks/useSerachContext";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { PRODUCTION_URL } from "../../../constants/Api";

// Static constants
const CABLE_TYPES = [
  { key: "1", value: "CAT 6 Cable" },
  { key: "2", value: "Drop Cable" },
  { key: "3", value: "Aerial Fiber Cable 4F" },
  { key: "4", value: "Aerial Fiber Cable 96F" },
  { key: "5", value: "Underground Fiber Cable 12F" },
  { key: "6", value: "Underground Fiber Cable 96F" },
];

const TASK_TYPES = [
  { key: 1, value: "Apartment Installation +Activation" },
  { key: 2, value: "Relocation(Installation+Activation)" },
  { key: 3, value: "Activation" },
  { key: 4, value: "Relocation(Installation)" },
  { key: 5, value: "Troubleshooting" },
];

const OTHER_TASK_TYPES = [
  "Access Point",
  "Splicing",
  "Distribution box installation",
  "Closure preparation and installation",
  "Extender installation",
  "Cable installation",
];

export default function Close() {
  const { state } = useSearchContext();
  const { state: authState } = useAuthContext();
  const [localTask, setLocalTask] = useState(null);

  const [formData, setFormData] = useState({
    noSleeve: "",
    noAtb: "",
    cableLength: "",
    comment: "",
    patchCode: "",
    selectedCableType: "",
    ontSerial: "",
    serialSearch: "",
    selectedTaskType: "",
    accountOrTicket: "",
    taskName: "",
    id: "",
  });

  const [images, setImages] = useState([]);
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [filteredSerials, setFilteredSerials] = useState([]);
  const [selectedTaskTypes, setSelectedTaskTypes] = useState(
    OTHER_TASK_TYPES.map((type) => ({ type, selected: false, amount: "" }))
  );

  const isOthersTask = localTask?.task_type?.trim() === "Others";
  const isEditableTask =
    localTask?.task_type?.trim() === "New Installation" ||
    localTask?.task_type?.trim() === "Router Change";

  useEffect(() => {
    if (state?.selectedTask) {
      setLocalTask(state.selectedTask);
      const { account_number, case_ticket, task_type, serial_number, id } =
        state.selectedTask;
      setFormData((prev) => ({
        ...prev,
        id,
        accountOrTicket: `${account_number}${
          case_ticket ? `${case_ticket}` : ""
        }`,
        taskName: task_type,
        ontSerial:
          task_type === "New Installation" || task_type === "Router Change"
            ? ""
            : serial_number || "",
      }));
    }
  }, [state?.selectedTask]);

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
  }, [authState.userData.contractor_id]);

  const handleFormFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSerialSearch = (text) => {
    handleFormFieldChange("serialSearch", text);
    handleFormFieldChange("ontSerial", text);
    setFilteredSerials(
      serialNumbers.filter((item) =>
        item.serial_number?.toLowerCase().includes(text.toLowerCase())
      )
    );
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("Permission Denied", "Please allow gallery access.");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) setImages((prev) => [...prev, ...result.assets]);
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("Permission Denied", "Please allow camera access.");
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) setImages((prev) => [...prev, ...result.assets]);
  };

  const createFormData = () => {
    const data = new FormData();
    data.append("task_id", formData.id);
    data.append("user_id", authState.userData.id);

    if (isOthersTask) {
      data.append("task_type", "Others");
      selectedTaskTypes
        .filter((item) => item.selected && item.amount)
        .forEach((item, index) => {
          data.append(`other_tasks[${index}][type]`, item.type);
          data.append(`other_tasks[${index}][amount]`, item.amount);
        });
      data.append("isOther_tasks", true);
      data.append("comments", formData.comment);
    } else {
      data.append("serial_number", formData.ontSerial);
      data.append("no_sleeve", parseInt(formData.noSleeve) || 0);
      data.append("cable_type", formData.selectedCableType);
      data.append("cable_length", parseFloat(formData.cableLength) || 0);
      data.append("no_atb", parseInt(formData.noAtb) || 0);
      data.append("no_patch_cords", parseInt(formData.patchCode) || 0);
      data.append("task_type", formData.selectedTaskType || formData.taskName);
      data.append("comments", formData.comment);
    }

    images.forEach((image, index) => {
      data.append("images", {
        uri: image.uri,
        type: "image/jpeg",
        name: `task_image_${index + 1}.jpg`,
      });
    });

    return data;
  };

  const submitCloseTask = async () => {
    try {
      if (isOthersTask) {
        const selectedTasks = selectedTaskTypes
          .filter((item) => item.selected && item.amount) // only selected and with amount
          .map((item) => ({
            type: item.type,
            amount: parseFloat(item.amount),
          }));
        console.log(selectedTasks);

        const data = createFormData(selectedTasks);
        await axios.post(
          `${PRODUCTION_URL}/task/complete/${formData.id}`,
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        const data = createFormData();
        await axios.post(
          `${PRODUCTION_URL}/task/complete/${formData.id}`,
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

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
          <TouchableOpacity onPress={router.back} className="absolute left-0">
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Close Task</Text>
        </View>

        {/* Account & Task */}
        <FormField
          title="Account | Ticket Number"
          editable={false}
          value={formData.accountOrTicket}
        />
        <FormField title="Task" value={formData.taskName} editable={false} />

        {/* ONT Serial */}
        {isEditableTask && (
          <>
            <FormField
              title="Search ONT Serial Number"
              value={formData.serialSearch}
              handleChangeText={handleSerialSearch}
            />
            {formData.serialSearch.length > 0 &&
              filteredSerials.map((item, index) => (
                <Text
                  key={index}
                  className="p-2 bg-gray-100 mb-1 rounded"
                  onPress={() => {
                    handleFormFieldChange("ontSerial", item.serial_number);
                    handleFormFieldChange("serialSearch", item.serial_number);
                    setFilteredSerials([]);
                  }}
                >
                  {item.serial_number}
                </Text>
              ))}
          </>
        )}

        {/* Other Inputs */}
        {!isOthersTask && (
          <>
            <FormField
              title="No of Sleeve"
              keyboardType="numeric"
              value={formData.noSleeve}
              handleChangeText={(text) =>
                handleFormFieldChange("noSleeve", text)
              }
            />
            <FormField
              title="No of ATB Used"
              keyboardType="numeric"
              value={formData.noAtb}
              handleChangeText={(text) => handleFormFieldChange("noAtb", text)}
            />
            <FormField
              title="No of Patch Code"
              keyboardType="numeric"
              value={formData.patchCode}
              handleChangeText={(text) =>
                handleFormFieldChange("patchCode", text)
              }
            />
            <View className="mt-3 mb-3">
              <Text className="font-bold">Cable Type</Text>
              <SelectList
                setSelected={(value) =>
                  handleFormFieldChange("selectedCableType", value)
                }
                search={false}
                data={CABLE_TYPES}
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
            <FormField
              title="Cable Length Used"
              keyboardType="numeric"
              value={formData.cableLength}
              handleChangeText={(text) =>
                handleFormFieldChange("cableLength", text)
              }
            />
            <View className="mt-3 mb-3">
              <Text className="font-bold">Task Type</Text>
              <SelectList
                setSelected={(value) =>
                  handleFormFieldChange("selectedTaskType", value)
                }
                search={false}
                data={TASK_TYPES}
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
          </>
        )}

        {/* Task Type for Others */}
        {isOthersTask && (
          <View className="mt-3 mb-3">
            <Text className="font-bold mb-2">Check Task Types</Text>
            {selectedTaskTypes.map((item, index) => (
              <View key={index} className="mb-2">
                <TouchableOpacity
                  onPress={() => {
                    const updated = [...selectedTaskTypes];
                    updated[index].selected = !updated[index].selected;
                    setSelectedTaskTypes(updated);
                  }}
                >
                  <Text style={{ fontSize: 16 }}>
                    {item.selected ? "☑" : "⬜"} {item.type}
                  </Text>
                </TouchableOpacity>
                {item.selected && (
                  <FormField
                    title="Amount"
                    keyboardType="numeric"
                    value={item.amount}
                    handleChangeText={(text) => {
                      const updated = [...selectedTaskTypes];
                      updated[index].amount = text;
                      setSelectedTaskTypes(updated);
                    }}
                  />
                )}
              </View>
            ))}
          </View>
        )}

        {/* Comment */}
        <FormField
          title="Comment"
          multText={true}
          numberOfLines={8}
          value={formData.comment}
          handleChangeText={(text) => handleFormFieldChange("comment", text)}
        />

        {/* Image Upload */}
        <View className="mt-5 mb-5">
          <Text className="font-bold mb-2">Attach Images</Text>
          <View className="flex-row space-x-2 mb-3">
            <TouchableOpacity
              onPress={pickImages}
              className="bg-blue-600 rounded-md px-4 py-2"
            >
              <Text className="text-white font-semibold">Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openCamera}
              className="bg-green-600 rounded-md px-4 py-2"
            >
              <Text className="text-white font-semibold">Camera</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img.uri }}
                className="w-24 h-24 rounded-lg mr-3"
              />
            ))}
          </ScrollView>
        </View>

        {/* Buttons */}
        <View className="flex-row justify-center space-x-3 mt-5 mb-8">
          <TouchableOpacity
            onPress={submitCloseTask}
            className="bg-blue-900 rounded-md px-6 py-3"
          >
            <Text className="text-white text-lg font-semibold">Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={router.back}
            className="bg-red-500 rounded-md px-6 py-3"
          >
            <Text className="text-white text-lg font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
