import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Button,
  ScrollView,
} from "react-native";

export default function TaskForm({
  newTaskTitle,
  setNewTaskTitle,
  description,
  setDescription,
  dueDate,
  setDueDate,
  priority,
  setPriority,
  labelsInput,
  setLabelsInput,
  onAddTask,
}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Dodaj nowe zadanie</Text>

      <Text style={styles.label}>Tytuł zadania:</Text>
      <TextInput
        placeholder="np. Zrób prezentację"
        value={newTaskTitle}
        onChangeText={setNewTaskTitle}
        style={styles.input}
      />

      <Text style={styles.label}>Opis:</Text>
      <TextInput
        placeholder="Krótki opis zadania"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.multiline]}
        multiline
      />

      <Text style={styles.label}>Priorytet:</Text>
      <View style={styles.buttonRow}>
        {["niski", "średni", "wysoki"].map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setPriority(p)}
            style={[styles.button, priority === p && styles.buttonSelected]}
          >
            <Text style={styles.buttonText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Termin (YYYY-MM-DD):</Text>
        <TextInput
        placeholder="YYYY-MM-DD"
        value={dueDate}
        onChangeText={setDueDate}
        style={styles.input}
        keyboardType="numbers-and-punctuation"
        />


      <Text style={styles.label}>Etykiety (np. #nauka, #praca):</Text>
      <TextInput
        placeholder="#nauka, #praca"
        value={labelsInput}
        onChangeText={setLabelsInput}
        style={styles.input}
      />

      <View style={styles.buttonWrapper}>
        <Button title="Dodaj zadanie" onPress={onAddTask} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    marginTop: 10,
    fontWeight: "600",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
  },
  multiline: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 10,
  },
  button: {
    backgroundColor: "#ccc",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonSelected: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  buttonWrapper: {
    marginTop: 30,
  },
});
