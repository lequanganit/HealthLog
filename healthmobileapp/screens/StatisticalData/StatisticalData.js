import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { authApis, endpoints } from "../../utils/Apis";

const PRIMARY = "#2E7D32";
const BACKGROUND = "#F4F6F8";
const CARD = "#FFFFFF";
const TEXT_MAIN = "#111827";
const TEXT_SUB = "#6B7280";

const FILTERS = [
    { key: "week", label: "TUẦN" },
    { key: "month", label: "THÁNG" }
];

const StatisticalData = () => {
    const [filter, setFilter] = useState("week");
    const [weekOffset, setWeekOffset] = useState(0);
    const [month, setMonth] = useState(new Date().getMonth());
    const [year] = useState(new Date().getFullYear());

    const [healthProfiles, setHealthProfiles] = useState([]);
    const [healthMetrics, setHealthMetrics] = useState([]);
    const [exercisePlans, setExercisePlans] = useState([]);

    const loadData = async () => {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) return;

        try {
            const [profileRes, metricRes, planRes] = await Promise.all([
                authApis(token).get(endpoints.health_profile),
                authApis(token).get(endpoints.health_metrics),
                authApis(token).get(endpoints.exercises_plans)
            ]);

            setHealthProfiles(profileRes.data);
            setHealthMetrics(metricRes.data);
            setExercisePlans(planRes.data);
        } catch (err) {
            console.log("STATISTIC API ERROR:", err.response?.data || err);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const getWeekRange = () => {
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay() + 1 + weekOffset * 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return { start, end };
    };

    const filterByTime = (data, field = "created_date") => {
        if (filter === "week") {
            const { start, end } = getWeekRange();
            return data.filter(item => {
                const d = new Date(item[field]);
                return d >= start && d <= end;
            });
        }

        return data.filter(item => {
            const d = new Date(item[field]);
            return d.getMonth() === month && d.getFullYear() === year;
        });
    };

    const filteredMetrics = filterByTime(healthMetrics);
    const filteredPlans = filterByTime(exercisePlans);

    const totalWater = filteredMetrics.reduce(
        (sum, item) => sum + (item.water_intake || 0),
        0
    );

    const totalSteps = filteredMetrics.reduce(
        (sum, item) => sum + (item.steps || 0),
        0
    );

    const totalCalories = filteredMetrics.reduce(
        (sum, item) => sum + (item.calories_burned || 0),
        0
    );

    const totalMinutes = filteredPlans.reduce(
        (sum, item) => sum + (item.duration || 0),
        0
    );

    const bmi = healthProfiles.length
        ? healthProfiles[healthProfiles.length - 1].bmi
        : "--";

    const { start, end } = getWeekRange();

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.filterRow}>
                {FILTERS.map(item => (
                    <TouchableOpacity
                        key={item.key}
                        style={[
                            styles.filterBtn,
                            filter === item.key && styles.filterActive
                        ]}
                        onPress={() => setFilter(item.key)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                filter === item.key && styles.filterTextActive
                            ]}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.timeRow}>
                <TouchableOpacity
                    onPress={() =>
                        filter === "week"
                            ? setWeekOffset(weekOffset - 1)
                            : setMonth((month + 11) % 12)
                    }
                >
                    <Text style={styles.navBtn}>◀</Text>
                </TouchableOpacity>

                <Text style={styles.timeText}>
                    {filter === "week"
                        ? `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`
                        : `Tháng ${month + 1}/${year}`}
                </Text>

                <TouchableOpacity
                    onPress={() =>
                        filter === "week"
                            ? setWeekOffset(weekOffset + 1)
                            : setMonth((month + 1) % 12)
                    }
                >
                    <Text style={styles.navBtn}>▶</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>Chỉ số sức khỏe</Text>
                <View style={styles.grid}>
                    <StatCard label="BMI" value={bmi} />
                    <StatCard label="Nước uống" value={`${totalWater} L`} />
                    <StatCard label="Bước đi" value={totalSteps} />
                    <StatCard label="Calo" value={`${totalCalories} kcal`} />
                </View>
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>Biểu đồ tổng hợp</Text>
                <BarChart
                    data={[
                        { label: "Nước", value: totalWater },
                        { label: "Bước", value: totalSteps },
                        { label: "Calo", value: totalCalories }
                    ]}
                />
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>Thời gian tập luyện</Text>
                <View style={styles.exerciseCard}>
                    <View>
                        <Text style={styles.exerciseValue}>
                            {totalMinutes} phút
                        </Text>
                        <Text style={styles.exerciseLabel}>
                            Tổng thời gian
                        </Text>
                    </View>

                    <View>
                        <Text style={styles.exerciseValue}>
                            {filteredPlans.length}
                        </Text>
                        <Text style={styles.exerciseLabel}>
                            Số buổi tập
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const StatCard = ({ label, value }) => (
    <View style={styles.statCard}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const BarChart = ({ data }) => {
    const maxValue = Math.max(...data.map(i => i.value), 1);

    return (
        <View style={chartStyles.container}>
            {data.map((item, index) => {
                const height = (item.value / maxValue) * 120;
                return (
                    <View key={index} style={chartStyles.barWrapper}>
                        <View style={[chartStyles.bar, { height }]} />
                        <Text style={chartStyles.barValue}>{item.value}</Text>
                        <Text style={chartStyles.barLabel}>{item.label}</Text>
                    </View>
                );
            })}
        </View>
    );
};

export default StatisticalData;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7f7f2",
        paddingHorizontal: 16,
        paddingTop: 12
    },
    filterRow: {
        flexDirection: "row",
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 6,
        marginBottom: 14,
        elevation: 2
    },
    filterBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 16,
        alignItems: "center"
    },
    filterActive: {
        backgroundColor: "#ed8128"
    },
    filterText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#444444"
    },
    filterTextActive: {
        color: "#ffffff"
    },
    timeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18
    },
    navBtn: {
        fontSize: 22,
        fontWeight: "700",
        color: "#ed8128"
    },
    timeText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333333"
    },
    block: {
        marginBottom: 24
    },
    blockTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
        color: "#222222"
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between"
    },
    statCard: {
        width: "48%",
        backgroundColor: "#ffffff",
        padding: 18,
        borderRadius: 20,
        marginBottom: 12,
        elevation: 2
    },
    statValue: {
        fontSize: 22,
        fontWeight: "800",
        color: "#ed8128"
    },
    statLabel: {
        marginTop: 6,
        fontSize: 13,
        color: "#777777"
    },
    exerciseCard: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 22,
        flexDirection: "row",
        justifyContent: "space-between",
        elevation: 2
    },
    exerciseValue: {
        fontSize: 20,
        fontWeight: "800",
        color: "#ed8128"
    },
    exerciseLabel: {
        marginTop: 6,
        fontSize: 13,
        color: "#777777"
    }
});

const chartStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
        backgroundColor: "#ffffff",
        borderRadius: 20,
        paddingVertical: 24,
        elevation: 2
    },
    barWrapper: {
        alignItems: "center",
        width: 80
    },
    bar: {
        width: 28,
        backgroundColor: "#ed8128",
        borderRadius: 8
    },
    barValue: {
        marginTop: 6,
        fontWeight: "600",
        fontSize: 12,
        color: "#333333"
    },
    barLabel: {
        marginTop: 4,
        fontSize: 12,
        color: "#777777"
    }
});
