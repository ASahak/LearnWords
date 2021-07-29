import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import Firebase from '@services/Firebase';
import VALIDATORS from '@utils/validators';
import { ifFormIsValid } from '@utils/handlers';
import UI from '@components/shared/UI';
import { LoginInputs, User } from '@core/models';
import { StylesConstants } from '@static/styles/StylesConstants';

interface UserData {
  error?: undefined | { msg: string; type: string };
  user?: User;
}

const Login: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { handleSubmit, control, formState, getValues, reset } =
    useForm<LoginInputs>({
      mode: 'onChange',
    });

  const onSubmitLogin = async (data: LoginInputs) => {
    try {
      setIsLoading(true);
      const userData: UserData = await Firebase.loginUser(
        data.email,
        data.password,
      );
      reset();
      if (userData?.error) {
        setIsLoading(false);
        Toast.show({
          type: userData.error.type,
          text2: userData.error.msg,
        });
      } else {
        setIsLoading(false);
        await DeviceEventEmitter.emit('userEmit', userData.user);
        navigation.navigate('home', {
          getNewly: true,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setIsValidForm(
      ifFormIsValid(['email', 'password'], getValues(), formState.errors),
    );
  }, [getValues, formState]);

  return (
    <View style={styles.mainBody}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={{ ...styles.welcomeView }}>
          <Text style={styles.welcomeTxt}>Welcome back</Text>
          <Text style={styles.signToContinue}>Sign in to continue</Text>
        </View>
        <View>
          <KeyboardAvoidingView enabled behavior="padding">
            <Icon name="user" style={{ ...styles.formIcon }} />
            <UI.Input
              icon={{ name: 'email', type: 'entypo' }}
              label="E-mail"
              control={control}
              error={formState.errors?.email?.message}
              rules={VALIDATORS.EMAIL_VALIDATOR}
              name="email"
              placeholder="Type your email"
              inputProps={{ keyboardType: 'email-address' }}
            />
            <UI.Input
              icon={{ name: 'lock' }}
              label="Password"
              control={control}
              error={formState.errors?.password?.message}
              rules={VALIDATORS.PASSWORD_VALIDATOR}
              name="password"
              placeholder="Type your password"
              inputProps={{ keyboardType: 'default', secureTextEntry: true }}
            />
            {!isLoading ? (
              <TouchableOpacity
                onPress={handleSubmit(onSubmitLogin)}
                disabled={!isValidForm}
              >
                <Text
                  style={[
                    styles.button,
                    {
                      backgroundColor: isValidForm
                        ? StylesConstants.MAIN_COLOR
                        : StylesConstants.BTN_DISABLE_COLOR,
                    },
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.indicatorBtn,
                  {
                    backgroundColor: isValidForm
                      ? StylesConstants.MAIN_COLOR
                      : StylesConstants.BTN_DISABLE_COLOR,
                  },
                ]}
              >
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
            <Text
              style={styles.forgotStyle}
              onPress={() => navigation.navigate('forgot-password')}
            >
              Forgot password?
            </Text>
            <View style={styles.dontHaveAnAccount}>
              <Text style={styles.accountQuestionTxt}>
                Don't have an account?
              </Text>
              <Text
                style={styles.signUpBtn}
                onPress={() => navigation.navigate('register')}
              >
                Sign up
              </Text>
            </View>
          </KeyboardAvoidingView>
        </View>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  welcomeView: {
    marginTop: 50,
    marginBottom: 100,
  },
  welcomeTxt: {
    fontSize: 30,
    fontWeight: 'bold',
    color: StylesConstants.MAIN_COLOR,
  },
  signToContinue: {
    fontSize: 12,
    color: '#888484',
  },
  logoContent: {
    height: 150,
    backgroundColor: '#8c928d',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  mainBody: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    marginLeft: 35,
    marginRight: 35,
  },
  formIcon: {
    textAlign: 'center',
    fontSize: 50,
    marginBottom: 30,
    fontWeight: 'bold',
    color: StylesConstants.MAIN_COLOR,
  },
  sectionStyle: {
    flexDirection: 'row',
    marginTop: 30,
    marginBottom: 10,
    position: 'relative',
    alignItems: 'center',
  },
  inputTitle: {
    position: 'absolute',
    top: -12,
    color: StylesConstants.MAIN_COLOR,
    fontSize: 12,
  },
  inputIcon: {
    position: 'absolute',
    left: 0,
    fontSize: 17,
    color: '#ccc',
  },
  inputStyle: {
    flex: 1,
    color: '#000',
    paddingLeft: 30,
    borderWidth: 2,
    borderBottomColor: '#c6c6ca',
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  forgotStyle: {
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 5,
  },
  button: {
    color: '#fff',
    textAlign: 'center',
    alignItems: 'center',
    textAlignVertical: 'center',
    backgroundColor: StylesConstants.MAIN_COLOR,
    padding: 10,
    height: 45,
    marginBottom: 20,
  },
  indicatorBtn: {
    marginBottom: 20,
    height: 45,
    backgroundColor: StylesConstants.MAIN_COLOR,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dontHaveAnAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpBtn: {
    color: '#888484',
    marginLeft: 10,
    fontSize: 13,
  },
  accountQuestionTxt: {
    fontSize: 13,
  },
});
export default Login;
