import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useReducer } from "react";

import Welcome from './screens/Welcome/Welcome';
import Login from './screens/User/Login';
import Register from './screens/User/Register';
import ExpertHome from './screens/ExpertHome/ExpertHome';
import ChooseMode from './screens/ChooseMode/ChooseMode';
import ExercisePlanDetail from './components/ExercisePlanDetail';



import { MyUserContext } from "./utils/MyContexts";
import MyUserReducer from "./reducers/MyUserReducer";
import HomeTabs from "./screens/Home/HomeTabs";
const Stack = createNativeStackNavigator();

export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={[user, dispatch]}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="ExpertHome" component={ExpertHome} />
          <Stack.Screen name="ChooseMode" component={ChooseMode} />
          <Stack.Screen name="Home" component={HomeTabs} />
          <Stack.Screen name="ExercisePlanDetail" component={ExercisePlanDetail} />


        </Stack.Navigator>
      </NavigationContainer>
    </MyUserContext.Provider>
  );
}
