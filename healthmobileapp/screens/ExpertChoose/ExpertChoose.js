import { View, Text, FlatList, Alert, StyleSheet } from "react-native";
import { Button, Card, ActivityIndicator } from "react-native-paper";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis } from "../../utils/Apis";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const ExpertChoose = () => {
    const [experts, setExperts] = useState([]);
    const [connection, setConnection] = useState(null);
    const [loading, setLoading] = useState(false);

    const nav = useNavigation();

    /* ================== LOAD CONNECTION ================== */
    const loadConnection = async () => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) return;

            const res = await authApis(token).get("/connections/");
            const data = res.data;

            if (data && data.length > 0) {
                setConnection(data[0]);
                console.log("Connected expert:", data[0].expert_info.username);
            } else {
                setConnection(null);
            }
        } catch (err) {
            console.log("Load connection error:", err.response?.data || err);
        }
    };

    /* ================== LOAD EXPERTS ================== */
    const loadExperts = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) return;

            const res = await authApis(token).get("/experts/");
            setExperts(res.data);
        } catch (err) {
            console.log("Load experts error:", err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    /* ================== CONNECT EXPERT ================== */
    const connectExpert = async (expertId) => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) return;

            await authApis(token).post("/connections/", {
                expert: expertId
            });

            Alert.alert("Thành công", "Đã gửi yêu cầu kết nối");
            loadConnection();
        } catch (err) {
            Alert.alert(
                "Lỗi",
                err.response?.data?.detail || "Không thể kết nối"
            );
        }
    };

    useEffect(() => {
        loadConnection();
        loadExperts();
    }, []);

    /* ================== EMPTY STATE ================== */
    if (!loading && experts.length === 0) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>👨‍⚕️</Text>

                    <Text style={styles.emptyTitle}>
                        Chưa có chuyên gia
                    </Text>

                    <Text style={styles.emptyDesc}>
                        Hiện tại chưa có chuyên gia nào đăng ký.
                        Vui lòng quay lại sau.
                    </Text>

                    <Button
                        mode="contained"
                        style={styles.backBtn}
                        onPress={() => nav.navigate("ChooseMode")}
                    >
                        Quay về chọn chế độ
                    </Button>
                </View>
            </SafeAreaView>
        );
    }

    /* ================== MAIN UI ================== */
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                {loading && <ActivityIndicator size="large" />}

                {/* ===== CONNECTED ===== */}
                {connection && (
                    <Text style={styles.connectedText}>
                        ✅ Đã kết nối với chuyên gia{" "}
                        {connection.expert_info.first_name}
                    </Text>
                )}

                {/* ===== NOT CONNECTED ===== */}
                {!connection && (
                    <FlatList
                        data={experts}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <Card style={styles.card}>
                                <Card.Title
                                    title={item.username}
                                    subtitle={`Chuyên môn: ${item.expertise}`}
                                />
                                <Card.Content>
                                    <Text>
                                        Kinh nghiệm: {item.experience_year} năm
                                    </Text>
                                </Card.Content>
                                <Card.Actions>
                                    <Button
                                        mode="contained"
                                        onPress={() => connectExpert(item.id)}
                                    >
                                        Kết nối
                                    </Button>
                                </Card.Actions>
                            </Card>
                        )}
                    />
                )}

                <Button
                    mode="outlined"
                    style={styles.backBtn}
                    onPress={() => nav.navigate("ChooseMode")}
                >
                    Quay về chọn chế độ
                </Button>
            </View>
        </SafeAreaView>
    );
};

export default ExpertChoose;

/* ================== STYLES ================== */
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#fff"
    },

    container: {
        flex: 1,
        padding: 16
    },

    card: {
        marginBottom: 12,
        borderRadius: 10,
        elevation: 3
    },

    connectedText: {
        color: "green",
        fontSize: 16,
        marginBottom: 12,
        textAlign: "center",
        fontWeight: "600"
    },

    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24
    },

    emptyIcon: {
        fontSize: 64,
        marginBottom: 12
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8
    },

    emptyDesc: {
        textAlign: "center",
        color: "#666",
        marginBottom: 24,
        lineHeight: 20
    },

    backBtn: {
        marginTop: 16,
        alignSelf: "stretch"
    }
});
