import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { authApis, endpoints } from "../../utils/Apis";

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

            const [profileRes, metricRes, planRes] =
                await Promise.all([
                    authApis(token).get(endpoints.health_profile),
                    authApis(token).get(endpoints.health_metrics),
                    authApis(token).get(endpoints.exercises_plans),
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

    /* ================= DATE ================= */
    const getWeekRange = () => {
        const now = new Date();
        const start = new Date(now);
        start.setDate(
            now.getDate() - now.getDay() + 1 + weekOffset * 7
        );
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return { start, end };
    };

    /* ================= FILTER ================= */
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
            return (
                d.getMonth() === month &&
                d.getFullYear() === year
            );
        });
    };

    const filteredMetrics = filterByTime(healthMetrics);
    const filteredPlans = filterByTime(exercisePlans);

    /* ================= CALCULATE ================= */
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

    /* ================= UI ================= */
    return (
        <ScrollView style={styles.container}>
            {/* FILTER */}
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

            {/* TIME CONTROL */}
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

            {/* HEALTH */}
            <View style={styles.block}>
                <Text style={styles.blockTitle}>Chỉ số sức khỏe</Text>

                <View style={styles.grid}>
                    <StatCard label="BMI" value={bmi} />
                    <StatCard label="Nước uống" value={`${totalWater} L`} />
                    <StatCard label="Bước đi" value={totalSteps} />
                    <StatCard label="Calo" value={`${totalCalories} kcal`} />
                </View>
            </View>

            {/* BAR CHART */}
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

            {/* EXERCISE */}
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

/* ================= COMPONENT ================= */
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

const PRIMARY = "#2E7D32";
const BACKGROUND = "#F4F6F8";
const CARD = "#FFFFFF";
const TEXT_SUB = "#6B7280";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND,
        padding: 16
    },
    filterRow: {
        flexDirection: "row",
        backgroundColor: CARD,
        borderRadius: 16,
        padding: 6,
        marginBottom: 12
    },
    filterBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 12,
        alignItems: "center"
    },
    filterActive: {
        backgroundColor: PRIMARY
    },
    filterText: {
        fontWeight: "600",
        color: TEXT_SUB
    },
    filterTextActive: {
        color: "#fff"
    },
    timeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16
    },
    navBtn: {
        fontSize: 20,
        color: PRIMARY,
        fontWeight: "700"
    },
    timeText: {
        fontWeight: "600"
    },
    block: {
        marginBottom: 22
    },
    blockTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between"
    },
    statCard: {
        width: "48%",
        backgroundColor: CARD,
        padding: 18,
        borderRadius: 18,
        marginBottom: 12
    },
    statValue: {
        fontSize: 22,
        fontWeight: "700",
        color: PRIMARY
    },
    statLabel: {
        marginTop: 6,
        color: TEXT_SUB
    },
    exerciseCard: {
        backgroundColor: CARD,
        borderRadius: 18,
        padding: 20,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    exerciseValue: {
        fontSize: 22,
        fontWeight: "700",
        color: PRIMARY
    },
    exerciseLabel: {
        marginTop: 4,
        color: TEXT_SUB
    }
});

/* ================= BAR CHART STYLE ================= */
const chartStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
        backgroundColor: CARD,
        borderRadius: 18,
        paddingVertical: 20
    },
    barWrapper: {
        alignItems: "center",
        width: 80
    },
    bar: {
        width: 28,
        backgroundColor: PRIMARY,
        borderRadius: 6
    },
    barValue: {
        marginTop: 6,
        fontWeight: "600",
        fontSize: 12
    },
    barLabel: {
        marginTop: 4,
        fontSize: 12,
        color: TEXT_SUB
    }
});
