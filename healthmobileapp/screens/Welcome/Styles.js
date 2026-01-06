import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  image: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    marginBottom: 30
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center'
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#1E88E5',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButton: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#1E88E5',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center'
  },
  secondaryText: {
    color: '#1E88E5',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default styles;
