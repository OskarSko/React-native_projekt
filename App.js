import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import TaskList from "./components/TaskList";
import {
  addTask,
  subscribeToTasks,
  getProjects,
} from "./firebase/firestoreService";
import dayjs from "dayjs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AddTaskScreen from "./screens/AddTaskScreen";
import TaskDetailsScreen from "./screens/TaskDetailsScreen";
import ProjectManagerScreen from "./screens/ProjectManagerScreen";
import StatsScreen from "./screens/StatsScreen";


const Stack = createStackNavigator();

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [dueDate, setDueDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [priority, setPriority] = useState("średni");
  const [selectedView, setSelectedView] = useState("all");
  const [labelsInput, setLabelsInput] = useState("");

const handleAddTask = async (taskData) => {
  await addTask({
    ...taskData,
    projectId: selectedProject,
    createdAt: new Date().toISOString(), // ✅ to jest kluczowe
    labels: taskData.labelsInput
      .split(",")
      .map((l) => l.trim())
      .filter((l) => l !== ""),
  });
};

const handleAddProject = async () => {
  const name = prompt("Podaj nazwę projektu:");
  if (name) {
    try {
      const id = await addProject(name);
      await loadProjects();
      setSelectedProject(id);
    } catch (error) {
      console.error("Błąd dodawania projektu:", error);
    }
  }
};



  const loadProjects = async () => {
    const data = await getProjects(false); // tylko aktywne
    setProjects(data);
    if (data.length > 0 && !selectedProject) setSelectedProject(data[0].id);
  };

  useEffect(() => {
    const unsubscribe = subscribeToTasks(setTasks);
    loadProjects();
    return () => unsubscribe();
  }, []);

  const getProjectName = (projectId) =>
    projects.find((p) => p.id === projectId)?.name || "Nieznany";

  const filterTasks = (tasks) => {
    const today = dayjs().format("YYYY-MM-DD");
    const in7Days = dayjs().add(7, "day").format("YYYY-MM-DD");

    let filtered = tasks;

    if (selectedProject) {
      filtered = filtered.filter((t) => t.projectId === selectedProject);
    }

    switch (selectedView) {
      case "today":
        return filtered.filter((t) => t.dueDate === today);
      case "upcoming":
        return filtered.filter((t) => t.dueDate > today && t.dueDate <= in7Days && !t.done);
      case "important":
        return filtered.filter((t) => t.priority === "wysoki" && !t.done);
      case "overdue":
        return filtered.filter((t) => t.dueDate && t.dueDate < today && !t.done);
      case "done":
        return filtered.filter((t) => t.done);
      default:
        return filtered;
    }
  };

  const MainScreen = ({ navigation }) => (
    <View style={styles.container}>
      {/* Górna sekcja: nagłówek i przycisk ➕ */}

      <TouchableOpacity
        onPress={() => navigation.navigate("Statystyki")}
        style={[styles.addButton, { marginLeft: 10 }]}
      >
        <Text style={styles.addButtonText}>📊</Text>
      </TouchableOpacity>

          <Text style={styles.subheading}>Projekt:</Text>
    <View style={styles.buttonRow}>
      <TouchableOpacity
        onPress={() => setSelectedProject(null)}
        style={[
          styles.button,
          selectedProject === null && styles.buttonSelected,
        ]}
      >
        <Text style={styles.buttonText}>Wszystkie</Text>
      </TouchableOpacity>

      {projects.map((project) => (
        <TouchableOpacity
          key={project.id}
          onPress={() => setSelectedProject(project.id)}
          style={[
            styles.button,
            selectedProject === project.id && styles.buttonSelected,
          ]}
        >
          <Text style={styles.buttonText}>{project.name}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={() => navigation.navigate("Edytuj projekty")}
        style={styles.addProjectButton}
      >
        <Text style={styles.addProjectText}>Edytuj</Text>
      </TouchableOpacity>
    </View>

      <View style={styles.headerRow}>
        <Text style={styles.heading}>Lista zadań</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("Dodaj zadanie", {
              newTaskTitle,
              setNewTaskTitle,
              dueDate,
              setDueDate,
              priority,
              setPriority,
              labelsInput,
              setLabelsInput,
              selectedProject,
              setSelectedProject,
              projects,
              handleAddTask,
            })
          }
        >
          <Text style={styles.addButtonText}>➕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subheading}>Widok:</Text>
      <View style={styles.buttonRow}>
        {[
          { id: "all", label: "Wszystkie" },
          { id: "today", label: "Dzisiaj" },
          { id: "upcoming", label: "Nadchodzące" },
          { id: "important", label: "Ważne" },
          { id: "overdue", label: "Zaległe" },
          { id: "done", label: "Ukończone" },
        ].map((view) => (
          <TouchableOpacity
            key={view.id}
            onPress={() => setSelectedView(view.id)}
            style={[
              styles.button,
              selectedView === view.id && styles.buttonSelected,
            ]}
          >
            <Text style={styles.buttonText}>{view.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TaskList tasks={filterTasks(tasks)} getProjectName={getProjectName} />
    </View>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Lista zadań" component={MainScreen} />
        <Stack.Screen name="Dodaj zadanie" component={AddTaskScreen} />
        <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
        <Stack.Screen name="Edytuj projekty" component={ProjectManagerScreen} />
        <Stack.Screen name="Statystyki" component={StatsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontWeight: "bold", fontSize: 20 },
  subheading: { marginTop: 15, fontWeight: "600" },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#ccc",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 10,
    marginBottom: 10,
  },
  buttonSelected: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  addProjectButton: {
  backgroundColor: "#007AFF",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 6,
  marginLeft: 10,
  },
  addProjectText: {
    color: "#fff",
    fontWeight: "bold",
  },

});
