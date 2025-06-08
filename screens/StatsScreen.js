import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { getTasks } from "../firebase/firestoreService";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import weekday from "dayjs/plugin/weekday";

dayjs.extend(isoWeek);
dayjs.extend(weekday);

export default function StatsScreen() {
  const [completedThisWeek, setCompletedThisWeek] = useState([]);
  const [summaryText, setSummaryText] = useState("");

  useEffect(() => {
    const load = async () => {
      const allTasks = await getTasks(); // musisz zaimplementować getTasks()
      const completed = allTasks.filter((t) => t.done && t.completedAt);

      // tylko ten tydzień
      const start = dayjs().startOf("isoWeek");
      const end = dayjs().endOf("isoWeek");

      const thisWeek = completed.filter((t) =>
        dayjs(t.completedAt).isBetween(start, end, null, "[]")
      );

      // grupuj wg dni tygodnia
      const dayCounts = Array(7).fill(0);
      thisWeek.forEach((task) => {
        const day = dayjs(task.completedAt).day(); // 0=niedziela, 1=poniedziałek
        dayCounts[day] += 1;
      });

      const names = ["Nd", "Pn", "Wt", "Śr", "Czw", "Pt", "Sb"];
      setCompletedThisWeek(
        dayCounts.map((count, idx) => ({ day: names[idx], count }))
      );

      const maxDay = dayCounts.indexOf(Math.max(...dayCounts));
      setSummaryText(
        `W tym tygodniu najwięcej zadań ukończyłeś w: ${names[maxDay]}`
      );
    };

    load();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Statystyki tygodniowe</Text>
      {completedThisWeek.map((d) => (
        <Text key={d.day}>
          {d.day}: {d.count} zadań
        </Text>
      ))}
      <Text style={styles.summary}>{summaryText}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  summary: { marginTop: 20, fontStyle: "italic", color: "#007AFF" },
});
