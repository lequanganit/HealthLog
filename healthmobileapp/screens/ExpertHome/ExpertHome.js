import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image
} from "react-native";
import { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import { MyUserContext } from "../../utils/MyContexts";
import { authApis } from "../../utils/Apis";

const ExpertHome = () => {
    const [user, dispatch] = useContext(MyUserContext);
    const navigation = useNavigation();

    const [connectionCount, setConnectionCount] = useState(0);

    /* ===== LOAD CONNECTION COUNT ===== */
    useEffect(() => {
        const loadConnections = async () => {
            try {
                const token = await AsyncStorage.getItem("access_token");
                if (!token) return;

                const res = await authApis(token).get("/connections/");

                console.log("CONNECTION API DATA:", res.data);
                console.log("hello");
                if (Array.isArray(res.data)) {
                    setConnectionCount(res.data.length);
                } else {
                    setConnectionCount(0);
                }
            } catch (err) {
                console.log(
                    "LOAD CONNECTION ERROR:",
                    err.response?.data || err
                );
            }
        };

        loadConnections();
    }, []);

    /* ===== LOGOUT ===== */
    const logout = async () => {
        await AsyncStorage.multiRemove([
            "access_token",
            "refresh_token"
        ]);

        dispatch({ type: "logout" });

        navigation.reset({
            index: 0,
            routes: [{ name: "Login" }]
        });
    };

    /* ===== DATA ===== */
    const fullName =
        user?.first_name || user?.last_name
            ? `${user.first_name || ""} ${user.last_name || ""}`
            : user?.username;

    const avatarUrl = user?.avatar
        ? `https://res.cloudinary.com/durpn2bki/${user.avatar}`
        : null;

    return (
        <View style={styles.container}>
            {/* ===== HEADER ===== */}
            <View style={styles.header}>
                <View style={styles.avatarWrapper}>
                    {avatarUrl ? (
                        <Image
                            source={{ uri: avatarUrl }}
                            style={styles.avatar}
                        />
                    ) : (
                        <Text style={styles.avatarText}>
                            {user?.username?.charAt(0).toUpperCase()}
                        </Text>
                    )}
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{fullName}</Text>
                    <Text style={styles.role}>Chuyên gia</Text>
                </View>

                <TouchableOpacity onPress={logout}>
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>

            {/* ===== STATS ===== */}
            <View style={styles.stats}>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>
                        {user?.expert?.experience_year || 0}
                    </Text>
                    <Text style={styles.statLabel}>Năm kinh nghiệm</Text>
                </View>

                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>
                        {connectionCount}
                    </Text>
                    <Text style={styles.statLabel}>Người dùng</Text>
                </View>
            </View>

            {/* ===== ACTIONS ===== */}
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate("ExpertProfile")}
            >
                <Text style={styles.cardTitle}>🧑‍⚕️ Hồ sơ chuyên gia</Text>
                <Text style={styles.cardDesc}>
                    Thông tin chuyên môn & kinh nghiệm
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate("ListUserProfile")}
            >
                <Text style={styles.cardTitle}>👥 Người dùng kết nối</Text>
                <Text style={styles.cardDesc}>
                    Danh sách người dùng đang theo dõi
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default ExpertHome;
const styles = StyleSheet.create({
    container: {

        paddingTop: 65,
        flex: 1,
        backgroundColor: "#f4f6fb",
        padding: 20
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24
    },

    avatarWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#4f46e5",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16
    },

    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28
    },

    avatarText: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "700"
    },

    name: {
        fontSize: 18,
        fontWeight: "700"
    },

    role: {
        fontSize: 14,
        color: "#666",
        marginTop: 2
    },

    logoutText: {
        color: "#ef4444",
        fontSize: 14
    },

    stats: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24
    },

    statBox: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        alignItems: "center",
        marginHorizontal: 6,
        elevation: 2
    },

    statNumber: {
        fontSize: 22,
        fontWeight: "700"
    },

    statLabel: {
        fontSize: 12,
        color: "#666",
        marginTop: 4
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        elevation: 3
    },

    cardTitle: {
        fontSize: 18,
        fontWeight: "600"
    },

    cardDesc: {
        fontSize: 14,
        color: "#666",
        marginTop: 6
    }
});
