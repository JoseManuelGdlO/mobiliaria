import React, { useEffect } from "react";
import {
  Alert,
  Image,
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
  const { colors, fonts } = useTheme();
  const styles = _styles();

  const Login = async () => {
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

  return (
    <View
      style={{
        backgroundColor: colors.DarkViolet300,
        height: "100%",
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ScrollView>
        <Image
          style={{ width: "100%", height: 450, objectFit: "contain" }}
          source={require("../../assets/images/Eventivalogo.jpg")}
        ></Image>
        <View style={{ paddingHorizontal: 25, marginTop: -60 }}>
          <Text
            style={{
              fontFamily: fonts.Inter.SemiBold,
              color: "#00bcbb",
              fontSize: 20,
            }}
          >
            Login
          </Text>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: "#fe693f",
              paddingBottom: 3,
              marginTop: 10,
            }}
          >
            <View style={{ paddingTop: 3 }}>
              <ArrobaIcon></ArrobaIcon>
            </View>
            <TextInput
              style={{ width: "90%", paddingVertical: 0, paddingHorizontal: 5 }}
              placeholder="Correo electrónico"
              keyboardType="email-address"
              onChangeText={setEmail}
              value={email}
            />
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: "#fe693f",
              paddingBottom: 3,
              marginTop: 10,
            }}
          >
            <View style={{ paddingTop: 3 }}>
              <Candado></Candado>
            </View>
            <TextInput
              style={{ width: "90%", paddingVertical: 0, paddingHorizontal: 5 }}
              placeholder="Contrasena"
              secureTextEntry={true}
              onChangeText={setPassword}
              value={password}
            />
          </View>

          <TouchableOpacity
            onPress={Login}
            style={{
              backgroundColor: colors.Morado600,
              paddingVertical: 15,
              paddingHorizontal: 30,
              borderRadius: 12,
              marginTop: 30,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.Inter.SemiBold,
                color: colors.white,
                fontSize: 15,
                textAlign: "center",
              }}
            >
              Iniciar sesión
            </Text>
          </TouchableOpacity>

          <View
            style={{ display: "flex", flexDirection: "row", marginTop: 20 }}
          >
            <TouchableOpacity style={{ display: "flex", flexDirection: "row" }}>
              <Switch
                style={{ paddingTop: 7 }}
                trackColor={{ false: "#767577", true: colors.Morado600 }}
                thumbColor={toggleSwitch ? "#fe693f" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setToggleSwitch}
                value={toggleSwitch}
              />
              <Text
                style={{
                  paddingTop: 10,
                  paddingLeft: 5,
                  fontFamily: fonts.Inter.Regular,
                  color: colors.Morado100,
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                Recordar usuario
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingVertical: 10,
                paddingHorizontal: 0,
                borderRadius: 5,
                marginTop: 0,
                width: "60%",
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.Inter.Regular,
                  color: colors.Morado100,
                  fontSize: 12,
                  textAlign: "right",
                }}
              >
                ¿Tienes problemas?
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <Text
              style={{
                fontFamily: fonts.Inter.SemiBold,
                color: colors.red,
                fontSize: 14,
                textAlign: "center",
                marginTop: 20,
              }}
            >
              {error}
            </Text>
           
          </View>
        </View>

        <Toast />
      </ScrollView>
      <Loading loading={loading}></Loading>
    </View>
  );
};
export default Login;
