// firebase/firestoreService.js
import { collection, addDoc, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

// Zadania – bez zmian
export const addTask = async (task) => {
  await addDoc(collection(db, "tasks"), task);
};

export const subscribeToTasks = (callback) => {
  return onSnapshot(collection(db, "tasks"), (querySnapshot) => {
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    callback(tasks);
  });
};

// Projekty
export const addProject = async (project) => {
  await addDoc(collection(db, "projects"), project);
};

export const getProjects = async () => {
  const snapshot = await getDocs(collection(db, "projects"));
  const projects = [];
  snapshot.forEach((doc) => {
    projects.push({ id: doc.id, ...doc.data() });
  });
  return projects;
};

export const toggleTaskDone = async (taskId, currentState) => {
  try {
    const ref = doc(db, "tasks", taskId);
    await updateDoc(ref, {
      done: !currentState,
    });
  } catch (error) {
    console.error("Błąd przy aktualizacji zadania:", error);
  }
};
