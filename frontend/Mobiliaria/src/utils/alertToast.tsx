import { Alert, AlertButton, AlertOptions } from "react-native";
import Toast from 'react-native-toast-message';

export const alert = (title: string, message: string, buttons: AlertButton[], options?: AlertOptions) => {
    Alert.alert(title, message, buttons, options);
}

export const toast = (principal: string, secondary: string, type = 'success') => {
    console.log('toast');
    
    Toast.show({
        type: type,
        text1: principal,
        text2: secondary
    });
}