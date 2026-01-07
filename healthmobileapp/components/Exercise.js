import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, View, Button, TextInput, Modal, TouchableOpacity, Text } from "react-native";
import { List } from "react-native-paper";
import { authApis, endpoints } from "../utils/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Exercise = () => {
    const [exercises, setExercises] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [adding, setAdding] = useState(false);
    

    const loadExercises = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).get(`${endpoints.exercises}?page=${page}`);
            if (page === 1) setExercises(res.data.results);
            else setExercises(prev => [...prev, ...res.data.results]);
            if (!res.data.next) setPage(0);
        } catch (err) {
            console.log("LOAD EXERCISE ERROR:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };
    const handleDeleteExercise = async (id) => {
    try {
        const token = await AsyncStorage.getItem("token");
        await authApis(token).delete(`${endpoints.exercises}${id}/`); 
        
        setExercises(prev => prev.filter(item => item.id !== id));
        alert("Xóa bài tập thành công!");
    } catch (err) {
        console.log("Xóa bài tập lỗi:", err.response?.data || err.message);
        alert("Xóa bài tập thất bại!");
    }
    };
    


    const loadMore = () => {
        if (page > 0 && !loading) setPage(page + 1);
    };

    useEffect(() => {
        if (page > 0) loadExercises();
    }, [page]);

    const handleAddExercise = async () => {
        if (!newName.trim()) {
            alert("Vui lòng nhập tên bài tập");
            return;
        }
        try {
            setAdding(true);
            const token = await AsyncStorage.getItem("token");
            const data = { name: newName, description: newDescription };
            const res = await authApis(token).post(endpoints.exercises, data);
            setExercises(prev => [res.data, ...prev]);
            setNewName("");
            setNewDescription("");
            setModalVisible(false);
        } catch (err) {
            console.log("Thêm bài tập lỗi:", err.response?.data || err.message);
            alert("Thêm bài tập thất bại");
        } finally {
            setAdding(false);
        }
    };

    return (
        <View style={{ paddingHorizontal: 15, paddingTop: 20, flex: 1 }}>
  
            <Button
                title="Thêm bài tập"
                color="#4CAF50"
                onPress={() => setModalVisible(true)}
            />

    
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{
                    flex: 1,
                    justifyContent: "center",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    padding: 20
                }}>
                    <View style={{
                        backgroundColor: "#fff",
                        borderRadius: 10,
                        padding: 20
                    }}>
                        <TextInput
                            placeholder="Tên bài tập"
                            value={newName}
                            onChangeText={setNewName}
                            style={{ borderBottomWidth: 1, marginBottom: 15 }}
                        />
                        <TextInput
                            placeholder="Mô tả"
                            value={newDescription}
                            onChangeText={setNewDescription}
                            style={{ borderBottomWidth: 1, marginBottom: 15 }}
                        />
                        <Button title="Thêm" onPress={handleAddExercise} disabled={adding} />
                        <View style={{ height: 10 }} />
                        <Button title="Hủy" color="#f44336" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>

            <FlatList
                data={exercises}
                onEndReached={loadMore}
                onEndReachedThreshold={0.7}
                ListFooterComponent={loading && <ActivityIndicator size="large" />}
                renderItem={({ item }) => (
                    <List.Item
                        title={item.name}
                        description={`${item.description}\nNgày tạo: ${item.created_date}`}
                        style={styles.itemContainer}
                        titleStyle={styles.itemTitle}
                        descriptionStyle={styles.itemDescription}
                        left={() => <List.Icon icon="dumbbell" style={styles.itemIcon} />}
                        right={() => (
                            <TouchableOpacity onPress={() => handleDeleteExercise(item.id)}>
                                <Text style={{ color: "red", marginRight: 10 }}>Xóa</Text>
                            </TouchableOpacity>
                        )}
                    />
                )}
            />

        </View>
    );
};

export default Exercise;

const styles = {
    itemContainer: {
        backgroundColor: "#fff",
        marginVertical: 5,
        borderRadius: 10,
        padding: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    itemDescription: {
        fontSize: 14,
        color: "#666",
        marginTop: 3,
    },
    itemIcon: {
        backgroundColor: "#e0e0e0",
        borderRadius: 25,
        padding: 5,
    },
};
