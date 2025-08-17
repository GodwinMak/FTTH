import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator, // ✅ Added
} from "react-native";
import React, { useEffect, useState } from "react";
import { useFocusEffect, router } from "expo-router";
import FormField from "../../../components/FormFiled";
import { useSearchContext } from "../../../hooks/useSerachContext";
import { PRODUCTION_URL } from "../../../constants/Api";
import axios from "axios";
import { useAuthContext } from "../../../hooks/useAuthContext"; // ✅ Import Auth Context

export default function Tasks() {
  const [prevScrollOffset, setPrevScrollOffset] = useState(0);
  const { state, dispatch } = useSearchContext();
    const { state: user } = useAuthContext();

  const [view, setView] = useState("list");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Loader state

  const fetchTasks = async () => {
    setLoading(true); // ✅ Start loader
    console.log(user.userData.contractor_id)
    try {
      const response = await axios.get(
        `${PRODUCTION_URL}/task/getTasksByContractorId/${user.userData.contractor_id}`
      );
      console.log(response.data)
      if (response.data && response.data.tasks) {
        setTasks(response.data.tasks);
        setResults(response.data.tasks);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false); // ✅ Stop loader
    }
  };



  const handleSearch = (text) => {
    setQuery(text);
    if (text.trim() === "") {
      setResults(tasks);
      return;
    }
    const filtered = tasks.filter((item) => {
      const accountMatch =
        item.account_number &&
        item.account_number.toLowerCase().includes(text.toLowerCase());
      const ticketMatch =
        item.case_ticket &&
        item.case_ticket.toLowerCase().includes(text.toLowerCase());
      return accountMatch || ticketMatch;
    });
    setResults(filtered);
  };

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        await fetchTasks();
      };
      loadData();

      return () => {
        dispatch({ type: "CLEAR_QUERY" });
      };
    }, [])
  );

  // ✅ Run search when both tasks and state.query.account_number change
  useEffect(() => {
    if (state.fromSearch && state.query.account_number && tasks.length > 0) {
      handleSearch(state.query.account_number);
    } else if (tasks.length > 0) {
      setQuery("");
      setResults(tasks);
    }
  }, [tasks, state.fromSearch, state.query.account_number]);

  const handleAction = (type, item) => {
    dispatch({ type: "SET_SELECTED_TASK", payload: item });
    if (type === "Close") router.push("/tabs/task/close");
    else if (type === "On Hold") router.push("/tabs/task/onhold");
    else if (type === "Reject") router.push("/tabs/task/reject");
  };

  const renderTaskCard = ({ item }) => (
    <View className="bg-white rounded-xl shadow-md p-4 mx-2 mb-3 border border-gray-200">
      {/* Status Badge */}
      <View className="absolute top-2 right-2 bg-blue-600 px-3 py-1 rounded-full">
        <Text className="text-white text-xs font-semibold">
          {item.status || "NA"}
        </Text>
      </View>

      {/* Task Title */}
      <Text className="text-lg font-bold text-gray-800 mb-2">
        {item.task_type || "Task"}
      </Text>

      {/* Task Details */}
      <View className="space-y-1 mb-4">
        <Text className="text-gray-600">
          Name: {item.customer_name || "NA"}
        </Text>
        <Text className="text-gray-600">
          Account: {item.account_number || "NA"}
        </Text>
        {item.case_ticket && (
          <Text className="text-gray-600">
            Ticket: {item.case_ticket || "NA"}
          </Text>
        )}
        {item.serial_number && (
          <Text className="text-gray-600">
            Serial: {item.serial_number || "NA"}
          </Text>
        )}
        <Text className="text-gray-600">
          Building: {item.building_name || "NA"}
        </Text>
        <Text className="text-gray-600">
          Location: {item.building_location || "NA"}
        </Text>
        <Text className="text-gray-600">House No: {item.house_no || "NA"}</Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-between space-x-2">
        <TouchableOpacity
          onPress={() => handleAction("Close", item)}
          className="bg-green-500 px-3 py-2 rounded-lg flex-1"
        >
          <Text className="text-white text-center">Close</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAction("On Hold", item)}
          className="bg-yellow-500 px-3 py-2 rounded-lg flex-1"
        >
          <Text className="text-white text-center">On Hold</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAction("Reject", item)}
          className="bg-red-500 px-3 py-2 rounded-lg flex-1"
        >
          <Text className="text-white text-center">Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    view === "list" && (
      <SafeAreaView className="flex-1 bg-gray-100">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Search Field */}
          <View className="p-3 mt-6">
            <FormField
              title="Search"
              placeholder="LHTZ-XXXX / CSXXXXXXXX"
              handleChangeText={handleSearch}
              value={query}
            />
          </View>

          {/* Loader or Task List */}
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : results.length > 0 ? (
            <FlatList
              contentContainerStyle={{ paddingBottom: 10 }}
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={renderTaskCard}
              // onScroll={handleScroll}
              scrollEventThrottle={100}
            />
          ) : (
            <View className="flex-1 items-center justify-center mt-10">
              <Text className="text-lg text-gray-500">No tasks found</Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  );
}


