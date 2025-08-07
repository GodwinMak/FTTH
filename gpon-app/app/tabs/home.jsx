import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import FormField from "../../components/FormFiled";
import Card from "../../components/Home/Card";
import { tasksData } from "../../constants/tempData";
import { router, useFocusEffect } from "expo-router";
import {useSearchContext}  from "../../hooks/useSerachContext"
import {PRODUCTION_URL} from "../../constants/Api"
import axios from "axios";


export default function Home() {
  const { dispatch } = useSearchContext();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const [tasks, setTasks] = useState([]);


  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `${PRODUCTION_URL}/task/getTasksByStatus?status=notRejected`
        );
        if (response.data && response.data.tasks) {
          setTasks(response.data.tasks);
        } else {
          console.error("No tasks found in the response");
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchTasks();
  },[]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // clear search when leaving Home
        setQuery("");
        setResults([]);
      };
    }, [])
  );

  const handlePress = (item) => {
    dispatch({ type: "SET_QUERY", payload: item });
    router.push("/tasks");
  };
  
  const handleSearch = (text) => {
    setQuery(text);

    if (text.trim() === "") {
      setResults([]);
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

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View>
        <View className="p-2 mt-10">
          <FormField
            title="Account Or Ticket Number"
            placeholder="LHTZ-XXXX/CSXXXXXXXX"
            handleChangeText={handleSearch}
            value={query}
          />
        </View>
        {results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="p-2 border-b"
                onPress={() => handlePress(item)}
              >
                <Text className="font-bold">{item.task_type}</Text>
                <Text>{item.customer_name}</Text>
                <Text>
                  {item.account_number} {item.case_ticket ? `| ${item.case_ticket}` : ""}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
        
      </View>
      <ScrollView className="mt-5 mb-2">
          <Card />
        </ScrollView>
    </SafeAreaView>
  );
}
