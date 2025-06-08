import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const screenWidth = Dimensions.get('window').width;

const StatsScreen = () => {
  const [barData, setBarData] = useState([0, 0, 0, 0, 0, 0, 0]); // Mon–Sun
  const [pieData, setPieData] = useState([
    { name: "Ukończone", count: 0, color: "#4CAF50", legendFontColor: "#333", legendFontSize: 14 },
    { name: "Nieukończone", count: 0, color: "#F44336", legendFontColor: "#333", legendFontSize: 14 },
  ]);
  const [trendText, setTrendText] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tasks'));
        const tasks = querySnapshot.docs.map(doc => doc.data());

        // Zadania na dzień tygodnia (0–6: Mon–Sun)
        const weekCounts = [0, 0, 0, 0, 0, 0, 0];

        let doneCount = 0;
        let notDoneCount = 0;

        tasks.forEach(task => {
          if (task.done) {
            doneCount++;
            if (task.completedAt?.seconds) {
              const date = new Date(task.completedAt.seconds * 1000);
              const day = (date.getDay() + 6) % 7; // przestawienie niedzieli na koniec
              weekCounts[day]++;
            }
          } else {
            notDoneCount++;
          }
        });

        setBarData(weekCounts);

        setPieData([
          { name: "Ukończone", count: doneCount, color: "#4CAF50", legendFontColor: "#333", legendFontSize: 14 },
          { name: "Nieukończone", count: notDoneCount, color: "#F44336", legendFontColor: "#333", legendFontSize: 14 },
        ]);
      } catch (error) {
        console.error("Błąd pobierania zadań:", error);
      }
    };

    fetchTasks();
  }, []);

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>📊 Zadania wg dni tygodnia</Text>
      <BarChart
        data={{
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [{ data: barData }]
        }}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(66, 135, 245, ${opacity})`,
          labelColor: () => "#000"
        }}
        fromZero
        showValuesOnTopOfBars
        style={{ marginVertical: 10 }}
      />

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>🥧 Procent ukończonych zadań</Text>
      <PieChart
        data={pieData}
        width={screenWidth - 40}
        height={200}
        chartConfig={{ color: () => `#000` }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </ScrollView>
  );
};

export default StatsScreen;
