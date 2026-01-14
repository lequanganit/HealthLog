import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    View,
    TextInput,
    Modal,
    TouchableOpacity,
    Text,
} from "react-native";
import { List, Button } from "react-native-paper";

import { authApis, endpoints } from "../utils/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Exercise = () => {
    const [exercises, setExercises] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    // Add
    const [modalVisible, setModalVisible] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [adding, setAdding] = useState(false);

    // Edit
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [saving, setSaving] = useState(false);

    const loadExercises = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApis(token).get(
                `${endpoints.exercises}?page=${page}`
            );

            if (page === 1) setExercises(res.data.results);
            else setExercises(prev => [...prev, ...res.data.results]);

            if (!res.data.next) setPage(0);
        } catch (err) {
            console.log("LOAD ERROR:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (page > 0 && !loading) setPage(page + 1);
    };

    useEffect(() => {
        if (page > 0) loadExercises();
    }, [page]);

    // ADD
    const handleAddExercise = async () => {
        if (!newName.trim()) {
            alert("Vui lòng nhập tên bài tập");
            return;
        }

        try {
            setAdding(true);
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApis(token).post(endpoints.exercises, {
                name: newName,
                description: newDescription,
            });

            setExercises(prev => [res.data, ...prev]);
            setNewName("");
            setNewDescription("");
            setModalVisible(false);
        } catch (err) {
            alert("Thêm bài tập thất bại");
        } finally {
            setAdding(false);
        }
    };

    // DELETE
    const handleDeleteExercise = async (id) => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            await authApis(token).delete(`${endpoints.exercises}${id}/`);

            setExercises(prev => prev.filter(item => item.id !== id));
            alert("Xóa thành công");
        } catch (err) {
            alert("Xóa thất bại");
        }
    };

    // EDIT
    const openEditModal = (exercise) => {
        setSelectedExercise(exercise);
        setEditName(exercise.name);
        setEditDescription(exercise.description);
        setEditModalVisible(true);
    };

    const handleUpdateExercise = async () => {
        if (!editName.trim()) {
            alert("Tên không được để trống");
            return;
        }

        try {
            setSaving(true);
            const token = await AsyncStorage.getItem("access_token");

            const res = await authApis(token).patch(
                `${endpoints.exercises}${selectedExercise.id}/`,
                {
                    name: editName,
                    description: editDescription,
                }
            );

            setExercises(prev =>
                prev.map(item =>
                    item.id === selectedExercise.id ? res.data : item
                )
            );

            setEditModalVisible(false);
            setSelectedExercise(null);
        } catch (err) {
            alert("Cập nhật thất bại");
        } finally {
            setSaving(false);
        }
    };
    const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    };


    return (
        <View style={{ flex: 1, padding: 15 }}>
            <Button mode="contained" onPress={() => setModalVisible(true)}>Thêm bài tập</Button>

            {/* ADD MODAL */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalWrapper}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Thêm bài tập</Text>

                        <TextInput
                            placeholder="Tên bài tập"
                            value={newName}
                            onChangeText={setNewName}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Mô tả"
                            value={newDescription}
                            onChangeText={setNewDescription}
                            style={styles.input}
                        />

                        <Button
                                mode="contained"
                                onPress={handleAddExercise}
                                loading={adding}
                                disabled={adding}
                                >
                                Thêm
                        </Button>

                        <View style={{ height: 10 }} />

                        <Button mode="outlined" onPress={() => setModalVisible(false)}>
                            Hủy
                        </Button>
                    </View>
                </View>
            </Modal>

            {/* EDIT MODAL */}
            <Modal visible={editModalVisible} transparent animationType="slide">
                <View style={styles.modalWrapper}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Chỉnh sửa bài tập
                        </Text>

                        <TextInput
                            placeholder="Tên bài tập"
                            value={editName}
                            onChangeText={setEditName}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Mô tả"
                            value={editDescription}
                            onChangeText={setEditDescription}
                            style={styles.input}
                        />

                        <Button mode="contained" 
                            onPress={handleUpdateExercise}
                            disabled={saving}
                        >Lưu </Button>
                        <View style={{ height: 10 }} />
                        <Button mode="contained" onPress={() => setEditModalVisible(false)}>Hủy </Button>
                    </View>
                </View>
            </Modal>

            <FlatList
                data={exercises}
                keyExtractor={item => item.id.toString()}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loading && <ActivityIndicator size="large" />
                }
                renderItem={({ item }) => (
                    <List.Item
                        title={item.name}
                        description={() => (
                                <View>
                                    {item.description ? (
                                        <Text style={styles.descText}>
                                            {item.description}
                                        </Text>
                                    ) : null}

                                    <Text style={styles.dateText}>
                                        Ngày tạo: {formatDate(item.created_date)}
                                    </Text>
                                </View>
                            )}
                        onPress={() => openEditModal(item)}
                        left={() => <List.Icon icon="dumbbell" />}
                        right={() => (
                            <TouchableOpacity
                                onPress={() =>
                                    handleDeleteExercise(item.id)
                                }
                            >
                                <Text style={{ color: "red" }}>Xóa</Text>
                            </TouchableOpacity>
                        )}
                        style={styles.item}
                    />
                )}
            />
        </View>
    );
};

export default Exercise;

const styles = {
    item: {
        backgroundColor: "#fff",
        marginVertical: 6,
        borderRadius: 10,
        elevation: 3,
    },
    modalWrapper: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 15,
    },
    input: {
        borderBottomWidth: 1,
        marginBottom: 15,
    },
};
