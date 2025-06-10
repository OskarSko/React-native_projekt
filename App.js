// App.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
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
import AuthScreen from './screens/AuthScreen';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase/firebaseConfig";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";


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
  const [user, setUser] = useState(null);

const handleAddTask = async (taskData) => {
  await addTask({
    ...taskData,
    createdAt: new Date().toISOString(),
    labels: taskData.labelsInput.split(",").map((l) => l.trim()).filter((l) => l !== ""),
  });
};

  const loadProjects = async () => {
    if (!user) return;
    const data = await getProjects(false, user.uid);
    setProjects(data);
    if (data.length > 0 && !selectedProject) setSelectedProject(data[0].id);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadProjects();
      const unsubscribeTasks = subscribeToTasks((fetchedTasks) => {
        setTasks(fetchedTasks.filter((t) => t.userId === user.uid));
      }, user.uid);
      return () => unsubscribeTasks();
    }
  }, [user]);

  const getProjectName = (projectId) =>
    projects.find((p) => p.id === projectId)?.name || "Nieznany";

  const filterTasks = (tasks) => {
    const today = dayjs().startOf("day");
    const in7Days = dayjs().add(7, "day").endOf("day");
    let filtered = tasks;
    if (selectedProject) {
      filtered = filtered.filter((t) => t.projectId === selectedProject);
    }
    switch (selectedView) {
      case "Dzisiaj":
        return filtered.filter((t) => t.dueDate === today);
      case "Nadchodzące":
      return filtered.filter((t) => {
        if (!t.dueDate || t.done) return false;
        const due = dayjs(t.dueDate);
        // data po dziś, ale max 7 dni do przodu (włącznie)
        return due.isAfter(today) && (due.isBefore(in7Days) || due.isSame(in7Days, "day"));
      });
      case "Ważne":
        return filtered.filter((t) => t.priority === "wysoki" && !t.done);
      case "Przterminowane":
      return filtered.filter((t) => {
        if (!t.dueDate || t.done) return false;
        const due = dayjs(t.dueDate);
        return due.isBefore(today, "day");
      });
      case "Wykonane":
        return filtered.filter((t) => t.done);
      default:
        return filtered;
    }
  };






  const MainScreen = ({ navigation }) => (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Statystyki", { userId: user.uid })}
            style={styles.statsButton}
          >
            <Text style={styles.statsIcon}>📊</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>Lista zadań</Text>

          <TouchableOpacity
            onPress={() => signOut(auth)}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>Wyloguj</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subheading}>Projekt:</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={() => setSelectedProject(null)}
            style={[styles.button, selectedProject === null && styles.buttonSelected]}
          >
            <Text style={styles.buttonText}>Wszystkie</Text>
          </TouchableOpacity>
          {projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              onPress={() => setSelectedProject(project.id)}
              style={[styles.button, selectedProject === project.id && styles.buttonSelected]}
            >
              <Text style={styles.buttonText}>{project.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => navigation.navigate("Edytuj projekty", { userId: user.uid })}
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
                userId: user.uid,
              })
            }
          >
            <Text style={styles.addButtonText}>➕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subheading}>Widok:</Text>
        <View style={styles.buttonRow}>
          {["Wszystkie", "Dzisiaj", "Nadchodzące", "Ważne", "Przterminowane", "Wykonane"].map((id) => (
            <TouchableOpacity
              key={id}
              onPress={() => setSelectedView(id)}
              style={[styles.button, selectedView === id && styles.buttonSelected]}
            >
              <Text style={styles.buttonText}>{id.charAt(0).toUpperCase() + id.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TaskList tasks={filterTasks(tasks)} getProjectName={getProjectName} />
      </SafeAreaView>
    </View>
  );

  

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Lista zadań" component={MainScreen} />
            <Stack.Screen name="Dodaj zadanie" component={AddTaskScreen} />
            <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
            <Stack.Screen name="Edytuj projekty" component={ProjectManagerScreen} initialParams={{ userId: user?.uid }} />
            <Stack.Screen name="Statystyki" component={StatsScreen} initialParams={{ userId: user?.uid }} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 6,
  },
  topBarIcon: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 10,
  },
  topRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 15,
},

statsButton: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: "#007AFF",
  justifyContent: "center",
  alignItems: "center",
},

statsIcon: {
  color: "#fff",
  fontSize: 16,
},

logoutButton: {
  backgroundColor: "#FF3B30",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 6,
},

logoutText: {
  color: "#fff",
  fontWeight: "bold",
},
safeArea: {
  flex: 1,
  paddingTop: 20, // dzięki temu przyciski są niżej niż pasek systemowy
  paddingHorizontal: 20,
},

});
