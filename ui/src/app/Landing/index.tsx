import {StackNavigationProp} from '@react-navigation/stack';
import React from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import {Unauthenticated} from '../../navigators/screenNames';
import {UnauthenticatedStackList} from '../../utils/types';
type LandingNavigationProp = StackNavigationProp<
  UnauthenticatedStackList,
  Unauthenticated.LANDING
>;

type Props = {
  navigation: LandingNavigationProp;
};
const Landing: React.FC<Props> = ({navigation}) => {
  const navigate = (screen: string) => navigation.navigate(screen);
  return (
    <SafeAreaView style={styles.sav}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{'<app-name>'}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => navigate(Unauthenticated.LOGIN)}
            style={styles.button}>
            <Text style={styles.text}>Start Messaging</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => navigate(Unauthenticated.REGISTER)}>
            <Text>Don't have an account?</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sav: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 15,
  },
  title: {
    fontSize: 30,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 15,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#ff8000',
  },
  text: {
    color: 'white',
  },
});

export default Landing;
