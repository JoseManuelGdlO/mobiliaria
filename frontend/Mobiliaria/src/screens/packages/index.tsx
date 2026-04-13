import Loading from "@components/loading";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Dimensions,
  TextInput,
  StyleSheet,
} from "react-native";
import * as packageService from "../../services/package";
import * as inventaryService from "../../services/inventary";
import { useTheme } from "@hooks/useTheme";
import { IPackage } from "@interfaces/packages";
import ConfirmDialog from "@components/ConfirmDialog";
import { IInventary } from "@interfaces/inventary";
import Toast from "react-native-toast-message";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AppCard from "@components/AppCard";
import AppModal from "@components/AppModal";
import PrimaryButton from "@components/PrimaryButton";
import EmptyState from "@components/EmptyState";
const height = Dimensions.get("window").height;

const Packages = (): JSX.Element => {
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

  const [open, setOpen] = React.useState(false);

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
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <AppCard>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                backgroundColor: `${colors.Morado600}35`,
                borderWidth: 1,
                borderColor: `${colors.Morado100}44`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons
                name="gift-outline"
                size={30}
                color={colors.Morado100}
              />
            </View>
            <View style={{ paddingLeft: 12, flex: 1 }}>
              <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 16, color: colors.Griss50 }}>
                {item.nombre}
              </Text>
              <Text lineBreakMode="tail" style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: colors.gris300, marginTop: 4 }}>
                {item.descripcion}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", paddingTop: 12, marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: `${colors.Griss50}18`, alignItems: "center" }}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.Morado100 }}>
                Precio: ${item.precio}
              </Text>
              <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: colors.primario300, marginTop: 4 }}>
                {item.products.map((p) => `${p.cantidad} ${p.nombre_mob}`).join(", ")}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: `${colors.red}33`,
                height: 36,
                borderRadius: 10,
                paddingHorizontal: 14,
                justifyContent: "center",
                borderWidth: 1,
                borderColor: `${colors.red}55`,
              }}
              onPress={() => {
                setToRemove(item.id);
              }}
            >
              <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 12, color: colors.red }}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </AppCard>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.DarkViolet300 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 20,
              backgroundColor: `${colors.Morado600}33`,
              borderWidth: 1,
              borderColor: `${colors.Morado100}44`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={44}
              color={colors.Morado100}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text
              style={{
                fontFamily: fonts.Inter.SemiBold,
                fontSize: 17,
                color: colors.Griss50,
              }}
            >
              Tus paquetes
            </Text>
            <Text
              style={{
                fontFamily: fonts.Inter.Regular,
                fontSize: 13,
                color: colors.gris300,
                marginTop: 4,
              }}
            >
              Combina productos y precios
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setOpen(true)}
          style={{
            backgroundColor: colors.Morado600,
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 14,
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: fonts.Inter.SemiBold,
              fontSize: 13,
              color: colors.white,
            }}
          >
            Agregar
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={packages}
        numColumns={1}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          !loading ? (
            <EmptyState title="Aún no has creado ningún paquete." subtitle="Usa el botón superior para agregar uno." />
          ) : null
        }
      />
      <Loading loading={loading} />
      <ConfirmDialog
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
      ></ConfirmDialog>
      <AppModal
        visible={open}
        onRequestClose={() => setOpen(false)}
        keyboardAvoiding
        maxHeight={height - 100}
      >
            <View>
              <View style={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8 }}>
                <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 22, color: colors.Griss50, letterSpacing: 0.2 }}>
                  Nuevo paquete
                </Text>
                <View
                  style={{
                    alignSelf: "flex-start",
                    marginTop: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: `${colors.Morado600}33`,
                    borderWidth: 1,
                    borderColor: `${colors.Morado100}44`,
                  }}
                >
                  <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 13, color: colors.Morado100 }}>
                    Completa los datos
                  </Text>
                </View>
              </View>
            <ScrollView
              style={{ paddingHorizontal: 18 }}
              contentContainerStyle={{ paddingBottom: 12 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 8 }}>
                Nombre del paquete
              </Text>
              <TextInput
                placeholder="Ej. Paquete básico"
                placeholderTextColor={colors.gris400}
                value={detailsPackage.name}
                style={{
                  width: "100%",
                  marginTop: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: `${colors.Morado100}44`,
                  backgroundColor: `${colors.Griss50}0C`,
                  color: colors.Griss50,
                  fontFamily: fonts.Inter.Regular,
                  fontSize: 15,
                }}
                onChangeText={(value: string) => {
                  setDetailsPackage({ ...detailsPackage, name: value });
                }}
              />
              <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 16 }}>
                Descripción
              </Text>
              <TextInput
                placeholder="Describe el paquete"
                placeholderTextColor={colors.gris400}
                value={detailsPackage.description}
                multiline
                style={{
                  width: "100%",
                  marginTop: 8,
                  minHeight: 72,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: `${colors.Morado100}44`,
                  backgroundColor: `${colors.Griss50}0C`,
                  color: colors.Griss50,
                  fontFamily: fonts.Inter.Regular,
                  fontSize: 15,
                  textAlignVertical: "top",
                }}
                onChangeText={(value: string) => {
                  setDetailsPackage({ ...detailsPackage, description: value });
                }}
              />
              <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 16 }}>
                Precio
              </Text>
              <TextInput
                placeholder="0.00"
                placeholderTextColor={colors.gris400}
                value={detailsPackage.price}
                keyboardType="numeric"
                style={{
                  width: "100%",
                  marginTop: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: `${colors.Morado100}44`,
                  backgroundColor: `${colors.Griss50}0C`,
                  color: colors.Griss50,
                  fontFamily: fonts.Inter.Regular,
                  fontSize: 15,
                }}
                onChangeText={(value: string) => {
                  setDetailsPackage({ ...detailsPackage, price: value });
                }}
              />
              <Text
                style={{
                  fontFamily: fonts.Inter.SemiBold,
                  fontSize: 15,
                  color: colors.Griss50,
                  marginTop: 20,
                  marginBottom: 8,
                }}
              >
                Productos incluidos
              </Text>
              <FlatList
                data={detailsPackage.productsBody}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        const newProducts = detailsPackage.productsBody.filter(
                          (element) => element.id_mob !== item.id_mob
                        );
                        
                        setDetailsPackage({
                          ...detailsPackage,
                          productsBody: newProducts.length > 0 ? newProducts : [],
                        });
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: `${colors.Morado600}38`,
                        borderWidth: 1,
                        borderColor: `${colors.Morado100}55`,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        borderRadius: 12,
                        marginRight: 8,
                        maxWidth: 200,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: fonts.Inter.Medium,
                          fontSize: 13,
                          color: colors.Griss50,
                          flex: 1,
                          marginRight: 6,
                        }}
                        numberOfLines={1}
                      >
                        {item.nombre_mob.substring(0, 10)}… {item.cantidad}
                      </Text>
                      <MaterialCommunityIcons
                        name="close-circle-outline"
                        size={22}
                        color={colors.gris300}
                      />
                    </TouchableOpacity>
                  );
                }}
                keyExtractor={(item, index) => index.toString()}
                horizontal
              ></FlatList>
              <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 16 }}>
                Buscar producto
              </Text>
              <TextInput
                placeholder="Escribe al menos 4 caracteres"
                placeholderTextColor={colors.gris400}
                style={{
                  width: "100%",
                  marginTop: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: `${colors.Morado100}44`,
                  backgroundColor: `${colors.Griss50}0C`,
                  color: colors.Griss50,
                  fontFamily: fonts.Inter.Regular,
                  fontSize: 15,
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
                    <View
                      key={item.id_mob ?? `filter-${index}`}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottomColor: `${colors.Morado100}33`,
                        borderBottomWidth: 1,
                        paddingVertical: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: fonts.Inter.Regular,
                          fontSize: 14,
                          width: "58%",
                          color: colors.Griss50,
                          textAlign: "left",
                        }}
                      >
                        {item.nombre_mob}, QTY. {item.cantidad_mob}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          width: "42%",
                          gap: 8,
                        }}
                      >
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: `${colors.Morado100}44`,
                            borderRadius: 10,
                            paddingVertical: 8,
                            textAlign: "center",
                            fontSize: 16,
                            width: "52%",
                            margin: 0,
                            color: colors.Griss50,
                            fontFamily: fonts.Inter.SemiBold,
                            backgroundColor: `${colors.Griss50}0C`,
                          }}
                          placeholderTextColor={colors.gris400}
                          keyboardType="numeric"
                          onChangeText={(value: string) => {
                            item.cantidad = parseInt(value, 10);
                            setFilteryList([...filteryList]);
                          }}
                          placeholder="10"
                        ></TextInput>
                        <TouchableOpacity
                          style={{ padding: 6 }}
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
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={28}
                            color={colors.Morado100}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                );
              })}
            </ScrollView>
            <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 18 }}>
              <PrimaryButton
                containerStyle={{
                  width: "100%",
                  paddingVertical: 14,
                  borderRadius: 14,
                  minHeight: 50,
                  marginBottom: 10,
                }}
                textStyle={{ fontSize: 15, fontFamily: fonts.Inter.SemiBold, color: colors.white }}
                backgroundButton={colors.Morado600}
                onPress={() => {
                  if (
                    detailsPackage.name === "" ||
                    detailsPackage.description === "" ||
                    detailsPackage.price === "" ||
                    detailsPackage.productsBody.length === 0
                  ) {
                    Toast.show({
                      type: "error",
                      text1: "Error",
                      text2: "Todos los campos son requeridos",
                      visibilityTime: 1000,
                      autoHide: true,
                    });
                    return;
                  }
                  setOpen(false);
                  try {
                    detailsPackage.products = detailsPackage.productsBody.map((item) => {
                      return {
                        id: item.id_mob,
                        quantity: item.cantidad,
                      };
                    });
                    packageService.addPackage(detailsPackage);
                    setPackages([
                      ...packages,
                      {
                        id: 0,
                        nombre: detailsPackage.name,
                        descripcion: detailsPackage.description,
                        precio: parseInt(detailsPackage.price, 10),
                        products: detailsPackage.productsBody,
                      },
                    ]);
                    setDetailsPackage({
                      name: "",
                      description: "",
                      price: "",
                      products: [],
                      productsBody: [],
                    });
                    getInit();
                  } catch (error) {
                    console.log(error);
                  }
                }}
                title="Guardar paquete"
              />
              <PrimaryButton
                containerStyle={{
                  width: "100%",
                  paddingVertical: 14,
                  borderRadius: 14,
                  minHeight: 50,
                  borderWidth: 1.5,
                  borderColor: `${colors.Morado100}66`,
                  backgroundColor: "transparent",
                }}
                textStyle={{ fontSize: 15, fontFamily: fonts.Inter.SemiBold, color: colors.Griss50 }}
                backgroundButton="transparent"
                onPress={() => setOpen(false)}
                title="Cancelar"
              />
            </View>
            </View>
      </AppModal>
      
      <Toast />
    </View>
  );
};
export default Packages;
