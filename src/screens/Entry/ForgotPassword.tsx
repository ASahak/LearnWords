import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import Firebase from '@services/Firebase';
import VALIDATORS from '@utils/validators';
import { ifFormIsValid } from '@utils/handlers';
import UI from '@components/shared/UI';
import Icon from 'react-native-vector-icons/AntDesign';
import { StylesConstants } from '@static/styles/StylesConstants';

interface EmailProp {
    email: string,
}
const ForgotPassword:React.FC<{navigation: any}> = ({navigation}) => {
    const [isValidForm, setIsValidForm] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { handleSubmit, control, formState, getValues, reset } = useForm<EmailProp>({
        mode: 'onChange',
    });

    const onSubmitReset = async (data: EmailProp) => {
        const { email } = data;
        setIsLoading(true);
        try {
            await Firebase.passwordReset(email);
            reset();
            setIsLoading(false);
            Toast.show({
                type: 'success',
                text2: 'Password reset email sent successfully',
            });
            navigation.navigate('login')
        } catch (error) {
            reset();
            setIsLoading(false);
            Toast.show({
                type: 'error',
                text2: error.message,
            })
        }
    }

    useEffect(() => {
        setIsValidForm(ifFormIsValid(['email'], getValues(), formState.errors))
    }, [formState])

    return (
        <View style={styles.mainBody}>
            <ScrollView
                keyboardShouldPersistTaps="handled">
                <View style={{...styles.welcomeView}}>
                    <Text style={styles.welcomeTxt}>Reset Password</Text>
                    <Text style={styles.signToContinue}>Send your email for reset!</Text>
                </View>
                <View>
                    <KeyboardAvoidingView enabled behavior="padding">
                        <Icon name="user" style={{...styles.formIcon}}/>
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
                        {!isLoading ? <TouchableOpacity onPress={handleSubmit(onSubmitReset)} disabled={!isValidForm}>
                            <Text style={[styles.button, {backgroundColor: isValidForm ? StylesConstants.MAIN_COLOR : StylesConstants.BTN_DISABLE_COLOR}]}>Sign In</Text>
                        </TouchableOpacity> : <View style={[styles.indicatorBtn, {backgroundColor: isValidForm ? StylesConstants.MAIN_COLOR : StylesConstants.BTN_DISABLE_COLOR}]}>
                            <ActivityIndicator size="small" color="#fff" />
                        </View>}
                    </KeyboardAvoidingView>
                </View>
            </ScrollView>
        </View>
    )
}

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
})
export default ForgotPassword
