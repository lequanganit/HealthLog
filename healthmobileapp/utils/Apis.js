import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = 'http://10.106.121.88:8000/';
// const BASE_URL = 'http://192.168.1.5:8000/';

export const endpoints = {
    'register': '/users/',
    'login': '/o/token/',
    'current-user': '/users/current-user/',
    'exercises':'/exercises/',
    'exercises_plans':'/exercises_plans/',
    'add_exercise_to_plan': (planId) => `/exercises_plans/${planId}/exercises/`,
    'health_journals': '/HealthJournal/',
    'health_profile': '/healthprofiles/',
    'health_metrics': '/health_metrics/',
};

export const authApis = (token) => {
    console.log(token);
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}

export default axios.create({
    baseURL: BASE_URL
});