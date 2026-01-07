import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { List, Button, Text, Checkbox } from "react-native-paper";
import { authApis, endpoints } from "../utils/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const ExercisePlan = () => {
  const navigation = useNavigation();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal thêm kế hoạch
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [totalDuration, setTotalDuration] = useState("60 phút");
  const [note, setNote] = useState("");
  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState({});

  // Load dữ liệu kế hoạch và bài tập
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      try {
        const plansRes = await authApis(token).get(endpoints.exercises_plans);
        setPlans(plansRes.data.results || plansRes.data);

        const exercisesRes = await authApis(token).get(endpoints.exercises);
        setExercises(exercisesRes.data.results || exercisesRes.data);
      } catch (err) {
        console.log(err);
        Alert.alert("Lỗi", "Không tải được dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleExercise = (id) => {
    setSelectedExercises((prev) => {
      if (prev[id]) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: { repetitions: 10, duration: 10 } };
    });
  };

  const handleAddPlan = async () => {
    if (!name.trim()) return Alert.alert("Nhập tên kế hoạch");
    if (!date.trim()) return Alert.alert("Nhập ngày thực hiện kế hoạch (YYYY-MM-DD)");
    if (Object.keys(selectedExercises).length === 0) return Alert.alert("Chọn ít nhất 1 bài tập");

    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    try {
      const planRes = await authApis(token).post(endpoints.exercises_plans, {
        name,
        date,
        total_duration: totalDuration,
        note,
      });

      const planId = planRes.data.id;
      for (const exId of Object.keys(selectedExercises)) {
        const exData = selectedExercises[exId];
        await authApis(token).post(`${endpoints.exercises_plans}${planId}/exercises/`, {
          exercise_id: exId,
          repetitions: exData.repetitions,
          duration: exData.duration,
        });
      }

      setPlans([planRes.data, ...plans]);
      setModalVisible(false);
      setName("");
      setDate("");
      setTotalDuration("60 phút");
      setNote("");
      setSelectedExercises({});
      Alert.alert("Thành công", "Đã thêm kế hoạch!");
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert("Thêm thất bại", JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa kế hoạch này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          const token = await AsyncStorage.getItem("token");
          try {
            await authApis(token).delete(`${endpoints.exercises_plans}${planId}/`);
            setPlans((prev) => prev.filter((p) => p.id !== planId));
            Alert.alert("Thành công", "Đã xóa kế hoạch!");
          } catch (err) {
            console.log(err.response?.data || err.message);
            Alert.alert("Lỗi", "Xóa kế hoạch thất bại");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleViewPlan = (plan) => {
    // Điều hướng sang màn hình chi tiết
    navigation.navigate("ExercisePlanDetail", { planId: plan.id });
  };

  return (
    <View style={{ flex: 1 }}>
      <Button mode="contained" onPress={() => setModalVisible(true)} style={{ margin: 10 }}>
        Thêm kế hoạch
      </Button>

      <FlatList
        data={plans}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={!loading && <Text style={{ textAlign: "center", marginTop: 20 }}>Chưa có kế hoạch</Text>}
        ListFooterComponent={loading && <ActivityIndicator style={{ margin: 20 }} />}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={`Ngày: ${item.date || "-"}\nTổng thời lượng: ${item.total_duration}\nGhi chú: ${item.note || "-"}`}
            left={() => <List.Icon icon="calendar" />}
            right={() => (
              <Button mode="text" onPress={() => handleDeletePlan(item.id)} style={{ alignSelf: "center" }}>
                Xóa
              </Button>
            )}
            onPress={() => handleViewPlan(item)}
          />
        )}
      />

      {/* Modal thêm kế hoạch */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 10, backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: "#fff", padding: 15, borderRadius: 10 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Thêm kế hoạch mới</Text>

            <TextInput placeholder="Tên kế hoạch" value={name} onChangeText={setName} style={{ borderWidth: 1, marginBottom: 10, padding: 8 }} />
            <TextInput placeholder="Ngày thực hiện (YYYY-MM-DD)" value={date} onChangeText={setDate} style={{ borderWidth: 1, marginBottom: 10, padding: 8 }} />
            <TextInput placeholder="Tổng thời lượng" value={totalDuration} onChangeText={setTotalDuration} style={{ borderWidth: 1, marginBottom: 10, padding: 8 }} />
            <TextInput placeholder="Ghi chú" value={note} onChangeText={setNote} style={{ borderWidth: 1, marginBottom: 10, padding: 8 }} multiline />

            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Chọn bài tập:</Text>
            {exercises.map((ex) => (
              <View key={ex.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
                <Checkbox status={selectedExercises[ex.id] ? "checked" : "unchecked"} onPress={() => toggleExercise(ex.id)} />
                <Text>{ex.name}</Text>
              </View>
            ))}

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10 }}>
              <Button onPress={() => setModalVisible(false)}>Hủy</Button>
              <Button mode="contained" onPress={handleAddPlan} style={{ marginLeft: 5 }}>
                Thêm
              </Button>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

export default ExercisePlan;
