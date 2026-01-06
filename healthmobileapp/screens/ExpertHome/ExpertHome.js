import { View, Text, Button } from "react-native";
import { useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyUserContext } from "../../utils/MyContexts";
import MyStyles from "../../styles/MyStyles";
import { useNavigation } from "@react-navigation/native";

const ExpertHome = () => {
    const [user, dispatch] = useContext(MyUserContext);
    const navigation = useNavigation();

    const logout = async () => {
        await AsyncStorage.removeItem("token");

        dispatch({
            type: "logout",
        });

        navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
        });
    };

    return (
        <View style={MyStyles.padding}>
            <Text style={MyStyles.title}>EXPERT HOME</Text>

            <Text style={{ marginBottom: 10 }}>
                Xin chào chuyên gia 👋
            </Text>

            <Text style={{ marginBottom: 20 }}>
                Username: {user?.username}
            </Text>

            <Button title="Đăng xuất" onPress={logout} />
        </View>
    );
};

export default ExpertHome;
