import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#FFFFFF",
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 12,
    },
    empty: {
        textAlign: "center",
        marginTop: 40,
        color: "#777",
    },
    card: {
        backgroundColor: "#F4F6F8",
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
    },
    time: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1976D2",
    },
    date: {
        marginTop: 4,
        color: "#555",
    },
    desc: {
        marginTop: 6,
        color: "#333",
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        padding: 16,
    },
    modal: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    input: {
        marginBottom: 10,
        backgroundColor: "#fff",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    half: {
        width: "48%",
    },
});
