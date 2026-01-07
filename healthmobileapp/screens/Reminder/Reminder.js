import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import { TextInput, Button, FAB } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../utils/Apis";

const Reminder = () => {
  const [reminders, setReminders] = useState([]);

  const [visible, setVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [time, setTime] = useState(""); // HH:mm
  const [describe, setDescribe] = useState("");

  // ================= LOAD =================
  const loadReminders = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await authApis(token).get(endpoints["reminders"]);
      setReminders(res.data);
    } catch (err) {
      console.log("LOAD ERROR:", err);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  // ================= OPEN MODAL =================
  useEffect(() => {
    if (editingReminder) {
      setTitle(editingReminder.title_name);

      const d = new Date(editingReminder.time);
      setDate(d.toISOString().split("T")[0]); // YYYY-MM-DD
      setTime(d.toTimeString().slice(0, 5));  // HH:mm

      setDescribe(editingReminder.describe || "");
    } else {
      setTitle("");
      setDate("");
      setTime("");
      setDescribe("");
    }
  }, [editingReminder]);

  // ================= CREATE / UPDATE =================
  const saveReminder = async () => {
    try {
      if (!date || !time || !title) return;

      const token = await AsyncStorage.getItem("access_token");

      // 🔥 FIX QUAN TRỌNG: dùng ISO 8601 chuẩn DRF
      const datetimeISO = new Date(`${date} ${time}`).toISOString();

      const data = {
        title_name: title,
        time: datetimeISO,
        describe: describe,
      };

      if (editingReminder) {
        // UPDATE
        await authApis(token).put(
          `${endpoints["reminders"]}${editingReminder.id}/`,
          data
        );
      } else {
        // CREATE
        await authApis(token).post(endpoints["reminders"], data);
      }

      setVisible(false);
      setEditingReminder(null);
      loadReminders();
    } catch (err) {
      console.log("SAVE ERROR:", err.response?.data || err.message);
    }
  };

  // ================= RENDER ITEM =================
  const renderItem = ({ item }) => {
    const d = new Date(item.time);

    return (
      <TouchableOpacity
        onPress={() => {
          setEditingReminder(item);
          setVisible(true);
        }}
      >
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.title}>{item.title_name}</Text>
            <Text style={styles.time}>
              {d.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>

          <Text style={styles.date}>
            📅 {d.toLocaleDateString()}
          </Text>

          {item.describe ? (
            <Text style={styles.desc}>📝 {item.describe}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Nhắc nhở của tôi</Text>

      {reminders.length === 0 ? (
        <Text style={styles.empty}>Chưa có reminder nào</Text>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}

      {/* ➕ FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          setEditingReminder(null);
          setVisible(true);
        }}
      />

      {/* MODAL CREATE / EDIT */}
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editingReminder ? "Chỉnh sửa reminder" : "Tạo reminder"}
            </Text>

            <TextInput
              label="Tiêu đề"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />

            <View style={styles.row}>
              <TextInput
                label="Ngày (YYYY-MM-DD)"
                value={date}
                onChangeText={setDate}
                style={[styles.input, styles.half]}
              />
              <TextInput
                label="Giờ (HH:mm)"
                value={time}
                onChangeText={setTime}
                style={[styles.input, styles.half]}
              />
            </View>

            <TextInput
              label="Mô tả"
              value={describe}
              onChangeText={setDescribe}
              multiline
              style={styles.input}
            />

            <Button mode="contained" onPress={saveReminder}>
              Lưu
            </Button>

            <Button
              textColor="gray"
              onPress={() => {
                setVisible(false);
                setEditingReminder(null);
              }}
            >
              Huỷ
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Reminder;

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
  },
  card: {
    backgroundColor: "#F4F6F8",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  time: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1976D2",
  },
  date: {
    marginTop: 4,
    color: "#555",
  },
  desc: {
    marginTop: 6,
    color: "#333",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  half: {
    width: "48%",
  },
});
