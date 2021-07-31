/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, DeviceEventEmitter } from 'react-native';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { User } from '@core/models';
import Toast from 'react-native-toast-message';
import Home from '@screens/Home';
import AddWord from '@screens/AddWord';
import AddGroup from '@screens/AddGroup';
import { Login, Register, ForgotPassword } from '@screens/Entry';
import Header from '@navigation/header';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import Firebase from '@services/Firebase';
import { Globals } from '@core/enums';

let onGroups: any;
let onUser: any;
let onRefresh: any;
let onIndicator: any;
const App = () => {
  const [lang, setLang] = useState<string>(Globals.lang);
  const [loggedUsed, setLoggedUser] = useState<User | null | string>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [indicator, setIndicator] = useState<boolean>(false);
  const [hardRefresh, setHardRefresh] = useState<boolean>(true);

  const emitLangChange = (lang: string) => {
    setTimeout(() => {
      setLang(lang);
      setHardRefresh(prevState => !prevState);
    }, 200);
  };

  useEffect(() => {
    onUser = DeviceEventEmitter.addListener('userEmit', data => {
      if (!data) {
        setLoggedUser('not-logged');
        setHardRefresh(prevState => !prevState);
      } else {
        setLoggedUser(data);
      }
    });
    onGroups = DeviceEventEmitter.addListener('groupsEmit', data =>
      setGroups(data),
    );
    onIndicator = DeviceEventEmitter.addListener('loadingEmit', data =>
      setIndicator(data),
    );
    onRefresh = DeviceEventEmitter.addListener('hardRefresh', () => {
      setTimeout(() => {
        setLang(Globals.lang);
        setHardRefresh(prevState => !prevState);
      }, 2000);
    });

    (async () => {
      try {
        const data = await Firebase.getLoggedUser();
        if (data) {
          setLoggedUser(data as User);
        } else setLoggedUser('not-logged');
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      onIndicator?.remove();
      onUser?.remove();
      onGroups?.remove();
      onRefresh?.remove();
    };
  }, []);

  const Stack = createStackNavigator();
  return (
    <NavigationContainer key={Number(hardRefresh)}>
      <PaperProvider
        theme={{
          ...DefaultTheme,
        }}
      >
        {loggedUsed === 'not-logged' ||
        (loggedUsed && loggedUsed !== 'not-logged') ? (
          <SafeAreaProvider
            style={styles.sectionContainer}
            initialMetrics={initialWindowMetrics}
          >
            <Stack.Navigator>
              {loggedUsed &&
              loggedUsed !== 'not-logged' &&
              typeof loggedUsed === 'object' ? (
                <>
                  <Stack.Screen
                    name="home"
                    component={Home}
                    initialParams={{ userId: loggedUsed.uid, lang }}
                    options={{
                      title: 'Login',
                      header: props => (
                        <Header
                          {...{
                            indicator,
                            emitLangChange,
                            lang,
                            previous: props.previous,
                            navigation: props.navigation,
                            user: loggedUsed,
                          }}
                        />
                      ),
                    }}
                  />
                  <Stack.Screen
                    initialParams={{ lang, userId: loggedUsed.uid, groups }}
                    name="add-word"
                    component={AddWord}
                    options={{
                      headerTitle: 'Add Word',
                    }}
                  />
                  <Stack.Screen
                    initialParams={{ lang, userId: loggedUsed.uid }}
                    name="add-group"
                    component={AddGroup}
                    options={{
                      headerTitle: 'Add Group',
                    }}
                  />
                </>
              ) : loggedUsed === 'not-logged' ? (
                <>
                  <Stack.Screen
                    name="login"
                    component={Login}
                    options={{
                      headerTitle: 'Sign In',
                    }}
                  />
                  <Stack.Screen
                    name="forgot-password"
                    component={ForgotPassword}
                    options={{
                      headerTitle: 'Forgot Password',
                    }}
                  />
                  <Stack.Screen
                    name="register"
                    component={Register}
                    options={{
                      headerTitle: 'Sign Up',
                    }}
                  />
                </>
              ) : null}
            </Stack.Navigator>
            <Toast
              ref={ref => Toast.setRef(ref)}
              bottomOffset={30}
              autoHide
              visibilityTime={3000}
            />
          </SafeAreaProvider>
        ) : null}
      </PaperProvider>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
