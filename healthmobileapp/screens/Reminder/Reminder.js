import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, Platform, } from "react-native";
import { TextInput, Button, FAB } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../utils/Apis";
import ReminderStyles from "../../styles/ReminderStyles";

const Reminder = () => {
  const [reminders, setReminders] = useState([]);

  const [visible, setVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [describe, setDescribe] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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

  useEffect(() => {
    if (editingReminder) {
      setTitle(editingReminder.title_name);

      const d = new Date(editingReminder.time);

      setDate(
        d.toLocaleDateString("en-CA", {
          timeZone: "Asia/Ho_Chi_Minh",
        })
      );

      setTime(
        d.toLocaleTimeString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );

      setDescribe(editingReminder.describe || "");
    } else {
      setTitle("");
      setDate("");
      setTime("");
      setDescribe("");
    }
  }, [editingReminder]);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const d = selectedDate.toLocaleDateString("en-CA");
      setDate(d);
    }
  };

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const t = selectedTime.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setTime(t);
    }
  };

  const saveReminder = async () => {
    try {
      if (!date || !time || !title) return;

      const token = await AsyncStorage.getItem("access_token");

      const datetimeISO = new Date(`${date}T${time}:00`).toISOString();

      const data = {
        title_name: title,
        time: datetimeISO,
        describe,
      };

      if (editingReminder) {
        await authApis(token).put(
          `${endpoints["reminders"]}${editingReminder.id}/`,
          data
        );
      } else {
        await authApis(token).post(endpoints["reminders"], data);
      }

      setVisible(false);
      setEditingReminder(null);
      loadReminders();
    } catch (err) {
      console.log("SAVE ERROR:", err.response?.data || err.message);
    }
  };

  const renderItem = ({ item }) => {
    const d = new Date(item.time);

    return (
      <TouchableOpacity
        onPress={() => {
          setEditingReminder(item);
          setVisible(true);
        }}
      >
        <View style={ReminderStyles.card}>
          <View style={ReminderStyles.rowBetween}>
            <Text style={ReminderStyles.title}>{item.title_name}</Text>
            <Text style={ReminderStyles.time}>
              {d.toLocaleTimeString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </Text>
          </View>

          <Text style={ReminderStyles.date}>
            📅{" "}
            {d.toLocaleDateString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
            })}
          </Text>

          {item.describe ? (
            <Text style={ReminderStyles.desc}>📝 {item.describe}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={ReminderStyles.container}>
      <Text style={ReminderStyles.header}>Nhắc nhở của tôi</Text>

      {reminders.length === 0 ? (
        <Text style={ReminderStyles.empty}>Chưa có reminder nào</Text>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}

      <FAB
        icon="plus"
        style={ReminderStyles.fab}
        onPress={() => {
          setEditingReminder(null);
          setVisible(true);
        }}
      />

      <Modal visible={visible} animationType="slide" transparent>
        <View style={ReminderStyles.modalOverlay}>
          <View style={ReminderStyles.modal}>
            <Text style={ReminderStyles.modalTitle}>
              {editingReminder ? "Chỉnh sửa reminder" : "Tạo reminder"}
            </Text>

            <TextInput
              label="Tiêu đề"
              value={title}
              onChangeText={setTitle}
              style={ReminderStyles.input}
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                label="Ngày"
                value={date}
                editable={false}
                style={ReminderStyles.input}
                right={<TextInput.Icon icon="calendar" />}
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onChangeDate}
              />
            )}

            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
              <TextInput
                label="Giờ"
                value={time}
                editable={false}
                style={ReminderStyles.input}
                right={<TextInput.Icon icon="clock-outline" />}
              />
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour={true}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onChangeTime}
              />
            )}

            <TextInput
              label="Mô tả"
              value={describe}
              onChangeText={setDescribe}
              multiline
              style={ReminderStyles.input}
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
