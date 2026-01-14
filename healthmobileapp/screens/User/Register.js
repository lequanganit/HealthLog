import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { Button, HelperText, TextInput } from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import Apis, { endpoints } from "../../utils/Apis";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

const Register = () => {
    const info = [{
        title: "Tên",
        field: "first_name",
        icon: "text"
    }, {
        title: "Họ và tên lót",
        field: "last_name",
        icon: "text"
    }, {
        title: "Tên đăng nhập",
        field: "username",
        icon: "account"
    }, {
        title: "Mật khẩu",
        field: "password",
        icon: "eye",
        secureTextEntry: true
    }, {
        title: "Xác nhận mật khẩu",
        field: "confirm",
        icon: "eye",
        secureTextEntry: true
    }, {
        title: "Email",
        field: "email",
        icon: "email"
    }];

    const [user, setUser] = useState({ role: "USER" });
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigation();
    const roles = [
        { label: "Người dùng", value: "USER" },
        { label: "Chuyên gia", value: "EXPERT" }
    ];
    const pickImage = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert("Permissions denied!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled) {
                setUser({ ...user, "avatar": result.assets[0] })
            }
        }
    }

    const validate = () => {
        if (!user.password || user.password !== user.confirm) {
            setErr(true)
            return false;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(user.password)) {
            setErr(
                "Mật khẩu phải ≥ 8 ký tự, gồm chữ thường, chữ hoa, số và ký tự đặc biệt!"
            );
            return false;
        }
        setErr(false);
        return true;
    }

    const register = async () => {
        if (!validate()) return;

        try {
            setLoading(true);

            let form = new FormData();
            for (let key in user) {
                if (key !== "confirm") {
                    if (key === "avatar") {
                        form.append("avatar", {
                            uri: user.avatar.uri,
                            name: "avatar.jpg",
                            type: "image/jpeg",
                        });
                    } else {
                        form.append(key, user[key]);
                    }
                }
            }

            const resUser = await Apis.post(
                endpoints["register"],
                form,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            const createdUser = resUser.data;
            console.log("USER CREATED:", createdUser);

            if (createdUser.role === "EXPERT") {
                const resExpert = await Apis.post(
                    endpoints["experts"],
                    { user: createdUser.id }
                );

                console.log("EXPERT CREATED:", resExpert.data);
            }

            nav.navigate("Login");

        } catch (err) {
            console.error("REGISTER ERROR:", err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={MyStyles.padding}>
            <Text style={MyStyles.title}>ĐĂNG KÝ NGƯỜI DÙNG</Text>
            <ScrollView>
                <HelperText type="error" visible={!!err}>
                    {err}
                </HelperText>

                {info.map(i => <TextInput key={i.field} style={MyStyles.margin} value={user[i.field]} onChangeText={(t) => setUser({ ...user, [i.field]: t })}
                    label={i.title}
                    secureTextEntry={i.secureTextEntry}
                    right={<TextInput.Icon icon={i.icon} />}
                />)}

                <Text style={MyStyles.margin}>Vai trò</Text>
                <View
                    style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 10 }}
                >
                    <Picker selectedValue={user.role} onValueChange={(value) => setUser({ ...user, role: value })}>
                        {roles.map(r => (
                            <Picker.Item
                                key={r.value}
                                label={r.label}
                                value={r.value}
                            />
                        ))}
                    </Picker>
                </View>

                <TouchableOpacity style={MyStyles.margin} onPress={pickImage}>
                    <Text>Chọn ảnh đại diện...</Text>
                </TouchableOpacity>

                {user.avatar && <Image source={{ uri: user.avatar.uri }} style={MyStyles.avatar} />}

                <Button loading={loading} disabled={loading} style={MyStyles.margin} icon="account" mode="contained" onPress={register}>
                    Đăng ký
                </Button>

            </ScrollView>
        </View>
    );
}

export default Register;