import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';


const screenWidth = Dimensions.get('window').width;

const StatsScreen = () => {
  const [barData, setBarData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [pieData, setPieData] = useState([]);
  const [trendText, setTrendText] = useState("");
  const [bestDay, setBestDay] = useState("");
  const [labelsSummary, setLabelsSummary] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tasks'));
        const tasks = querySnapshot.docs.map(doc => doc.data());

        const weekCounts = [0, 0, 0, 0, 0, 0, 0];
        const labelMap = {};
        let doneCount = 0;
        let notDoneCount = 0;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay() + 1);

        const prevWeekStart = new Date(thisWeekStart);
        prevWeekStart.setDate(prevWeekStart.getDate() - 7);
        const prevWeekEnd = new Date(thisWeekStart);
        prevWeekEnd.setDate(thisWeekStart.getDate() - 1);

        let currentWeekDone = 0;
        let previousWeekDone = 0;

        tasks.forEach(task => {
          if (task.done !== true || !task.createdAt || !task.completedAt) return;

          const createdAt = task.createdAt?.seconds
            ? new Date(task.createdAt.seconds * 1000)
            : new Date(task.createdAt);
          const completedAt = task.completedAt?.seconds
            ? new Date(task.completedAt.seconds * 1000)
            : new Date(task.completedAt);

          doneCount++;

          if (completedAt >= thisWeekStart) currentWeekDone++;
          else if (completedAt >= prevWeekStart && completedAt <= prevWeekEnd) previousWeekDone++;

          const day = (completedAt.getDay() + 6) % 7;
          weekCounts[day]++;

          if (task.labels && Array.isArray(task.labels)) {
            task.labels.forEach(label => {
              labelMap[label] = (labelMap[label] || 0) + 1;
            });
          }
        });

        setBarData(weekCounts);

        setPieData([
          {
            name: "Ukończone",
            count: doneCount,
            color: "#4CAF50",
            legendFontColor: "#333",
            legendFontSize: 14
          },
          {
            name: "Nieukończone",
            count: tasks.length - doneCount,
            color: "#F44336",
            legendFontColor: "#333",
            legendFontSize: 14
          }
        ]);

        // trend (bez „Jeszcze nic nie zrobiłeś”)
        if (previousWeekDone === 0 && currentWeekDone > 0) {
          setTrendText("📈 Zaczynasz działać! (0 → " + currentWeekDone + ")");
        } else if (previousWeekDone > 0) {
          const change = ((currentWeekDone - previousWeekDone) / previousWeekDone) * 100;
          if (change > 0) {
            setTrendText(`📈 Rośniesz! +${Math.round(change)}% więcej zadań niż tydzień temu`);
          } else if (change < 0) {
            setTrendText(`📉 Spadek o ${Math.abs(Math.round(change))}% względem poprzedniego tygodnia`);
          } else {
            setTrendText("📊 Stabilnie – tyle samo zadań co ostatnio.");
          }
        } else {
          setTrendText(""); // brak trendu do pokazania
        }

        const max = Math.max(...weekCounts);
        const bestIndex = weekCounts.findIndex(v => v === max);
        const days = ["Poniedziałki", "Wtorki", "Środy", "Czwartki", "Piątki", "Soboty", "Niedziele"];
        setBestDay(`${days[bestIndex]} to Twój czas!`);

        const labelArray = Object.entries(labelMap).map(([name, count]) => ({
          name: `#${name}`,
          count,
          color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
          legendFontColor: '#333',
          legendFontSize: 14
        }));
        setLabelsSummary(labelArray);

      } catch (error) {
        console.error("Błąd pobierania zadań:", error);
      }
    };

    fetchTasks();
  }, []);

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>📈 Statystyki</Text>
      {!!trendText && <Text style={{ marginVertical: 10 }}>{trendText}</Text>}
      <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>{bestDay}</Text>

      <BarChart
        data={{
          labels: ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"],
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

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>🏷️ Na co poświęcasz czas?</Text>
      <PieChart
        data={labelsSummary}
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
