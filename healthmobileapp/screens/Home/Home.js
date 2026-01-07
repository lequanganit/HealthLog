import { View, Text, Button } from "react-native";
import { useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { MyUserContext } from "../../utils/MyContexts";
import MyStyles from "../../styles/MyStyles";

const Home = ({ navigation }) => {
    const [user, dispatch] = useContext(MyUserContext);

    const logout = async () => {
        await AsyncStorage.removeItem("token");
        dispatch({ type: "logout" });

        navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
        });
    };

    return (
        <View style={MyStyles.padding}>
            <Text style={MyStyles.title}>HOME</Text>

            <Text>Xin chào: {user?.username}</Text>
            <Text>Role: {user?.role}</Text>

            <Button title="Đăng xuất" onPress={logout} />
        </View>
    );
};

export default Home;