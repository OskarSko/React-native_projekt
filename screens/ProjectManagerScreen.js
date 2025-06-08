import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import {
  getProjects,
  addProject,
  deleteProject,
  toggleProjectArchived,
} from "../firebase/firestoreService";

export default function ProjectManagerScreen({ navigation, route }) {
    const { userId } = route.params;
  const [projects, setProjects] = useState([]);
  const [newName, setNewName] = useState("");

  const loadProjects = async () => {
    const data = await getProjects(true, userId);
    setProjects(data);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleAdd = async () => {
    if (newName.trim()) {
      await addProject(newName.trim(), userId);
      setNewName("");
      loadProjects();
    }
  };

const handleDelete = async (id) => {
  Alert.alert("Potwierdzenie", "Czy na pewno usunąć projekt?", [
    { text: "Anuluj", style: "cancel" },
    {
      text: "Usuń",
      style: "destructive",
      onPress: async () => {
        try {
          await deleteProject(id);
          await loadProjects();
        } catch (error) {
          console.error("❌ Błąd przy usuwaniu:", error);
          Alert.alert("Błąd", "Nie udało się usunąć projektu:\n" + error.message);
        }
      },
    },
  ]);
};

const handleToggleArchived = async (id, current) => {
  await toggleProjectArchived(id, !current);
  await loadProjects(); // ✅ dodaj await!
};

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Zarządzanie projektami</Text>

      <View style={styles.row}>
        <TextInput
          placeholder="Nowy projekt"
          value={newName}
          onChangeText={setNewName}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
          <Text style={styles.addText}>Dodaj</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.projectRow}>
            <Text style={{ flex: 1 }}>
              {item.name} {item.archived ? "(ukryty)" : ""}
            </Text>
            <TouchableOpacity
              onPress={() => handleToggleArchived(item.id, item.archived)}
              style={styles.actionBtn}
            >
              <Text>{item.archived ? "Pokaż" : "Ukryj"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={[styles.actionBtn, { backgroundColor: "#ffdddd" }]}
            >
              <Text>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  row: { flexDirection: "row", marginBottom: 20 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  addBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    justifyContent: "center",
    borderRadius: 5,
    marginLeft: 10,
  },
  addText: { color: "#fff", fontWeight: "bold" },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  actionBtn: {
    padding: 8,
    marginLeft: 10,
    backgroundColor: "#eee",
    borderRadius: 4,
  },
});
