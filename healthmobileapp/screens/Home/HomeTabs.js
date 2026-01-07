import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./Home";
import HealthProfile from "../HealthProfile/HealthProfile";
import ExercisePlanScreen from "../ExercisePlan/ExercisePlanScreen";
import ExerciseScreen from "../Exercise/ExerciseScreen";
import Reminder from "../Reminder/Reminder";
import HealthJournal from "../HealthJournal/HealthJournal";
import Logout from "../User/Logout";
import { Icon } from 'react-native-paper';
const Tab = createBottomTabNavigator();

const HomeTabs = () => {
    return (
        <Tab.Navigator screenOptions={{ headerShown: true }}>
            <Tab.Screen
                name="HomeTab"
                component={Home}
                options={{ title: "Trang chủ", tabBarIcon: () => <Icon source="home" size={30} color="blue" /> }}
            />

            <Tab.Screen
                name="Hồ sơ sức khỏe"
                component={HealthProfile}
                options={{ title: "Hồ sơ sức khỏe" , tabBarIcon: () => <Icon source="account-heart-outline" size={30} color="blue" /> }}
            />
            <Tab.Screen
                name="Kế hoạch tập luyện"
                component={ExercisePlanScreen}
                options={{ title: "Kế hoạch tập luyện", tabBarIcon: () => <Icon source="calendar-text-outline" size={30} color="blue" />  }}
            />
            <Tab.Screen
                name="Bài tập"
                component={ExerciseScreen}
                options={{ title: "Bài tập", tabBarIcon: () => <Icon source="calendar-edit-outline" size={30} color="blue" />  }}
            />
            <Tab.Screen
                name="Nhắc nhở"
                component={Reminder}
                options={{ title: "Nhắc nhở", tabBarIcon: () => <Icon source="alarm-note" size={30} color="blue" />  }}
            />
            <Tab.Screen
                name="Nhật kí sức khỏe"
                component={HealthJournal}
                options={{ title: "Nhật kí sức khỏe", tabBarIcon: () => <Icon source="pen" size={30} color="blue" />  }}
            />
            <Tab.Screen
                name="Logout"
                component={Logout}
                options={{ title: "Đăng xuất", tabBarIcon: () => <Icon source="logout" size={30} color="blue" />  }}
            />

        </Tab.Navigator>
    );
};

export default HomeTabs;
