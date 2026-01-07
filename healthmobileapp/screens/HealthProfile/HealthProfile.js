import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View, ScrollView, Image } from "react-native";
import { Card, TextInput, Button, RadioButton } from "react-native-paper";
import { authApis, endpoints } from "../../utils/Apis";

/* ================= BMI HELPERS ================= */
const getBmiStatus = (bmi) => {
  if (!bmi) return "Chưa có";
  if (bmi < 18.5) return "Gầy";
  if (bmi < 25) return "Bình thường";
  if (bmi < 30) return "Thừa cân";
  return "Béo phì";
};

const getBmiColor = (bmi) => {
  if (!bmi) return "#999";
  if (bmi < 18.5) return "#2196f3";
  if (bmi < 25) return "#4caf50";
  if (bmi < 30) return "#ff9800";
  return "#f44336";
};

const GENDER_OPTIONS = [
  { label: "Nam", value: "MALE" },
  { label: "Nữ", value: "FEMALE" },
  { label: "Khác", value: "OTHER" },
];


const GOAL_OPTIONS = [
  { label: "Giảm cân", value: "WEIGHT_LOSS" },
  { label: "Tăng cân", value: "WEIGHT_GAIN" },
  { label: "Giữ dáng", value: "MAINTAINING" },
];

/* ================= COMPONENT ================= */
const HealthProfile = () => {
  const [user, setUser] = useState(null);
  const [healthProfile, setHealthProfile] = useState(null);
  const [dailyHealthMetrics, setDailyHealthMetrics] = useState(null);

  const [showEditDaily, setShowEditDaily] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);

  /* ===== FORM CREATE PROFILE ===== */
  const [createForm, setCreateForm] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "MALE",
    goal: "MAINTAIN",
  });

  /* ===== FORM DAILY METRICS ===== */
  const [dailyForm, setDailyForm] = useState({
    steps: "",
    water_intake: "",
    calories_burned: "",
  });

  /* ================= LOADERS ================= */
  const loadUser = async () => {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) return;

    const res = await authApis(token).get(endpoints["current-user"]);
    setUser(res.data);
  };

  const loadHealthProfile = async () => {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) return;

    const res = await authApis(token).get(endpoints["health_profile"]);
    const profile = Array.isArray(res.data) ? res.data[0] : res.data;

    setHealthProfile(profile || null);
  };

  const loadDailyHealthMetrics = async () => {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) return;

    const res = await authApis(token).get(endpoints["health_metrics"]);
    const todayMetric = Array.isArray(res.data) ? res.data[0] : res.data;

    setDailyHealthMetrics(todayMetric || null);
  };

  /* ================= CREATE PROFILE ================= */
  const submitHealthProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      setCreatingProfile(true);

      const payload = {
        height: Number(createForm.height),
        weight: Number(createForm.weight),
        age: Number(createForm.age),
        gender: createForm.gender, // ENUM
        goal: createForm.goal,     // ENUM
      };

      await authApis(token).post(endpoints["health_profile"], payload);

      await loadHealthProfile();
      alert("Tạo hồ sơ sức khỏe thành công ✅");
    } catch (err) {
      console.log("CREATE PROFILE ERROR:", err.response?.data);
      console.log("STATUS:", err.response?.status);
      alert(JSON.stringify(err.response?.data));
    }
    finally {
      setCreatingProfile(false);
    }
  };

  /* ================= DAILY METRICS ================= */
  useEffect(() => {
    if (dailyHealthMetrics) {
      setDailyForm({
        steps: String(dailyHealthMetrics.steps || ""),
        water_intake: String(dailyHealthMetrics.water_intake || ""),
        calories_burned: String(dailyHealthMetrics.calories_burned || ""),
      });
    }
  }, [dailyHealthMetrics]);

  const submitDailyMetrics = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      const payload = {
        steps: Number(dailyForm.steps) || 0,
        water_intake: Number(dailyForm.water_intake) || 0,
        calories_burned: Number(dailyForm.calories_burned) || 0,
      };

      await authApis(token).post(endpoints["health_metrics"], payload);

      await loadDailyHealthMetrics();
      setShowEditDaily(false);

      alert("Cập nhật thành công ✅");
    } catch (err) {
      alert("Cập nhật thất bại ❌");
    }
  };

  /* ================= INIT ================= */
  useEffect(() => {
    loadUser();
    loadHealthProfile();
    loadDailyHealthMetrics();
  }, []);

  /* ================= RENDER ================= */
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f6f7e4ff", padding: 16 }}>
      {/* ========== CREATE PROFILE ========== */}
      {!healthProfile ? (
        <Card style={{ borderRadius: 14 }}>
          <Card.Title title="Tạo hồ sơ sức khỏe" />
          <Card.Content>
            <TextInput
              label="Chiều cao (cm)"
              keyboardType="numeric"
              value={createForm.height}
              onChangeText={(t) =>
                setCreateForm({ ...createForm, height: t })
              }
              style={{ marginBottom: 12 }}
            />

            <TextInput
              label="Cân nặng (kg)"
              keyboardType="numeric"
              value={createForm.weight}
              onChangeText={(t) =>
                setCreateForm({ ...createForm, weight: t })
              }
              style={{ marginBottom: 12 }}
            />

            <TextInput
              label="Tuổi"
              keyboardType="numeric"
              value={createForm.age}
              onChangeText={(t) =>
                setCreateForm({ ...createForm, age: t })
              }
              style={{ marginBottom: 12 }}
            />
            <Text style={{ fontWeight: "600", marginBottom: 6 }}>Giới tính</Text>
            <RadioButton.Group
              onValueChange={(value) =>
                setCreateForm({ ...createForm, gender: value })
              }
              value={createForm.gender}
            >
              {GENDER_OPTIONS.map((item) => (
                <View
                  key={item.value}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <RadioButton value={item.value} />
                  <Text>{item.label}</Text>
                </View>
              ))}
            </RadioButton.Group>
            <Text style={{ fontWeight: "600", marginTop: 12, marginBottom: 6 }}>
              Mục tiêu
            </Text>

            <RadioButton.Group
              onValueChange={(value) =>
                setCreateForm({ ...createForm, goal: value })
              }
              value={createForm.goal}
            >
              {GOAL_OPTIONS.map((item) => (
                <View
                  key={item.value}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <RadioButton value={item.value} />
                  <Text>{item.label}</Text>
                </View>
              ))}
            </RadioButton.Group>

            <Button
              mode="contained"
              style={{ marginTop: 16 }}
              onPress={submitHealthProfile}
            >
              Lưu hồ sơ
            </Button>

          </Card.Content>
        </Card>
      ) : (
        <>
          {/* ===== USER INFO ===== */}
          <Card style={{ marginBottom: 16, borderRadius: 14 }}>
            <Card.Content style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  overflow: "hidden",
                  backgroundColor: "#6200ee",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {user?.avatar ? (
                  <Image
                    source={{
                      uri: `https://res.cloudinary.com/durpn2bki/${user.avatar}`,
                    }}
                    style={{ width: 56, height: 56 }}
                  />
                ) : (
                  <Text style={{ color: "#fff", fontSize: 22 }}>
                    {user?.username?.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>

              <View style={{ marginLeft: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: "700" }}>
                  {user?.first_name} {user?.last_name}
                </Text>
                <Text style={{ color: "#777" }}>@{user?.username}</Text>
              </View>
            </Card.Content>
          </Card>

          {/* ===== BASIC INFO ===== */}
          <Card style={{ marginBottom: 16, borderRadius: 14 }}>
            <Card.Title title="Thông tin cơ bản" />
            <Card.Content style={{ flexDirection: "row" }}>
              {[
                ["Chiều cao", healthProfile.height, "cm"],
                ["Cân nặng", healthProfile.weight, "kg"],
                ["Tuổi", healthProfile.age, "tuổi"],
              ].map(([label, value, unit], i) => (
                <View key={i} style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ color: "#666" }}>{label}</Text>
                  <Text style={{ fontSize: 20, fontWeight: "700" }}>
                    {value}
                  </Text>
                  <Text>{unit}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>

          {/* ===== BMI ===== */}
          <Card style={{ marginBottom: 16, borderRadius: 14 }}>
            <Card.Title title="Chỉ số BMI" />
            <Card.Content style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 32, fontWeight: "800" }}>
                {healthProfile.bmi}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontWeight: "600",
                  color: getBmiColor(healthProfile.bmi),
                }}
              >
                {getBmiStatus(healthProfile.bmi)}
              </Text>
            </Card.Content>
          </Card>

          {/* ===== DAILY METRICS ===== */}
          <Card style={{ marginBottom: 16, borderRadius: 14 }}>
            <Card.Title
              title="Chỉ số hôm nay"
              right={() => (
                <Button onPress={() => setShowEditDaily(!showEditDaily)} compact>
                  {showEditDaily ? "Hủy" : "Cập nhật"}
                </Button>
              )}
            />

            <Card.Content>
              {!showEditDaily ? (
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  {[
                    ["Số bước", dailyHealthMetrics?.steps, "bước"],
                    ["Nước uống", dailyHealthMetrics?.water_intake, "ml"],
                    ["Calo đốt", dailyHealthMetrics?.calories_burned, "kcal"],
                  ].map(([label, value, unit], i) => (
                    <View key={i} style={{ flex: 1, alignItems: "center" }}>
                      <Text style={{ fontSize: 20, fontWeight: "700" }}>
                        {value || 0}
                      </Text>
                      <Text>{unit}</Text>
                      <Text style={{ color: "#666" }}>{label}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <>
                  <TextInput
                    label="Số bước"
                    keyboardType="numeric"
                    value={dailyForm.steps}
                    onChangeText={(t) =>
                      setDailyForm({ ...dailyForm, steps: t })
                    }
                    style={{ marginBottom: 10 }}
                  />
                  <TextInput
                    label="Lượng nước (ml)"
                    keyboardType="numeric"
                    value={dailyForm.water_intake}
                    onChangeText={(t) =>
                      setDailyForm({ ...dailyForm, water_intake: t })
                    }
                    style={{ marginBottom: 10 }}
                  />
                  <TextInput
                    label="Calo đốt (kcal)"
                    keyboardType="numeric"
                    value={dailyForm.calories_burned}
                    onChangeText={(t) =>
                      setDailyForm({ ...dailyForm, calories_burned: t })
                    }
                    style={{ marginBottom: 16 }}
                  />

                  <Button mode="contained" onPress={submitDailyMetrics}>
                    Lưu chỉ số hôm nay
                  </Button>
                </>
              )}
            </Card.Content>
          </Card>
        </>
      )}
    </ScrollView>
  );
};

export default HealthProfile;
