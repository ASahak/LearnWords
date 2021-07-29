import React from 'react';
import {StyleSheet, Image} from 'react-native';

const Logo: React.FC<{}> = () => {
    return <Image
        resizeMode="contain"
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
    />
}
const styles = StyleSheet.create({
    logo: {
        width: 120,
        height: 60,
    },
});
export default Logo;
