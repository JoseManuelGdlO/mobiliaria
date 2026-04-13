import React, { useEffect } from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import _styles from "./styles";
import { useTheme } from "@hooks/useTheme";
import ArrobaIcon from "@assets/images/icons/ArrobaIcon";
import Candado from "@assets/images/icons/Candado";
import { toast } from "@utils/alertToast";
import Toast from "react-native-toast-message";
import Loading from "@components/loading";
import * as authService from "../../services/auth";
import { useDispatch } from "react-redux";
import {
  rememberUser,
  setLoginData,
  updateToken,
} from "@redux/actions/userAction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageKeysEnum } from "@interfaces/auth";
import Geolocation from "@react-native-community/geolocation";

const Login = (): JSX.Element => {
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [toggleSwitch, setToggleSwitch] = React.useState(false);
  const { colors } = useTheme();
  const styles = _styles();

  const handleLogin = async () => {
    if (email == "" || password == "") {
      toast("Error", "Faltan campos por llenar", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      dispatch(setLoginData(response.data));
      dispatch(updateToken(response.token));
      dispatch(rememberUser(toggleSwitch));

      await AsyncStorage.setItem(StorageKeysEnum.refreshToken, response.token);
    } catch (error) {
      console.log(error);
      setError(String(error));
      toast("Error", "Usuario o contraseña incorrectos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Geolocation.requestAuthorization();
  }, []);

  const handleSupportPress = () => {
    Alert.alert(
      "Soporte",
      "Si tienes problemas para ingresar, contacta al administrador para restablecer tu acceso."
    );
  };

  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (err) {
      toast("Error", "No se pudo abrir el enlace", "error");
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
        <Image
          style={styles.logo}
          resizeMode="contain"
          source={require("../../assets/images/Eventivalogo.png")}
        />
        <Text style={styles.brandText}>Eventiva</Text>
        <View style={styles.card}>
          <Text style={styles.title}>Iniciar sesión</Text>
          <Text style={styles.subtitle}>Accede para continuar con tu operación diaria</Text>
          <View style={styles.inputContainer}>
            <View>
              <ArrobaIcon></ArrobaIcon>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor={colors.gris300}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setEmail}
              value={email}
            />
          </View>
          <View style={styles.inputContainer}>
            <View>
              <Candado></Candado>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={colors.gris300}
              secureTextEntry={true}
              onChangeText={setPassword}
              value={password}
            />
          </View>

          <TouchableOpacity onPress={handleLogin} style={styles.button}>
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <View style={styles.rememberWrap}>
              <Switch
                trackColor={{ false: "#767577", true: colors.Morado600 }}
                thumbColor={toggleSwitch ? "#fe693f" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setToggleSwitch}
                value={toggleSwitch}
              />
              <Text style={styles.rememberText}>Recordar usuario</Text>
            </View>

            <TouchableOpacity style={styles.helpButton} onPress={handleSupportPress}>
              <Text style={styles.helpText}>¿Tienes problemas?</Text>
            </TouchableOpacity>
          </View>
          <View>
            <Text style={styles.errorText}>{error}</Text>
          </View>
          <View style={styles.legalLinksContainer}>
            <TouchableOpacity
              onPress={() => handleOpenLink("https://intelekia.cloud/privacidad")}
            >
              <Text style={styles.legalLinkText}>Aviso de privacidad de datos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleOpenLink("https://intelekia.cloud/terminos")}
            >
              <Text style={styles.legalLinkText}>Términos y condiciones</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Toast />
      </ScrollView>
      <Loading loading={loading}></Loading>
    </View>
  );
};
export default Login;
