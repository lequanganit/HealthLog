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
  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState({});
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [totalDuration, setTotalDuration] = useState("60 phút");
  const [note, setNote] = useState("");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("access_token");

        const planRes = await authApis(token).get(endpoints.exercises_plans);
        setPlans(planRes.data.results || planRes.data);

        const exRes = await authApis(token).get(endpoints.exercises);
        setExercises(exRes.data.results || exRes.data);
      } catch (err) {
        console.log(err.response?.data || err.message);
        Alert.alert("Lỗi", "Không tải được dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  /* ================= CHỌN / BỎ BÀI TẬP ================= */
  const toggleExercise = (id) => {
    setSelectedExercises((prev) => {
      if (prev[id]) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return {
        ...prev,
        [id]: { repetitions: "", duration: "" },
      };
    });
  };

  const updateExerciseField = (id, field, value) => {
    setSelectedExercises((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  /* ================= ADD PLAN ================= */
  const handleAddPlan = async () => {
    if (!name.trim()) return Alert.alert("Lỗi", "Chưa nhập tên kế hoạch");
    if (!date.trim()) return Alert.alert("Lỗi", "Chưa nhập ngày");
    if (Object.keys(selectedExercises).length === 0)
      return Alert.alert("Lỗi", "Chọn ít nhất 1 bài tập");

    // validate input
    for (const exId in selectedExercises) {
      const ex = selectedExercises[exId];
      if (!ex.repetitions || !ex.duration) {
        return Alert.alert("Lỗi", "Nhập đầy đủ số lần và thời gian");
      }
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");

      const planRes = await authApis(token).post(endpoints.exercises_plans, {
        name,
        date,
        total_duration: totalDuration,
        note,
      });

      const planId = planRes.data.id;

      for (const exId in selectedExercises) {
        const ex = selectedExercises[exId];
        await authApis(token).post(
          endpoints.add_exercise_to_plan(planId),
          {
            exercise_id: Number(exId),
            repetitions: Number(ex.repetitions),
            duration: Number(ex.duration),
          }
        );
      }

      setPlans([planRes.data, ...plans]);
      setModalVisible(false);
      setName("");
      setDate("");
      setTotalDuration("60 phút");
      setNote("");
      setSelectedExercises({});
      Alert.alert("Thành công", "Đã tạo kế hoạch");
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert("Lỗi", "Không thể tạo kế hoạch");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE PLAN ================= */
  const handleDeletePlan = async (id) => {
    Alert.alert("Xác nhận", "Xóa kế hoạch này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            const token = await AsyncStorage.getItem("access_token");
            await authApis(token).delete(`${endpoints.exercises_plans}${id}/`);
            setPlans((prev) => prev.filter((p) => p.id !== id));
          } catch {
            Alert.alert("Lỗi", "Xóa thất bại");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  /* ================= UI ================= */
  return (
    <View style={{ flex: 1 }}>
      <Button mode="contained" onPress={() => setModalVisible(true)} style={{ margin: 10 }}>
        Thêm kế hoạch
      </Button>

      <FlatList
        data={plans}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <List.Item
            title={`${item.name} (ID: ${item.id})`}
            description={`Ngày: ${item.date}\nThời lượng: ${item.total_duration}`}
            left={() => <List.Icon icon="calendar" />}
            right={() => (
              <Button onPress={() => handleDeletePlan(item.id)}>Xóa</Button>
            )}
            onPress={() =>
              navigation.navigate("ExercisePlanDetail", { planId: item.id })
            }
          />
        )}
        ListEmptyComponent={
          !loading && <Text style={{ textAlign: "center" }}>Chưa có kế hoạch</Text>
        }
      />

      {/* ============ MODAL ============ */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 10,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View style={{ backgroundColor: "#fff", padding: 15, borderRadius: 10 }}>
            <Text style={{ fontWeight: "bold" }}>Thêm kế hoạch</Text>

            <TextInput placeholder="Tên kế hoạch" value={name} onChangeText={setName} />
            <TextInput placeholder="Ngày (YYYY-MM-DD)" value={date} onChangeText={setDate} />
            <TextInput placeholder="Tổng thời lượng" value={totalDuration} onChangeText={setTotalDuration} />
            <TextInput placeholder="Ghi chú" value={note} onChangeText={setNote} />

            <Text style={{ fontWeight: "bold", marginTop: 10 }}>Bài tập</Text>

            {exercises.map((ex) => {
              const selected = selectedExercises[ex.id];
              return (
                <View key={ex.id} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Checkbox
                      status={selected ? "checked" : "unchecked"}
                      onPress={() => toggleExercise(ex.id)}
                    />
                    <Text>{ex.name}</Text>
                  </View>

                  {selected && (
                    <View style={{ flexDirection: "row", marginLeft: 40 }}>
                      <TextInput
                        placeholder="Số lần"
                        keyboardType="numeric"
                        value={selected.repetitions}
                        onChangeText={(t) =>
                          updateExerciseField(ex.id, "repetitions", t)
                        }
                        style={{ borderWidth: 1, width: 80, marginRight: 10 }}
                      />
                      <TextInput
                        placeholder="Phút"
                        keyboardType="numeric"
                        value={selected.duration}
                        onChangeText={(t) =>
                          updateExerciseField(ex.id, "duration", t)
                        }
                        style={{ borderWidth: 1, width: 80 }}
                      />
                    </View>
                  )}
                </View>
              );
            })}

            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <Button onPress={() => setModalVisible(false)}>Hủy</Button>
              <Button mode="contained" onPress={handleAddPlan}>Thêm</Button>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

export default ExercisePlan;
