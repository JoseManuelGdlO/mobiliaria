import Loading from "@components/loading";
import { IClients } from "@interfaces/clients";
import LottieView from "lottie-react-native";
import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import * as packageService from "../../services/package";
import * as inventaryService from "../../services/inventary";
import { useTheme } from "@hooks/useTheme";
import { IPackage } from "@interfaces/packages";
import AreYouSure from "@components/are-you-suere-modal";
import { IInventary } from "@interfaces/inventary";
import CheckIcon from "@assets/images/icons/CheckIcon";
import { set } from "react-native-reanimated";
import { generateRandomColor } from "@utils/colors";
import CancelIcon from "@assets/images/icons/CancelIcon";
import PrimaryButton from "@components/PrimaryButton";
import Toast from "react-native-toast-message";
const height = Dimensions.get("window").height;

const Packages = (): JSX.Element => {
  const animation = useRef(null);
  const [packages, setPackages] = React.useState<IPackage[]>([]);
  const [invantary, setInventary] = React.useState<IInventary[]>([]);
  const [filteryList, setFilteryList] = React.useState<IInventary[]>([]);
  const [toRemove, setToRemove] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(false);
  const [detailsPackage, setDetailsPackage] = useState<{
    name: string;
    description: string;
    price: string;
    products: any[];
    productsBody: IInventary[]
  }>({ name: "", description: "", price: "", products: [], productsBody: []});

  const [open, setOpen] = React.useState(true);

  const { fonts, colors } = useTheme();

  const getInit = async () => {
    setLoading(true);
    try {
      const inventary = (await inventaryService.getInventary()) as IInventary[];

      setInventary(inventary);

      const packages = (await packageService.getPackages()) as IPackage[];
      setPackages(packages);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getInit();
  }, []);

  const keyExtractor = (item: IPackage, index: number): string =>
    item.id.toString();

  const renderItem = ({
    item,
    index,
  }: {
    item: IPackage;
    index: number;
  }): JSX.Element => {
    return (
      <View
        style={{ padding: 10, flex: 1, flexDirection: "column", margin: 1 }}
      >
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
              source={require("../../assets/images/lottie/box.json")}
            />
            <View style={{ paddingTop: 5, width: "70%" }}>
              <Text style={{ fontFamily: fonts.Roboto.Bold, color: "#488aff" }}>
                {item.nombre}
              </Text>
              <Text
                lineBreakMode="tail"
                style={{
                  fontFamily: fonts.Roboto.MediumItalic,
                  fontSize: 12,
                  width: "100%",
                }}
              >
                {item.descripcion}
              </Text>
            </View>
          </View>
          <View
            style={{ display: "flex", flexDirection: "row", paddingTop: 10 }}
          >
            <View style={{ paddingHorizontal: 2, width: "90%" }}>
              <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12 }}>
                Precio.- ${item.precio}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.Roboto.Regular,
                  fontSize: 12,
                  color: "#488aff",
                }}
              >
                {item.products
                  .map((item) => {
                    return `${item.cantidad} ${item.nombre_mob}`;
                  })
                  .join(", ")}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: "red",
                height: 30,
                borderRadius: 20,
                paddingHorizontal: 15,
                justifyContent: "center",
              }}
              onPress={() => {
                setToRemove(item.id);
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.Roboto.Black,
                  fontSize: 12,
                  color: colors.black,
                }}
              >
                X
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <LottieView
          ref={animation}
          autoPlay
          loop={true}
          style={{
            width: "50%",
            height: 150,
            backgroundColor: "transparent",
          }}
          // Find more Lottie files at https://lottiefiles.com/featured
          source={require("../../assets/images/lottie/packages.json")}
        />
        <View>
          <TouchableOpacity
            onPress={() => setOpen(true)}
            style={{
              backgroundColor: "#488aff",
              borderRadius: 8,
              paddingVertical: 5,
              paddingHorizontal: 15,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontFamily: fonts.Roboto.Regular,
                fontSize: 12,
                color: colors.black,
              }}
            >
              Agregar paquete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={packages}
        numColumns={2}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={() => {
          return (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.Roboto.Bold,
                  fontSize: 20,
                  color: "#488aff",
                }}
              >
                Aun no has creado algun paquete
              </Text>
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
                source={require("../../assets/images/lottie/not_found.json")}
              />
            </View>
          );
        }}
      />
      <Loading loading={loading} />
      <AreYouSure
        open={toRemove !== 0}
        title="Estas seguro que eliminar este paquete?"
        sure={() => {
          const newPackages = packages.filter((item) => item.id !== toRemove);
          setPackages(newPackages);

          packageService.removePackage(toRemove);
          setToRemove(0);
        }}
        notsure={() => {
          console.log("notsure");
          setToRemove(0);
        }}
      ></AreYouSure>
      <Modal visible={open} transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: colors.black,
              borderRadius: 10,
              margin: 20,
              maxHeight: height - 100,
            }}
          >
            <ScrollView
              style={{ margin: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <Text
                style={{
                  fontFamily: fonts.Roboto.Medium,
                  fontSize: 18,
                  color: "#488aff",
                  marginTop: 16,
                }}
              >
                Agregar paquete nuevo
              </Text>
              <TextInput
                placeholder="Nombre del paquete"
                style={{
                  borderWidth: 1,
                  borderColor: "#9E2EBE",
                  borderRadius: 5,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  marginTop: 25,
                }}
                onChangeText={(value: string) => {
                  setDetailsPackage({ ...detailsPackage, name: value });
                }}
              ></TextInput>
              <TextInput
                placeholder="Descripcion"
                style={{
                  borderWidth: 1,
                  borderColor: "#9E2EBE",
                  borderRadius: 5,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  marginTop: 10,
                }}
                onChangeText={(value: string) => {
                  setDetailsPackage({ ...detailsPackage, description: value });
                }}
              ></TextInput>
              <TextInput
                placeholder="Precio"
                style={{
                  borderWidth: 1,
                  borderColor: "#9E2EBE",
                  borderRadius: 5,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  marginTop: 10,
                }}
                onChangeText={(value: string) => {
                  setDetailsPackage({ ...detailsPackage, price: value });
                }}
              ></TextInput>
              <Text
                style={{
                  fontFamily: fonts.Roboto.Regular,
                  fontSize: 14,
                  color: "#488aff",
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                Productos
              </Text>
              <FlatList
                data={detailsPackage.productsBody}
                renderItem={({ item, index }) => {
                  const color = generateRandomColor();
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        const newProducts = detailsPackage.products.filter(
                          (element) => element.id_mob !== item.id_mob
                        );
                        setDetailsPackage({
                          ...detailsPackage,
                          products: newProducts,
                        });
                      }}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        backgroundColor: color,
                        paddingHorizontal: 5,
                        borderRadius: 10,
                        marginRight: 5,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: fonts.Roboto.Regular,
                          fontSize: 14,
                          color: "#FFF",
                          marginTop: 5,
                          textAlign: "center",
                        }}
                      >
                        {item.nombre_mob.substring(0, 10)}... {item.cantidad}
                      </Text>
                      <View style={{ marginTop: 3 }}>
                        <CancelIcon size={20} fill="#FFF"></CancelIcon>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                keyExtractor={(item, index) => index.toString()}
                horizontal
              ></FlatList>
              <TextInput
                placeholder="Buscar producto"
                style={{
                  borderWidth: 1,
                  borderColor: "#9E2EBE",
                  borderRadius: 5,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  marginTop: 10,
                }}
                onChangeText={(value: string) => {
                  if (value.length > 3) {
                    const filteryList = invantary.filter((item) => {
                      return item.nombre_mob
                        .toLowerCase()
                        .includes(value.toLowerCase());
                    });

                    setFilteryList(filteryList);
                  } else {
                    setFilteryList([]);
                  }
                }}
              ></TextInput>
              {filteryList.map((item, index) => {
                return (
                  <>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        borderBottomColor: "black",
                        borderBottomWidth: 1,
                        paddingVertical: 3,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: fonts.Roboto.Regular,
                          fontSize: 14,
                          color: "#000",
                          marginTop: 10,
                          textAlign: "center",
                        }}
                      >
                        {item.nombre_mob}, QTY. {item.cantidad_mob}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                        }}
                      >
                        <TextInput
                          style={{
                            borderBottomWidth: 1,
                            borderColor: "#9E2EBE",
                            paddingVertical: 1,
                            margin: 0,
                          }}
                          onChangeText={(value: string) => {
                            item.cantidad = parseInt(value);
                            setFilteryList([...filteryList]);
                          }}
                          placeholder="10"
                        ></TextInput>
                        <TouchableOpacity
                          style={{ paddingTop: 5 }}
                          onPress={() => {
                            if (item.cantidad) {
                              const inv = detailsPackage.productsBody.find(
                                (element) => element.id_mob === item.id_mob
                              );

                              if (inv) {
                                inv.cantidad = item.cantidad;
                                setDetailsPackage({
                                  ...detailsPackage,
                                  productsBody: detailsPackage.productsBody,
                                });
                              } else {
                                setDetailsPackage({
                                  ...detailsPackage,
                                  productsBody: [...detailsPackage.productsBody, item],
                                });
                              }
                            }
                          }}
                        >
                          <CheckIcon></CheckIcon>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                );
              })}
            </ScrollView>
            <View style={{ margin: 16, display: "flex", flexDirection: "row", justifyContent: 'space-around' }}>
              <TouchableOpacity
                style={{ width: "50%", height: 30, borderRadius: 5,  alignItems: 'center', paddingVertical: 5, margin: 0, backgroundColor: 'green'}}
                onPress={() => {
                  console.log(detailsPackage);
                  
                  if(detailsPackage.name === '' || detailsPackage.description === '' || detailsPackage.price === '' || detailsPackage.productsBody.length === 0) {
                    
                      Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Todos los campos son requeridos',
                        visibilityTime: 1000,
                        autoHide: true
                    })
                    return;
                  }
                  setOpen(false);
                  try {
                    setLoading(true);
                    detailsPackage.products = detailsPackage.productsBody.map((item) => {
                      return {
                        id: item.id_mob,
                        quantity: item.cantidad
                      }
                    })
                    packageService.addPackage(detailsPackage);
                    getInit();

                  } catch (error) {
                    console.log(error);
                  } finally {
                    setLoading(false);
                  }
                }}              
                >
                  <Text
                  style={{
                    fontFamily: fonts.Roboto.Black,
                    fontSize: 12,
                    color: '#FFF',
                  }}
                  >Agregar</Text>
                </TouchableOpacity>
              <TouchableOpacity
                style={{ width: "50%", height: 30, borderRadius: 5,  alignItems: 'center', paddingVertical: 5, margin: 0, backgroundColor: '#e0e0e0'}}
                onPress={() => {
                  setOpen(false);
                }}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <Toast />
    </>
  );
};
export default Packages;
