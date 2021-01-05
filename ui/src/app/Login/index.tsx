import {useMutation} from '@apollo/client';
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
import {useDispatch} from 'react-redux';
import CREATE_PROFILE from '../../graphql/profile/mutations/createProfile.mutation';
import {setProfile} from '../../redux/profile/actions';
import {isUsernameFormatValid} from '../../utils/regex';
import {Profile} from '../../utils/types';

const Login = () => {
  const [username, setUsername] = useState('');
  const [isValid, setIsValid] = useState(false);
  const dispatch = useDispatch();
  const headerHeight = useHeaderHeight();

  const [createProfile] = useMutation(CREATE_PROFILE, {
    onCompleted: (data: Profile) => {
      console.log('Completed: ');
      console.log(data);
      if (data) {
        console.log('User created');
        dispatch(setProfile(data));
      } else {
        /**
         * Handle error: Username already taken
         */
        console.log('Username taken');
      }
    },
  });

  const handleOnPress = () => createProfile({variables: {username}});

  return (
    <SafeAreaView style={styles.sav}>
      <KeyboardAvoidingView
        keyboardVerticalOffset={headerHeight}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.header}>Login to {'<app-name>'}</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={(text) => {
              setIsValid(isUsernameFormatValid(text) && text.trim().length > 0);
              setUsername(text);
            }}
            placeholder="Username"
          />
        </View>
        <TouchableOpacity
          disabled={!isValid}
          onPress={handleOnPress}
          style={[styles.button, isValid ? styles.active : styles.disabled]}>
          <Text style={styles.text}>Let's Go</Text>
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
  header: {
    fontSize: 35,
    fontWeight: 'bold',
  },
  active: {
    backgroundColor: '#ff8000',
  },
  disabled: {
    backgroundColor: 'rgb(210,210,210)',
  },
  input: {
    // textAlign: 'center',
    borderBottomColor: 'rgba(0,0,0,.1)',
    fontSize: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 15,
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

export default Login;
