import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyUserContext } from "../../utils/MyContexts";
import MyStyles from "../../styles/MyStyles";

const Home = ({ navigation }) => {
    const [user, dispatch] = useContext(MyUserContext);

    const logout = async () => {
        await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
        dispatch({ type: "logout" });

        navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
        });
    };

    return (
        <View style={[MyStyles.padding, styles.container]}>
            <Text style={styles.welcome}>
                👋 Xin chào
            </Text>

            <Text style={styles.username}>
                {user?.first_name || user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user?.username}
            </Text>

            <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                    {user?.role === "EXPERT" ? "Chuyên gia" : "Người dùng"}
                </Text>
            </View>

            <View style={styles.actions}>
                {user?.role === "USER" && (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate("ChooseMode")}
                    >
                        <Text style={styles.cardTitle}>🔍 Chọn chuyên gia</Text>
                        <Text style={styles.cardDesc}>
                            Kết nối với chuyên gia phù hợp với bạn
                        </Text>
                    </TouchableOpacity>
                )}

                {user?.role === "EXPERT" && (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate("ExpertScreen")}
                    >
                        <Text style={styles.cardTitle}>🧑‍⚕️ Trang chuyên gia</Text>
                        <Text style={styles.cardDesc}>
                            Quản lý khách hàng và yêu cầu kết nối
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between"
    },

    welcome: {
        fontSize: 20,
        color: "#555"
    },

    username: {
        fontSize: 26,
        fontWeight: "700",
        marginVertical: 6
    },

    roleBadge: {
        alignSelf: "flex-start",
        backgroundColor: "#e3f2fd",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 20
    },

    roleText: {
        color: "#1976d2",
        fontWeight: "600"
    },

    actions: {
        flex: 1,
        justifyContent: "center"
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        elevation: 3
    },

    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 6
    },

    cardDesc: {
        color: "#666",
        fontSize: 14
    },

    logoutBtn: {
        backgroundColor: "#ff5252",
        padding: 14,
        borderRadius: 10,
        alignItems: "center"
    },

    logoutText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16
    }
});


export default Home;
