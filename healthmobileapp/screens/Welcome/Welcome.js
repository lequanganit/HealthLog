import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './Styles';

const Welcome = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>

      <Image
        source={require('../../assets/health1.png')}
        style={styles.image}
      />


      <Text style={styles.title}>HealthCare</Text>
      <Text style={styles.subtitle}>
        Theo dõi sức khỏe • Luyện tập • Dinh dưỡng
      </Text>


      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.primaryText}>Đăng nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.secondaryText}>Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Welcome;

