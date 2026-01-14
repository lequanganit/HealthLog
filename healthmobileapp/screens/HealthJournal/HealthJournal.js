import React, { useState, useEffect } from "react";
import { Text, TextInput, TouchableOpacity, View, FlatList, Alert, } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../utils/Apis";
import styles from "./styles";

const HealthJournal = () => {
  const [exercisePlanId, setExercisePlanId] = useState("");
  const [content, setContent] = useState("");
  const [journals, setJournals] = useState([]);

  const fetchJournals = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await authApis(token).get(endpoints.health_journals);
      setJournals(res.data);
    } catch (err) {
      console.log(err.response?.data || err);
      Alert.alert("Lỗi", "Không thể lấy danh sách nhật ký");
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const handleSave = async () => {
    if (!exercisePlanId || !content) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("access_token");
      await authApis(token).post(endpoints.health_journals, {
        exercise_plan: Number(exercisePlanId),
        content: content,
      });

      Alert.alert("Thành công", "Đã lưu nhật ký sức khỏe");
      setExercisePlanId("");
      setContent("");
      fetchJournals();
    } catch (err) {
      console.log(err.response?.data || err);
      Alert.alert("Lỗi", "Không thể lưu nhật ký");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.journalItem}>
      <Text style={styles.journalTitle}>Kế hoạch: {item.exercise_plan}</Text>
      <Text>{item.content}</Text>
      <Text style={styles.journalDate}>{item.created_at}</Text>
    </View>
  );

  return (
    <FlatList
      data={journals}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>Nhật ký sức khỏe</Text>

          <Text style={styles.label}>ID kế hoạch tập luyện</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập ID (vd: 1)"
            value={exercisePlanId}
            onChangeText={setExercisePlanId}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Nội dung</Text>
          <TextInput
            style={styles.textArea}
            multiline
            value={content}
            onChangeText={setContent}
            placeholder="Mô tả buổi tập..."
          />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Lưu nhật ký</Text>
          </TouchableOpacity>

          <Text style={[styles.title, { marginTop: 20 }]}>
            Danh sách nhật ký
          </Text>
        </View>
      }
      contentContainerStyle={{ padding: 20 }}
    />
  );
};

export default HealthJournal;
