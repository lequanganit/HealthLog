import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView
} from "react-native";
import { useContext } from "react";
import { Button, TextInput } from "react-native-paper";

import { MyUserContext } from "../../utils/MyContexts";

const ExpertProfile = () => {
    const [user] = useContext(MyUserContext);

    const avatarUrl = user?.avatar
        ? `https://res.cloudinary.com/durpn2bki/${user.avatar}`
        : null;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarWrapper}>
                    {avatarUrl ? (
                        <Image
                            source={{ uri: avatarUrl }}
                            style={styles.avatar}
                        />
                    ) : (
                        <Text style={styles.avatarText}>
                            {user?.username
                                ?.charAt(0)
                                ?.toUpperCase()}
                        </Text>
                    )}
                </View>

                <Text style={styles.name}>
                    {user?.first_name || user?.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user?.username}
                </Text>

                <Text style={styles.role}>
                    Chuyên gia
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    👤 Thông tin tài khoản
                </Text>

                <TextInput
                    label="Username"
                    value={user?.username}
                    disabled
                    style={styles.input}
                />

                <TextInput
                    label="Email"
                    value={user?.email}
                    disabled
                    style={styles.input}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    🧑‍⚕️ Thông tin chuyên gia
                </Text>

                <TextInput
                    label="Chuyên môn"
                    value={user?.expert?.expertise || "Chưa cập nhật"}
                    disabled
                    style={styles.input}
                />

                <TextInput
                    label="Số năm kinh nghiệm"
                    value={
                        user?.expert?.experience_year
                            ? user.expert.experience_year.toString()
                            : "0"
                    }
                    disabled
                    style={styles.input}
                />
            </View>

            <Button
                mode="contained"
                style={styles.btn}
                onPress={() => alert("Chức năng cập nhật sau")}
            >
                Cập nhật hồ sơ
            </Button>
        </ScrollView>
    );
};

export default ExpertProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f6fb",
        padding: 20
    },

    header: {
        alignItems: "center",
        marginBottom: 24
    },

    avatarWrapper: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "#4f46e5",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12
    },

    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48
    },

    avatarText: {
        color: "#fff",
        fontSize: 36,
        fontWeight: "700"
    },

    name: {
        fontSize: 22,
        fontWeight: "700"
    },

    role: {
        fontSize: 14,
        color: "#666",
        marginTop: 4
    },

    section: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        elevation: 2
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12
    },

    input: {
        marginBottom: 12,
        backgroundColor: "#fff"
    },

    btn: {
        marginBottom: 30
    }
});
