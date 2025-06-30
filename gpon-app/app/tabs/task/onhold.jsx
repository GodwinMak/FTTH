import { View, Text, Button, SafeAreaView, ScrollView, TouchableOpacity} from "react-native";
import React, {useState, useEffect} from "react";
import {useSearchContext} from "../../../hooks/useSerachContext"
import {useAuthContext} from "../../../hooks/useAuthContext"
import FormField from "../../../components/FormFiled";
import axios from "axios"
import {PRODUCTION_URL} from "../../../constants/Api"
import { router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";


export default function OnHold({ setView }) {

  const {state} = useSearchContext();
  const {state: authState} = useAuthContext();
  const [taskName, setTaskName] = useState("");
  const [accountOrTicket, setAccountOrTicket] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);


  const [form, setForm] = useState({
    note_text: "",
    task_id: state.selectedTask ? state.selectedTask.id : null,
    status: "On Hold",
    user_id: authState.userData.id,
  })


  useEffect(() => {
    if (!state.selectedTask) return;

    const { account_number, case_ticket, task_type } = state.selectedTask;

    setAccountOrTicket(`${account_number}${case_ticket ? ` | ${case_ticket}` : ""}`);
    setTaskName(task_type);
  }, [state.selectedTask]);

  const handlePress = () => {
    router.back(); // goes back to previous screen
  };

  const submit = async (e) =>{
    setSubmitting(true);
    try {
      const {note_text, task_id, status, user_id} = form

      const res = await axios.put(`${PRODUCTION_URL}/task/${task_id}`,{
        note_text,
        status,
        user_id
      })

      alert("Task Closed Successfully");
      router.push("/tabs/task");
    } catch (error) {
      console.error(err);
      alert(err.response?.data?.message || "Error closing task");
    }
  }
  
  return (
    <SafeAreaView className="h-full">
      <ScrollView className="flex mt-10 p-3">
      <View className="relative items-center mb-4">
          <TouchableOpacity onPress={handlePress} className="absolute left-0">
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-lg font-bold">On Hold Task</Text>
        </View>
        <FormField
          title="Account|Ticket Number"
          editable={false}
          value={accountOrTicket}
        />
        <FormField
          title="Task"
          value={taskName} editable={false}
        />
        <FormField title="Comment" multText={true} numberOfLines={8} value={form.note_text} handleChangeText={(e)=> setForm({...form, note_text: e})}/>
        <View className="flex flex-row  mb-5 mt-5 items-center justify-center">
          <TouchableOpacity className="bg-blue-900 rounded-md p-2" onPress={submit}>
            <Text className="text-white text-lg">Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-red-500 rounded-md p-2 ml-2" onPress={handlePress}>
            <Text className="text-white text-lg">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}
