import { View, Text, StyleSheet } from "react-native";
import { Button, Icon } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const ChooseMode = () => {
    const nav = useNavigation();

    return (
        <SafeAreaView style={styles.safe}>
            {/* ===== HEADER ===== */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    Chọn chế độ sử dụng
                </Text>
                <Text style={styles.subTitle}>
                    Vui lòng chọn cách bạn muốn sử dụng ứng dụng
                </Text>
            </View>

            {/* ===== BODY ===== */}
            <View style={styles.body}>
                {/* ===== KHỐI CÁ NHÂN ===== */}
                <View style={styles.block}>
                    <Icon
                        source="account-heart"
                        size={56}
                        color="#2e7d32"
                    />

                    <Text style={styles.blockTitle}>
                        Theo dõi cá nhân
                    </Text>

                    <Text style={styles.blockDesc}>
                        Quản lý sức khỏe, nhật ký,
                        chỉ số hằng ngày
                    </Text>

                    <Button
                        mode="contained"
                        style={styles.btn}
                        onPress={() => nav.navigate("HealthProfile")}
                    >
                        Vào ngay
                    </Button>
                </View>

                {/* ===== KHỐI CHUYÊN GIA ===== */}
                <View style={styles.block}>
                    <Icon
                        source="account-tie"
                        size={56}
                        color="#1565c0"
                    />

                    <Text style={styles.blockTitle}>
                        Kết nối chuyên gia
                    </Text>

                    <Text style={styles.blockDesc}>
                        Nhận tư vấn từ chuyên gia
                        dinh dưỡng & tập luyện
                    </Text>

                    <Button
                        mode="contained"
                        style={styles.btn}
                        onPress={() => nav.navigate("ExpertChoose")}
                    >
                        Chọn chuyên gia
                    </Button>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default ChooseMode;

/* ================= STYLE ================= */
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#f4f6f8"
    },

    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: "center",
        marginTop: 15,
    },

    title: {
        fontSize: 26,
        fontWeight: "700",
        marginBottom: 6
    },

    subTitle: {
        fontSize: 14,
        color: "#666"
    },

    body: {
        flex: 1,                     // 🔴 BẮT BUỘC
        flexDirection: "Column",   // ✅ sắp xếp khối con theo cột
        justifyContent: "center",    // ✅ căn giữa theo chiều cao
        alignItems: "center",        // ✅ căn giữa theo chiều ngang của khối con
        paddingHorizontal: 16
    },

    block: {
        width: "100%",
        height: 260,                 // ✅ GIỚI HẠN CHIỀU CAO
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 20,
        alignItems: "center",
        justifyContent: "space-between", // ✅ CÂN ĐỀU ICON – TEXT – BUTTON
        margin: 20,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
    },

    blockTitle: {
        fontSize: 17,
        fontWeight: "700",
        marginTop: 8,
        marginBottom: 4,
        textAlign: "center"
    },

    blockDesc: {
        fontSize: 12,
        textAlign: "center",
        color: "#666"
    },

    btn: {
        width: "100%",
        borderRadius: 12
    }
});
