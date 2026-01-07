import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View, ScrollView, Image } from "react-native";
import { Card, TextInput, Button } from "react-native-paper";
import { authApis, endpoints } from "../../utils/Apis";

const HealthProfile = () => {
  const [health_profile, setHealthProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [dailyHealthMetrics, setDailyHealthMetrics] = useState(null);
  const [showEditDaily, setShowEditDaily] = useState(false);

  const [form, setForm] = useState({
    steps: "",
    water_intake: "",
    calories_burned: "",
  });

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      const res = await authApis(token).get(endpoints["current-user"]);
      setUser(res.data);
    } catch (err) {
      console.error("Lỗi load user:", err.response?.data || err.message);
    }
  };

  const loadHealthProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      const res = await authApis(token).get(endpoints["health_profile"]);

      const profile = Array.isArray(res.data) ? res.data[0] : res.data;

      setHealthProfile(profile);
    } catch (err) {
      console.error(
        "Lỗi load health profile:",
        err.response?.data || err.message
      );
    }
  };

  const loadDailyHealthMetrics = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      const res = await authApis(token).get(endpoints["health_metrics"]);

      const todayMetric = Array.isArray(res.data) ? res.data[0] : res.data;

      setDailyHealthMetrics(todayMetric);
    } catch (err) {
      console.error(
        "Lỗi load daily metrics:",
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    if (dailyHealthMetrics) {
      setForm({
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
        steps: Number(form.steps) || 0,
        water_intake: Number(form.water_intake) || 0,
        calories_burned: Number(form.calories_burned) || 0,
      };

      await authApis(token).post(endpoints["health_metrics"], payload);

      await loadDailyHealthMetrics();
      setShowEditDaily(false); // 

      alert("Cập nhật thành công ✅");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Cập nhật thất bại ❌");
    }
  };

  useEffect(() => {
    loadUser();
    loadHealthProfile();
    loadDailyHealthMetrics();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f6fa", padding: 16 }}>
      {health_profile ? (
        <>

          <Card style={{ backgroundColor: "#fce2e2ff", marginBottom: 16, borderRadius: 15, borderWidth: 1.5 }}>
            <Card.Content
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: "#6200ee",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                {user?.avatar ? (
                  console.log(`\nhttps://res.cloudinary.com/durpn2bki/${user.avatar}`),
                  <Image
                    source={{
                      uri: `https://res.cloudinary.com/durpn2bki/${user.avatar}`,
                    }}
                    style={{
                      width: 56,
                      height: 56,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={{ color: "#fff", fontSize: 22 }}>
                    {user?.username?.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>

              <View style={{ marginLeft: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: "600" }}>
                  {user?.first_name} {user?.last_name}
                </Text>
                <Text style={{ color: "#666" }}>@{user?.username}</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={{ marginBottom: 16, borderRadius: 12 }}>
            <Card.Title title="Chỉ số sức khỏe" />
            <Card.Content style={{ flexDirection: "row" }}>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "700" }}>
                  {health_profile.height}
                </Text>
                <Text>cm</Text>
                <Text style={{ color: "#666" }}>Chiều cao</Text>
              </View>

              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "700" }}>
                  {health_profile.weight}
                </Text>
                <Text>kg</Text>
                <Text style={{ color: "#666" }}>Cân nặng</Text>
              </View>

              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "700" }}>
                  {health_profile.bmi}
                </Text>
                <Text>BMI</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={{ marginBottom: 16, borderRadius: 12 }}>
            <Card.Title
              title="Chỉ số hôm nay"
              right={() => (
                <Button
                  onPress={() => setShowEditDaily(!showEditDaily)}
                  compact
                >
                  {showEditDaily ? "Hủy" : "Cập nhật"}
                </Button>
              )}
            />

            <Card.Content>
              {/* ===== VIEW MODE ===== */}
              {!showEditDaily && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1, alignItems: "center" }}>
                    <Text style={{ fontSize: 20, fontWeight: "700" }}>
                      {dailyHealthMetrics?.steps || 0}
                    </Text>
                    <Text>bước</Text>
                    <Text style={{ color: "#666" }}>Số bước</Text>
                  </View>

                  <View style={{ flex: 1, alignItems: "center" }}>
                    <Text style={{ fontSize: 20, fontWeight: "700" }}>
                      {dailyHealthMetrics?.water_intake || 0}
                    </Text>
                    <Text>ml</Text>
                    <Text style={{ color: "#666" }}>Nước uống</Text>
                  </View>

                  <View style={{ flex: 1, alignItems: "center" }}>
                    <Text style={{ fontSize: 20, fontWeight: "700" }}>
                      {dailyHealthMetrics?.calories_burned || 0}
                    </Text>
                    <Text>kcal</Text>
                    <Text style={{ color: "#666" }}>Calo đốt</Text>
                  </View>
                </View>
              )}

              {/* ===== EDIT MODE ===== */}
              {showEditDaily && (
                <View style={{ marginTop: 8 }}>
                  <TextInput
                    label="Số bước"
                    keyboardType="numeric"
                    value={form.steps}
                    onChangeText={(text) =>
                      setForm({ ...form, steps: text })
                    }
                    style={{ marginBottom: 10 }}
                  />

                  <TextInput
                    label="Lượng nước (ml)"
                    keyboardType="numeric"
                    value={form.water_intake}
                    onChangeText={(text) =>
                      setForm({ ...form, water_intake: text })
                    }
                    style={{ marginBottom: 10 }}
                  />

                  <TextInput
                    label="Calo đốt cháy (kcal)"
                    keyboardType="numeric"
                    value={form.calories_burned}
                    onChangeText={(text) =>
                      setForm({ ...form, calories_burned: text })
                    }
                    style={{ marginBottom: 16 }}
                  />

                  <Button
                    mode="contained"
                    onPress={submitDailyMetrics}
                  >
                    Lưu chỉ số hôm nay
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>

        </>
      ) : (
        <Text style={{ textAlign: "center", marginTop: 40 }}>
          Đang tải dữ liệu...
        </Text>
      )}
    </ScrollView>
  );
};

export default HealthProfile;
