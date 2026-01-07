import { View, Text, Image } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { Button, HelperText, TextInput } from "react-native-paper";
import { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Apis, { authApis, endpoints } from "../../utils/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyUserContext } from "../../utils/MyContexts";

const Login = ({route}) => {
    const info = [{
        "label": "Tên đăng nhập",
        "field": "username",
        "icon": "account"
    }, {
        "label": "Mật khẩu",
        "field": "password",
        "icon": "eye",
        "secureTextEntry": true
    }];

    const [user, setUser] = useState({});
    const [errMsg, setErrMsg] = useState();
    const [loading, setLoading] = useState(false);
    const nav = useNavigation();
    const [,dispatch] = useContext(MyUserContext);

    const validate = () => {
        if (!user.username) {
            setErrMsg("Vui lòng nhập username!");
            return false;
        }
        if (!user.password) {
            setErrMsg("Vui lòng nhập password!");
            return false;
        }

        setErrMsg(null);

        return true;
    }

    const login = async () => {
        if (!validate()) return;

        try {
            setLoading(true);

    const data = new URLSearchParams();
    data.append("username", user.username);
    data.append("password", user.password);
    data.append("client_id", "fxGJPzHmHiVphQSJ0eTviLBz5UCiVP4qUUSathjL");
    data.append("client_secret", "8OvvDFiwi8kHteejHqkGrYKKL9Yz8K7ji9FLqfad4yGdad4tOv1n4txYwRgRTvWjjzbSDGKrLSNsBqodL23SlRJN0S2DbJpVw3i3FdeALo00uZRa2Qmc18521KMwImXK");
    data.append("grant_type", "password");

    const res = await Apis.post(endpoints['login'], data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    console.log("TOKEN:", res.data);

    await AsyncStorage.setItem("access_token", res.data.access_token);

    await AsyncStorage.setItem("refresh_token", res.data.refresh_token);

    const u = await authApis(res.data.access_token)
      .get(endpoints['current-user']);

    dispatch({
      type: "login",
      payload: u.data
    });

    nav.navigate("ChooseMode");

    } catch (err) {
        console.log("LOGIN ERROR:", err.response?.data);
        setErrMsg("Sai tài khoản hoặc mật khẩu!");
    } finally {
        setLoading(false);
    }
    };

    return (
        <View style={MyStyles.padding}>
            <Text style={MyStyles.title}>ĐĂNG NHẬP NGƯỜI DÙNG</Text>

            <HelperText type="error" visible={errMsg}>
                {errMsg}
            </HelperText>

            {info.map(i => <TextInput key={i.field} style={MyStyles.margin}
                            label={i.label}
                            secureTextEntry={i.secureTextEntry}
                            right={<TextInput.Icon icon={i.icon} />}
                            value={user[i.field]}
                            onChangeText={t => setUser({...user, [i.field]: t})} />)}

          
            {user.avatar && <Image  source={{uri: user.avatar.uri}} width={250} style={[MyStyles.avatar, MyStyles.margin]} />}

            <Button loading={loading} disabled={loading} mode="contained" icon="account" onPress={login}>Đăng nhập</Button>

        </View>
    );
}

export default Login;