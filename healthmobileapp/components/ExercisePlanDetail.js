import {
  ActivityIndicator,
  ScrollView,
  Text,
  View
} from "react-native";
import { useEffect, useState } from "react";
import { authApis, endpoints } from "../utils/Apis";
import { Card, List, TextInput, Button } from "react-native-paper";
import MyStyles from "../styles/MyStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ExercisePlanDetail = ({ route }) => {
  const planId = route.params?.planId;

  const [plan, setPlan] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  // EDIT STATE
  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState("");
  const [totalDuration, setTotalDuration] = useState("");
  const [note, setNote] = useState("");
  const [planDate, setPlanDate] = useState(""); 

  const loadPlan = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");

      const planRes = await authApis(token).get(
        endpoints.exercises_plan_detail(planId)
      );

      const exRes = await authApis(token).get(
        endpoints.add_exercise_to_plan(planId)
      );

      setPlan(planRes.data);
      setExercises(exRes.data);

      // set dữ liệu cho edit
      setName(planRes.data.name);
      setTotalDuration(planRes.data.total_duration);
      setNote(planRes.data.note || "");
      setPlanDate(planRes.data.date); // YYYY-MM-DD
    } catch (err) {
      console.log("LOAD PLAN ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      await authApis(token).patch(
        endpoints.exercises_plan_detail(planId),
        {
          name: name,
          total_duration: totalDuration,
          note: note,
          date: planDate   // 👈 PATCH thêm date
        }
      );

      setIsEdit(false);
      loadPlan();
    } catch (err) {
      console.log("UPDATE PLAN ERROR:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (planId) loadPlan();
  }, [planId]);

  return (
    <View style={{ flex: 1 }}>
      <Text style={[MyStyles.title, { paddingTop: 50 }]}>
        CHI TIẾT KẾ HOẠCH TẬP LUYỆN
      </Text>

      <ScrollView style={MyStyles.padding}>
        {loading && <ActivityIndicator size="large" color="blue" />}

        {/* ===== THÔNG TIN KẾ HOẠCH ===== */}
        {plan && (
          <Card style={MyStyles.margin}>
            <Card.Content>
              {isEdit ? (
                <>
                  <TextInput
                    label="Tên kế hoạch"
                    value={name}
                    onChangeText={setName}
                    style={{ marginBottom: 10 }}
                  />

                  <TextInput
                    label="Tổng thời lượng"
                    value={totalDuration}
                    onChangeText={setTotalDuration}
                    style={{ marginBottom: 10 }}
                  />

                  <TextInput
                    label="Ngày tập (YYYY-MM-DD)"
                    value={planDate}
                    onChangeText={setPlanDate}
                    style={{ marginBottom: 10 }}
                  />

                  <TextInput
                    label="Ghi chú"
                    value={note}
                    onChangeText={setNote}
                    multiline
                  />
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                    {plan.name}
                  </Text>
                  <Text>Tổng thời lượng: {plan.total_duration}</Text>
                  <Text>Ngày tập: {plan.date}</Text>
                  <Text>Ghi chú: {plan.note || "-"}</Text>
                </>
              )}

              <Button
                mode="contained"
                style={{ marginTop: 15 }}
                onPress={() => (isEdit ? updatePlan() : setIsEdit(true))}
              >
                {isEdit ? "LƯU THAY ĐỔI" : "CHỈNH SỬA"}
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* ===== DANH SÁCH BÀI TẬP ===== */}
        <Text style={[MyStyles.title, { fontSize: 18 }]}>
          DANH SÁCH BÀI TẬP
        </Text>

        {exercises.length > 0 ? (
          exercises.map((ex) => (
            <List.Item
              key={ex.id}
              title={ex.name}
              description={`Số lần: ${ex.repetitions} | ${ex.duration} phút`}
              left={(props) => (
                <List.Icon {...props} icon="dumbbell" />
              )}
            />
          ))
        ) : (
          !loading && (
            <Text style={{ textAlign: "center", marginTop: 10 }}>
              Chưa có bài tập nào
            </Text>
          )
        )}
      </ScrollView>
    </View>
  );
};

export default ExercisePlanDetail;
