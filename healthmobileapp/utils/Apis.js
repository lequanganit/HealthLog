import axios from "axios";

const BASE_URL = 'http://192.168.1.16:8000/';
// const BASE_URL = 'http://192.168.1.5:8000/';

export const endpoints = {
    'register': '/users/',
    'login': '/o/token/',
    'current-user': '/users/current-user/',
    'exercises': '/exercises/',
    'exercises_plans': '/exercises_plans/',
    'add_exercise_to_plan': (planId) => `/exercises_plans/${planId}/exercises/`,
    'health_journals': '/HealthJournal/',
    'health_profile': '/healthprofiles/',
    'health_metrics': '/health_metrics/',
    'exercises_plan_detail': (id) => `/exercises_plans/${id}/`,
    'reminders': '/reminders/',
    'experts': '/experts/',
    'connections': '/connections/',


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