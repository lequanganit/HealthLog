import React, { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Text } from "react-native-paper";
import { authApis, endpoints } from "../utils/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ExercisePlanDetail = ({ route }) => {
  const { planId } = route.params;
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPlan = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      try {
        const res = await authApis(token).get(endpoints.add_exercise_to_plan(planId));
        setPlan(res.data);
      } catch (err) {
        console.log(err.response?.data || err.message);
        Alert.alert("Lỗi", "Không tải được chi tiết bài tập");
      } finally {
        setLoading(false);
      }
    };
    loadPlan();
  }, [planId]);

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  if (!plan) return <Text style={{ margin: 20 }}>Không có dữ liệu</Text>;

  return (
    <ScrollView style={{ padding: 15 }}>
      <Text style={{ fontWeight: "bold", fontSize: 20 }}>{plan.name}</Text>
      <Text>Ngày: {plan.date}</Text>
      <Text>Tổng thời lượng: {plan.total_duration}</Text>
      <Text>Ghi chú: {plan.note || "-"}</Text>

      <Text style={{ fontWeight: "bold", marginTop: 10 }}>Bài tập:</Text>
      {plan.exercises && plan.exercises.length > 0 ? (
        plan.exercises.map((ex) => (
          <Text key={ex.id}>
            - {ex.name}: {ex.repetitions} lần, {ex.duration} phút
          </Text>
        ))
      ) : (
        <Text>Chưa có bài tập nào</Text>
      )}
    </ScrollView>
  );
};

export default ExercisePlanDetail;
