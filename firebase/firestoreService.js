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

export const addProject = async (name) => {
  const ref = await addDoc(collection(db, "projects"), {
    name,
    archived: false,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
};

export const getProjects = async (includeArchived = false) => {
  const snapshot = await getDocs(collection(db, "projects"));
  const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return includeArchived ? all : all.filter((p) => !p.archived);
};

export const deleteProject = async (id) => {
  await deleteDoc(doc(db, "projects", id));
};

export const toggleProjectArchived = async (id, newValue) => {
  await updateDoc(doc(db, "projects", id), {
    archived: newValue,
  });
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

export const getTasks = async () => {
  const snapshot = await getDocs(collection(db, "tasks"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};