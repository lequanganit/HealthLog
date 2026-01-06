import { View, Text } from "react-native";
import { Button, RadioButton } from "react-native-paper";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

const ChooseMode = () => {
    const [mode, setMode] = useState("expert");
    const nav = useNavigation();

    return (
        <View style={{ paddingTop: 50 }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>
                Chọn chế độ:
            </Text>

            <RadioButton.Group
                onValueChange={value => setMode(value)}
                value={mode}
            >
                <RadioButton.Item
                    label="Kết nối chuyên gia"
                    value="expert"
                />
                <RadioButton.Item
                    label="Theo dõi cá nhân"
                    value="personal"
                />
            </RadioButton.Group>

            <Button
                mode="contained"
                onPress={() => nav.navigate("Home")}
            >
                Test đi tiếp
            </Button>
        </View>
    );
};

export default ChooseMode;
