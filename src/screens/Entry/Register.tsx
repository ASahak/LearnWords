import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    TouchableOpacity,
    ActivityIndicator
} from "react-native";
import { useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { useHeaderHeight } from '@react-navigation/stack';
import {RegisterInputs} from '@core/models';
import Firebase from '@services/Firebase';
import VALIDATORS from '@utils/validators';
import { ifFormIsValid } from '@utils/handlers';
import UI from '@components/shared/UI';
import { StylesConstants } from '@static/styles/StylesConstants';

const Register: React.FC<{navigation: any}> = ({navigation}) => {
    const headerHeight = useHeaderHeight();
    const [isValidForm, setIsValidForm] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { handleSubmit, watch, control, formState, getValues, reset } = useForm<RegisterInputs>({
        mode: 'onChange',
    });

    const onSubmitRegister = async (data: RegisterInputs) => {
        try {
            setIsLoading(true);
            const {msg, type} = await Firebase.registerUser(data.email, data.password, data.username);
            reset();
            setIsLoading(false);
            Toast.show({
                type,
                text2: msg,
                autoHide: true,
                visibilityTime: 3000,
                topOffset: headerHeight,
                onHide: () => {
                    if (type === 'success') {
                        navigation.navigate('login');
                    }
                }
            })
        } catch (err) {
            console.error(err)
        }
    };

    useEffect(() => {
        setIsValidForm(ifFormIsValid(['email', 'username', 'password', 'confirm_password'], getValues(), formState.errors))
    }, [formState])

    const password = useRef({});
    password.current = watch('password', '');
    return (
        <View style={styles.mainBody}>
            <ScrollView>
                    <View style={{...styles.createTitleView, marginBottom: 70}}>
                        <Text style={styles.createTxt}>Create an account</Text>
                        <Text style={styles.createToContinue}>Create to make your life easy</Text>
                    </View>
                    <KeyboardAvoidingView
                        behavior="padding">
                        <UI.Input
                            icon={{name: 'user'}}
                            label="Username"
                            control={control}
                            error={formState.errors.username?.message}
                            rules={VALIDATORS.FULL_NAME_VALIDATOR}
                            name="username"
                            placeholder="Type your username"
                            inputProps={{keyboardType: 'default'}}
                        />
                        <UI.Input
                            icon={{name: 'email', type: 'entypo'}}
                            label="E-mail"
                            control={control}
                            error={formState.errors?.email?.message}
                            rules={VALIDATORS.EMAIL_VALIDATOR}
                            name="email"
                            placeholder="Type your email"
                            inputProps={{keyboardType: 'email-address'}}
                        />
                        <UI.Input
                            icon={{name: 'lock'}}
                            label="Password"
                            control={control}
                            error={formState.errors?.password?.message}
                            rules={VALIDATORS.PASSWORD_VALIDATOR}
                            name="password"
                            placeholder="Type your password"
                            inputProps={{keyboardType: 'default', secureTextEntry: true,}}
                        />
                        <UI.Input
                            icon={{name: 'lock'}}
                            label="Confirm Password"
                            control={control}
                            error={formState.errors?.confirm_password?.message}
                            rules={{
                                ...VALIDATORS.PASSWORD_VALIDATOR,
                                validate: (value: string) => value === password.current || 'The passwords do not match'
                            }}
                            name="confirm_password"
                            placeholder="Repeat password"
                            inputProps={{keyboardType: 'default', secureTextEntry: true,}}
                        />
                        {!isLoading ? <TouchableOpacity onPress={handleSubmit(onSubmitRegister)} disabled={!isValidForm}>
                            <Text style={[styles.button, {backgroundColor: isValidForm ? StylesConstants.MAIN_COLOR : StylesConstants.BTN_DISABLE_COLOR}]}>Sign Up</Text>
                        </TouchableOpacity> : <View style={[styles.indicatorBtn, {backgroundColor: isValidForm ? StylesConstants.MAIN_COLOR : StylesConstants.BTN_DISABLE_COLOR}]}>
                            <ActivityIndicator size="small" color="#fff" />
                        </View>}
                        <View style={styles.haveAnAccount}>
                            <Text style={styles.accountQuestionTxt}>Have an account?</Text>
                            <Text style={styles.signUpBtn} onPress={() => navigation.navigate('login')}>Sign In</Text>
                        </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </View>
    )
}
const styles = StyleSheet.create({
    mainBody: {
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'flex-start',
        alignContent: 'flex-start',
        marginLeft: 35,
        marginRight: 35,
    },
    createTitleView: {
        marginTop: 50,
    },
    createTxt: {
        fontSize: 30,
        fontWeight: 'bold',
        color: StylesConstants.MAIN_COLOR,
    },
    createToContinue: {
        fontSize: 12,
        color: '#888484',
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
        fontSize: 12
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
    button: {
        color: '#fff',
        textAlign: 'center',
        padding: 10,
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
    haveAnAccount: {
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
    }
})
export default Register;
