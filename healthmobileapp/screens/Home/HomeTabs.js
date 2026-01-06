import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./Home";
import HealthProfile from "../HealthProfile/HealthProfile";
import ExercisePlan from "../ExercisePlan/ExercisePlan";
import Exercise from "../Exercise/Exercise";
import Reminder from "../Reminder/Reminder";
import Logout from "../User/Logout";
import { Icon } from 'react-native-paper';
const Tab = createBottomTabNavigator();

const HomeTabs = () => {
    return (
        <Tab.Navigator screenOptions={{ headerShown: true }}>
            <Tab.Screen
                name="Home"
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
                component={ExercisePlan}
                options={{ title: "Kế hoạch tập luyện", tabBarIcon: () => <Icon source="calendar-text-outline" size={30} color="blue" />  }}
            />
            <Tab.Screen
                name="Bài tập"
                component={Exercise}
                options={{ title: "Bài tập", tabBarIcon: () => <Icon source="calendar-edit-outline" size={30} color="blue" />  }}
            />
            <Tab.Screen
                name="Nhắc nhở"
                component={Reminder}
                options={{ title: "Nhắc nhở", tabBarIcon: () => <Icon source="alarm-note" size={30} color="blue" />  }}
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
