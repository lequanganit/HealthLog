import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    ActivityIndicator
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../utils/Apis";

const ListUserProfile = () => {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadConnections = async () => {
        try {
            const token = await AsyncStorage.getItem("access_token");

            if (!token) {
                console.log("❌ NO TOKEN");
                return;
            }

            const res = await authApis(token).get(
                endpoints["connections"]
            );

            console.log("CONNECTION API DATA:", res.data);
            setConnections(res.data);
        } catch (err) {
            console.error(
                "LOAD CONNECTION ERROR:",
                err.response?.data || err.message
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConnections();
    }, []);

    const renderItem = ({ item }) => {
        const user = item.user_info;

        return (
            <View style={styles.card}>
                <View style={styles.avatarWrapper}>
                    {user?.avatar ? (
                        <Image
                            source={{
                                uri: `https://res.cloudinary.com/durpn2bki/${user.avatar}`,
                            }}
                            style={styles.avatar}
                        />
                    ) : (
                        <Text style={styles.avatarText}>
                            {user?.username?.charAt(0).toUpperCase()}
                        </Text>
                    )}
                </View>

                <View style={styles.info}>
                    <Text style={styles.name}>
                        {user?.first_name || user?.last_name
                            ? `${user?.first_name} ${user?.last_name}`
                            : user?.username}
                    </Text>

                    <Text style={styles.username}>
                        @{user?.username}
                    </Text>

                    <Text style={styles.status}>
                        Trạng thái: {item.status}
                    </Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (connections.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={{ color: "#666" }}>
                    Chưa có người dùng kết nối
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                👥 Danh sách người dùng
            </Text>

            <FlatList
                data={connections}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default ListUserProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f6fb",
        paddingTop: 65,
        padding: 16,
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 16
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    card: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        elevation: 2
    },

    avatarWrapper: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "#4f46e5",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14
    },

    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26
    },

    avatarText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700"
    },

    info: {
        flex: 1
    },

    name: {
        fontSize: 16,
        fontWeight: "600"
    },

    username: {
        fontSize: 13,
        color: "#666",
        marginTop: 2
    },

    status: {
        fontSize: 12,
        color: "#16a34a",
        marginTop: 6
    }
});
