import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import TaskForm from "../components/TaskForm";
import dayjs from "dayjs";
export default function AddTaskScreen({ navigation, route }) {
  const { handleAddTask, selectedProject,
  userId, } = route.params;

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [priority, setPriority] = useState("średni");
  const [labelsInput, setLabelsInput] = useState("");

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TaskForm
          newTaskTitle={newTaskTitle}
          setNewTaskTitle={setNewTaskTitle}
          description={description}
          setDescription={setDescription}
          dueDate={dueDate}
          setDueDate={setDueDate}
          priority={priority}
          setPriority={setPriority}
          labelsInput={labelsInput}
          setLabelsInput={setLabelsInput}
          onAddTask={() => {
            handleAddTask({
              title: newTaskTitle,
              description,
              dueDate,
              priority,
              labelsInput,
              projectId: selectedProject,
              userId: userId,
            });
            navigation.goBack();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
});
