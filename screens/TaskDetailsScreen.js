// screens/TaskDetailsScreen.js
import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { toggleTaskDone } from "../firebase/firestoreService";

export default function TaskDetailsScreen({ route, navigation }) {
  const { task } = route.params;

  const handleToggleDone = async () => {
    await toggleTaskDone(task.id, task.done);
    navigation.goBack(); // wracamy do listy
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.info}>📅 Termin: {task.dueDate || "brak"}</Text>
      <Text style={styles.info}>⭐ Priorytet: {task.priority}</Text>
      <Text style={styles.info}>
        🏷️ Etykiety: {task.labels?.join(", ") || "brak"}
      </Text>
      <Text style={styles.info}>
        ✅ Stan: {task.done ? "Wykonane" : "Niewykonane"}
      </Text>

      <Button
        title={task.done ? "Oznacz jako niewykonane" : "Oznacz jako wykonane"}
        onPress={handleToggleDone}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  info: { fontSize: 16, marginBottom: 10 },
});
