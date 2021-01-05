import {useHeaderHeight} from '@react-navigation/stack';
import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {isUsernameFormatValid} from '../../utils/regex';

const Register = () => {
  const [username, setUsername] = useState('');
  const [isValid, setIsValid] = useState(false);
  const headerHeight = useHeaderHeight();

  const handleOnPress = () => {};

  return (
    <SafeAreaView style={styles.sav}>
      <KeyboardAvoidingView
        keyboardVerticalOffset={headerHeight}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.header}>Create your account</Text>
          <TextInput
            value={username}
            onChangeText={(text) => {
              setIsValid(isUsernameFormatValid(text) && text.trim().length > 0);
              setUsername(text);
            }}
            style={styles.input}
            placeholder="Choose your username"
          />
        </View>
        <TouchableOpacity
          disabled={!isValid}
          onPress={handleOnPress}
          style={[styles.button, isValid ? styles.active : styles.disabled]}>
          <Text style={styles.text}>Start messaging</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sav: {
    flex: 1,
    backgroundColor: 'white',
  },
  active: {
    backgroundColor: '#ff8000',
  },
  disabled: {
    backgroundColor: 'rgb(210,210,210)',
  },
  header: {
    fontSize: 35,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 15,
  },
  input: {
    // textAlign: 'center',
    borderBottomColor: 'rgba(0,0,0,.1)',
    paddingVertical: 10,
    fontSize: 18,
    borderBottomWidth: 1,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 15,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  text: {
    color: 'white',
  },
});

export default Register;
