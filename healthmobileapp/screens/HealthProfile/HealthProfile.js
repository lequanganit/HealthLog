import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View, ScrollView, Image, StyleSheet, } from "react-native";
import { Card, TextInput, Button, RadioButton, } from "react-native-paper";
import { authApis, endpoints } from "../../utils/Apis";

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

const HealthProfile = () => {
  const [user, setUser] = useState(null);
  const [healthProfile, setHealthProfile] = useState(null);
  const [dailyHealthMetrics, setDailyHealthMetrics] = useState(null);

  const [showEditDaily, setShowEditDaily] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);

  const [createForm, setCreateForm] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "MALE",
    goal: "MAINTAINING",
  });

  const [dailyForm, setDailyForm] = useState({
    steps: "",
    water_intake: "",
    calories_burned: "",
  });

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
    const today = Array.isArray(res.data) ? res.data[0] : res.data;
    setDailyHealthMetrics(today || null);
  };

  const submitHealthProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      setCreatingProfile(true);

      const payload = {
        height: Number(createForm.height),
        weight: Number(createForm.weight),
        age: Number(createForm.age),
        gender: createForm.gender,
        goal: createForm.goal,
      };

      await authApis(token).post(endpoints["health_profile"], payload);
      await loadHealthProfile();
      alert("Tạo hồ sơ sức khỏe thành công ✅");
    } catch (err) {
      alert("Tạo hồ sơ thất bại ❌");
    } finally {
      setCreatingProfile(false);
    }
  };

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
    } catch {
      alert("Cập nhật thất bại ❌");
    }
  };

  useEffect(() => {
    if (dailyHealthMetrics) {
      setDailyForm({
        steps: String(dailyHealthMetrics.steps || ""),
        water_intake: String(dailyHealthMetrics.water_intake || ""),
        calories_burned: String(dailyHealthMetrics.calories_burned || ""),
      });
    }
  }, [dailyHealthMetrics]);

  useEffect(() => {
    loadUser();
    loadHealthProfile();
    loadDailyHealthMetrics();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {!healthProfile ? (
        <Card style={styles.card}>
          <Card.Title title="Tạo hồ sơ sức khỏe" />
          <Card.Content>
            <TextInput
              label="Chiều cao (cm)"
              keyboardType="numeric"
              value={createForm.height}
              onChangeText={(t) =>
                setCreateForm({ ...createForm, height: t })
              }
              style={styles.input}
            />

            <TextInput
              label="Cân nặng (kg)"
              keyboardType="numeric"
              value={createForm.weight}
              onChangeText={(t) =>
                setCreateForm({ ...createForm, weight: t })
              }
              style={styles.input}
            />

            <TextInput
              label="Tuổi"
              keyboardType="numeric"
              value={createForm.age}
              onChangeText={(t) =>
                setCreateForm({ ...createForm, age: t })
              }
              style={styles.input}
            />

            <Text style={styles.sectionTitle}>Giới tính</Text>
            <RadioButton.Group
              value={createForm.gender}
              onValueChange={(v) =>
                setCreateForm({ ...createForm, gender: v })
              }
            >
              {GENDER_OPTIONS.map((item) => (
                <View key={item.value} style={styles.radioRow}>
                  <RadioButton value={item.value} />
                  <Text>{item.label}</Text>
                </View>
              ))}
            </RadioButton.Group>

            <Text style={styles.sectionTitleTop}>Mục tiêu</Text>
            <RadioButton.Group
              value={createForm.goal}
              onValueChange={(v) =>
                setCreateForm({ ...createForm, goal: v })
              }
            >
              {GOAL_OPTIONS.map((item) => (
                <View key={item.value} style={styles.radioRow}>
                  <RadioButton value={item.value} />
                  <Text>{item.label}</Text>
                </View>
              ))}
            </RadioButton.Group>

            <Button
              mode="contained"
              style={styles.saveButton}
              loading={creatingProfile}
              onPress={submitHealthProfile}
            >
              Lưu hồ sơ
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <>
          <Card style={styles.card}>
            <Card.Content style={styles.profileRow}>
              <View style={styles.avatar}>
                {user?.avatar ? (
                  <Image
                    source={{
                      uri: `https://res.cloudinary.com/durpn2bki/${user.avatar}`,
                    }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {user?.username?.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.username}>
                  {user?.first_name} {user?.last_name}
                </Text>
                <Text style={styles.subText}>@{user?.username}</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title titleStyle={styles.cardTitle} title="Thông tin cơ bản" />
            <Card.Content style={styles.row}>
              {[
                ["Chiều cao", healthProfile.height, "cm"],
                ["Cân nặng", healthProfile.weight, "kg"],
                ["Tuổi", healthProfile.age, "tuổi"],
              ].map(([label, value, unit], i) => (
                <View key={i} style={styles.centerItem}>
                  <Text style={styles.labelGray}>{label}</Text>
                  <Text style={styles.valueBig}>{value}</Text>
                  <Text>{unit}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title titleStyle={styles.cardTitle} title="Chỉ số BMI" />
            <Card.Content style={styles.centerItem}>
              <Text style={styles.valueHuge}>{healthProfile.bmi}</Text>
              <Text
                style={[
                  styles.bmiStatus,
                  { color: getBmiColor(healthProfile.bmi) },
                ]}
              >
                {getBmiStatus(healthProfile.bmi)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title titleStyle={styles.cardTitle} title="Chỉ số hôm nay"
              right={() => (
                <Button onPress={() => setShowEditDaily(!showEditDaily)} compact>
                  {showEditDaily ? "Hủy" : "Cập nhật"}
                </Button>
              )}
            />
            <Card.Content>
              {!showEditDaily ? (
                <View style={styles.todayRow}>
                  {[
                    ["Số bước", dailyHealthMetrics?.steps, "bước"],
                    ["Nước", dailyHealthMetrics?.water_intake, "ml"],
                    ["Calo", dailyHealthMetrics?.calories_burned, "kcal"],
                  ].map(([label, value, unit], i) => (
                    <View key={i} style={styles.centerItem}>
                      <Text style={styles.valueBig}>{value || 0}</Text>
                      <Text>{unit}</Text>
                      <Text style={styles.labelGray}>{label}</Text>
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
                    style={styles.dailyInput}
                  />
                  <TextInput
                    label="Nước uống (ml)"
                    keyboardType="numeric"
                    value={dailyForm.water_intake}
                    onChangeText={(t) =>
                      setDailyForm({ ...dailyForm, water_intake: t })
                    }
                    style={styles.dailyInput}
                  />
                  <TextInput
                    label="Calo đốt (kcal)"
                    keyboardType="numeric"
                    value={dailyForm.calories_burned}
                    onChangeText={(t) =>
                      setDailyForm({
                        ...dailyForm,
                        calories_burned: t,
                      })
                    }
                    style={styles.dailySave}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f2",
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    elevation: 2,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 6,
    color: "#333333",
  },
  sectionTitleTop: {
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 6,
    color: "#3e2a2a",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: "#ed8128",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#ff9a9a",
    backgroundColor: "#ed8128",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 2,
  },
  avatarImage: {
    width: 56,
    height: 56,
  },
  avatarText: {
    color: "#000000",
    fontSize: 22,
    fontWeight: "700",
  },
  profileInfo: {
    marginLeft: 16,
  },
  username: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222222",
  },
  subText: {
    color: "#767676",
  },
  row: {
    flexDirection: "row",
  },
  centerItem: {
    flex: 1,
    alignItems: "center",
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 20,
    color: "#000000"
  },
  valueBig: {
    fontSize: 25,
    fontWeight: "700",
    color: "#ed8128",
  },
  valueHuge: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ed8128",
  },
  labelGray: {
    fontWeight: 700,
    color: "#000000",
  },
  bmiStatus: {
    marginTop: 6,
    fontWeight: "600",
  },
  todayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dailyInput: {
    marginBottom: 10,
    backgroundColor: "#ffffff",
  },
  dailySave: {
    marginBottom: 16,
    backgroundColor: "#ffffff",
  },
});
