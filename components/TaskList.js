import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { toggleTaskDone } from "../firebase/firestoreService";


export default function TaskList({ tasks, getProjectName }) {
  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
<TouchableOpacity onPress={() => toggleTaskDone(item.id, item.done)}>

          <Text
            style={[
              { fontSize: 16 },
              item.done && {
                textDecorationLine: "line-through",
                color: "#888",
              },
            ]}
          >
            ✅ {item.title} ({getProjectName(item.projectId)}) – {item.dueDate} –{" "}
            {item.priority}
          </Text>
          {item.labels && item.labels.length > 0 && (
            <Text style={{ color: "#555", marginTop: 2 }}>
              {item.labels.map((l) => l).join(" ")}
            </Text>
          )}
        </TouchableOpacity>
      )}
    />
  );
}
