import React from 'react';
import Icon from 'react-native-vector-icons/AntDesign';
import IconEntypo from 'react-native-vector-icons/Entypo';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { useController } from 'react-hook-form';
import {InputProps} from '@core/models';
import { StylesConstants } from '@static/styles/StylesConstants';


const Input:React.FC<InputProps> = ({
    label,
    name,
    placeholder,
    icon,
    control,
    marginBottom,
    defaultValue,
    rules,
    inputProps,
    error,
}) => {
    const {field} = useController({
        defaultValue,
        name,
        control,
        rules,
    });

    const getIcon = () => {
        switch (icon?.type) {
            case undefined:
                return <Icon name={icon?.name || ''} style={styles.inputIcon} />
            case 'entypo':
                return <IconEntypo name={icon?.name || ''} style={styles.inputIcon} />
            default:
                return ''
        }
    }

    return (
        <View style={[styles.sectionStyle, {marginBottom: marginBottom || 40}]}>
            {label ? <Text style={[styles.inputTitle, {color: error ? 'red' : StylesConstants.MAIN_COLOR}]}>{label}</Text> : ''}
            {icon?.name && getIcon()}
            <TextInput
                style={[styles.inputStyle, {borderBottomColor: error ? 'red' : '#c6c6ca', paddingLeft: icon ? 30 : 0}]}
                placeholder={placeholder}
                placeholderTextColor="#ccc"
                autoCapitalize="none"
                returnKeyType="next"
                onChangeText={field.onChange}
                value={field.value}
                {...inputProps}
            />
            <Text style={styles.errorMsg}>{error}</Text>
        </View>
    )
}
const styles = StyleSheet.create({
    sectionStyle: {
        flexDirection: 'row',
        position: 'relative',
        alignItems: 'center',
    },
    inputTitle: {
        position: 'absolute',
        top: -12,
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
        borderWidth: 2,
        borderTopColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },
    errorMsg: {
        position: 'absolute',
        bottom: -18,
        fontSize: 11,
        color: 'red',
    },
    button: {
        color: '#fff',
        textAlign: 'center',
        padding: 10,
        marginTop: 20,
        marginBottom: 20,
    },
});

export default React.memo(Input);
