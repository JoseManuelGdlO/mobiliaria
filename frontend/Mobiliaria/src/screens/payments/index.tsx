import Loading from "@components/loading";
import { useTheme } from "@hooks/useTheme";
import { IPayments } from "@interfaces/payments";
import LottieView from "lottie-react-native";
import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import * as paymentService from "../../services/payments";
import { useNavigation } from "@react-navigation/native";
import { NavigationScreens } from "@interfaces/navigation";
import { StackNavigationProp } from "@react-navigation/stack";

const Payments = (): JSX.Element => {
  const animation = useRef(null);
  const [workers, setWorkers] = React.useState<IPayments[]>([]);
  const [loading, setLoading] = React.useState(false);

  const { fonts, colors } = useTheme();
  
  const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()

  const getWorkers = async () => {
    setLoading(true);
    try {
      const workers = (await paymentService.getPayments()) as IPayments[];
      
      setWorkers(workers);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getWorkers();
  }, []);

  const keyExtractor = (item: IPayments, index: number): string =>
    index.toString();

  const renderItem = ({
    item,
    index,
  }: {
    item: IPayments;
    index: number;
  }): JSX.Element => {
    return (
      <View style={{ padding: 10 }}>
        <View
          style={{
            padding: 10,
            borderColor: "#9E2EBE",
            borderRadius: 5,
            borderWidth: 1,
            overflow: "hidden",
            shadowColor: "yourchoice",
            shadowRadius: 10,
            shadowOpacity: 1,
          }}
        >
          <View style={{ display: "flex", flexDirection: "row" }}>
            <LottieView
              ref={animation}
              autoPlay
              loop={true}
              style={{
                width: 60,
                height: 60,
                backgroundColor: "transparent",
              }}
              // Find more Lottie files at https://lottiefiles.com/featured
              source={require("../../assets/images/lottie/money.json")}
            />
            <View style={{ paddingTop: 10 }}>
              <Text style={{ fontFamily: fonts.Roboto.Bold, color: "#488aff" }}>
                {item.nombre_evento}
              </Text>
              <Text
                style={{ fontFamily: fonts.Roboto.MediumItalic, fontSize: 12 }}
              >
                {item.nombre_titular_evento} - tipo: {item.tipo_evento}{" "}
              </Text>
            </View>
          </View>
          <View style={{ paddingHorizontal: 10 }}>
            <Text
              style={{
                color: "#9E2EBE",
                fontFamily: fonts.Roboto.Medium,
                fontSize: 15,
              }}
            >
              Saldo pendiente: ${item.saldo?.toFixed(2)}
            </Text>
            <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12 }}>
              Pagado: ${item.anticipo?.toFixed(2)}
            </Text>
            <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12 }}>
              Costo total: ${item.costo_total?.toFixed(2)}
            </Text>
          </View>
          <View
            style={{ display: "flex", flexDirection: "row", paddingTop: 10 }}
          >
            <View style={{ paddingHorizontal: 10, width: "70%" }}>
              <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12 }}>
                Fecha del evento
              </Text>
              <Text
                style={{
                  fontFamily: fonts.Roboto.Regular,
                  fontSize: 12,
                  color: "#488aff",
                }}
              >
                {item.fecha_envio_evento.split("T")[0]}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('EventDetail', { id: item.id_evento })
              }}
              style={{
                backgroundColor: "#488aff",
                borderRadius: 20,
                paddingHorizontal: 30,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.Roboto.Black,
                  fontSize: 12,
                  color: '#fff',
                }}
              >
                Detalle
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <FlatList
        ListHeaderComponent={() => {
          return (
            <View>
              <LottieView
                ref={animation}
                autoPlay
                loop={true}
                style={{
                  width: "100%",
                  height: 250,
                  backgroundColor: "transparent",
                }}
                // Find more Lottie files at https://lottiefiles.com/featured
                source={require("../../assets/images/lottie/payments.json")}
              />
            </View>
          );
        }}
        data={workers}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
      <Loading loading={loading} />
    </>
  );
};
export default Payments;
