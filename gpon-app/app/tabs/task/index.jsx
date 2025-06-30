import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Button,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useFocusEffect,router } from "expo-router";
import FormField from "../../../components/FormFiled";
import { useSearchContext } from "../../../hooks/useSerachContext";
import { PRODUCTION_URL } from "../../../constants/Api";
import axios from "axios";

export default function Tasks() {
  const [prevScrollOffset, setPrevScrollOffset] = useState(0);

  const { state, dispatch } = useSearchContext();

  const [taskCompletion, setTaskCompletion] = useState(false);
  const [view, setView] = useState("list"); // options: "list", "close", "onhold", "reject"
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `${PRODUCTION_URL}/task/getTasksByStatus?status=notRejected`
      );
      if (response.data && response.data.tasks) {
        setTasks(response.data.tasks);
        setResults(response.data.tasks);
      } else {
        console.error("No tasks found in the response");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;

    if (currentOffset < prevScrollOffset && currentOffset < 50) {
      // User scrolled up near the top
      fetchTasks(); // Reload data
    }

    setPrevScrollOffset(currentOffset);
  };

  const handleSearch = (text) => {
    setQuery(text);

    if (text.trim() === "") {
      setResults(tasks);
      return;
    }

    const filtered = tasks.filter((item) => {
      // console.log(item)
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
      fetchTasks(); // Always fetch on focus

      if (state.fromSearch && state.query.account_number !== "") {
        handleSearch(state.query.account_number);
      } else {
        setQuery("");
        setResults(tasks);
      }

      return () => {
        dispatch({ type: "CLEAR_QUERY" });
      };
    }, [state.fromSearch, state.query.account_number])
  );

  useEffect(() => {
    setQuery(state.query.account_number);
  }, []);

  const handleAction = (type, item) => {
    console.log(item);
    dispatch({ type: "SET_SELECTED_TASK", payload: item });
    if (type === "Close") router.push("/tabs/task/close");
    else if (type === "On Hold") router.push("/tabs/task/onhold");
    else if (type === "Reject") router.push("/tabs/task/reject");
  
  };

  return (
    <>
      {view === "list" && (
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View className="p-2 mt-10">
              <FormField
                title="Account Or Ticket Number"
                placeholder="LHTZ-XXXX/CSXXXXXXXX"
                handleChangeText={handleSearch}
                value={query}
              />
            </View>

            {results.length > 0 ? (
              <FlatList
                contentContainerStyle={{ paddingBottom: 10 }}
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View className="p-4 mx-2 shadow-lg bg-green-300 mb-2">
                    <Text className="text-xl font-bold mb-4">Task Details</Text>

                    <View className="absolute top-2 right-2 bg-blue-500 px-3 py-1 rounded-full">
                      <Text className="text-white text-xs font-semibold">
                        {item.status || "NA"}
                      </Text>
                    </View>

                    <View className="mb-6 space-y-2">
                      <Text className="text-gray-700">
                        Task: {item.task_type || "NA"}
                      </Text>
                      <Text className="text-gray-700">
                        Name: {item.customer_name || "NA"}
                      </Text>
                      <Text className="text-gray-700">
                        Account Number: {item.account_number || "NA"}
                      </Text>
                      <Text className="text-gray-700">
                        Ticket: {item.ticket || "NA"}
                      </Text>
                      <Text className="text-gray-700">
                        Serial Number: {item.serial_number || "NA"}
                      </Text>
                    </View>

                    <View>
                      <View style={{ marginBottom: 10 }}>
                        <Button
                          title="Close Task"
                          color="green"
                          onPress={() => handleAction("Close", item)}
                        />
                      </View>
                      <View style={{ marginBottom: 10 }}>
                        <Button
                          title="Put On Hold"
                          color="orange"
                          onPress={() => handleAction("On Hold", item)}
                        />
                      </View>
                      <View style={{ marginBottom: 0 }}>
                        <Button
                          title="Reject Task"
                          color="red"
                          onPress={() => handleAction("Reject", item)}
                        />
                      </View>
                    </View>
                  </View>
                )}
                onScroll={handleScroll}
                scrollEventThrottle={100}
              />
            ) : (
              <View className="flex-1 items-center justify-center mt-10">
                <Text className="text-lg text-gray-500">No tasks found</Text>
              </View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}
    </>
  );
}
