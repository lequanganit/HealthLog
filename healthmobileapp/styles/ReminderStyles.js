import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f7f7f2",
    },
    header: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
        color: "#222222",
    },
    empty: {
        textAlign: "center",
        marginTop: 40,
        color: "#777777",
    },
    card: {
        backgroundColor: "#ffffff",
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#222222",
    },
    time: {
        fontSize: 16,
        fontWeight: "700",
        color: "#ed8128",
    },
    date: {
        marginTop: 4,
        color: "#666666",
    },
    desc: {
        marginTop: 6,
        color: "#444444",
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
        backgroundColor: "#ed8128",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        padding: 16,
    },
    modal: {
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
        color: "#222222",
    },
    input: {
        marginBottom: 10,
        backgroundColor: "#ffffff",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    half: {
        width: "48%",
    },
});
