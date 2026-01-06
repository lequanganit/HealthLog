import { View, Button } from "react-native";
import { useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyUserContext } from "../../utils/MyContexts";

const Logout = ({ navigation }) => {
    const [, dispatch] = useContext(MyUserContext);

    const logout = async () => {
        await AsyncStorage.removeItem("token");
        dispatch({ type: "logout" });

        navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
        });
    };

    return (
        <View>
            <Button title="Đăng xuất" onPress={logout} />
        </View>
    );
};

export default Logout;
