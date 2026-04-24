import { memo, useEffect } from "react"
import { ActivityIndicator, Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import AppModal from "@components/AppModal"
import { IInventary } from "@interfaces/inventary"
import * as inventaryService from '../../services/inventary';
import Loading from "@components/loading";
import React from "react";
import { useTheme } from "@hooks/useTheme";
import SearchIcon from "@assets/images/icons/SearchIcon";
import CancelIcon from "@assets/images/icons/CancelIcon";
import PrimaryButton from "@components/PrimaryButton";
import AppCard from "@components/AppCard";
import EmptyState from "@components/EmptyState";
import Toast from "react-native-toast-message";

const ITEMS_PEER_PAGE = 10

const Inventary = (): JSX.Element => {
    const [inventary, setInventary] = React.useState<IInventary[]>([])
    const [totalInventary, setTotalInventary] = React.useState<IInventary[]>([])
    const [refreshing, setRefreshing] = React.useState(false);
    const [loading, setLoading] = React.useState(false)
    const [search, setSearch] = React.useState('')
    const [page, setPage] = React.useState<number>(1)
    const [visible, setVisible] = React.useState(false)
    const [inventaryNew, setInventaryNew] = React.useState<IInventary>({ nombre_mob: '', cantidad_mob: 0, costo_mob: 0 })
    const [nombre, setNombre] = React.useState<string>('')
    const [cantidad, setCantidad] = React.useState<string>('')
    const [costo, setCosto] = React.useState<string>('')
    const [anchoCm, setAnchoCm] = React.useState<string>('')
    const [altoCm, setAltoCm] = React.useState<string>('')
    const [fondoCm, setFondoCm] = React.useState<string>('')
    const [pesoKg, setPesoKg] = React.useState<string>('')
    const [usoEspacio, setUsoEspacio] = React.useState<string>('')
    const [estilo, setEstilo] = React.useState<string>('')
    const [color, setColor] = React.useState<string>('')
    const [material, setMaterial] = React.useState<string>('')

    const { fonts, colors, layout } = useTheme()

    const addData = () => {
        if (search.length > 2) {
            return
        }
        let inv: IInventary[] = []
        if (page === 1) {
            inv = totalInventary.slice(0, page * ITEMS_PEER_PAGE)
        } else {
            inv = totalInventary.slice(page * ITEMS_PEER_PAGE, page * ITEMS_PEER_PAGE + ITEMS_PEER_PAGE)
        }

        inv = [...inventary, ...inv]
        setInventary(inv)
        setPage(page + 1)
    }


    const getInventary = async () => {
        try {
            const response = await inventaryService.getInventary() as IInventary[]

            await setTotalInventary(response)
            const inv = response.slice(0, page * ITEMS_PEER_PAGE)
            setInventary(inv)
        } catch (error) {
            console.log(error);
        } finally {
            setRefreshing(false);
            setLoading(false)
        }

    }

    useEffect(() => {
        setLoading(true)
        getInventary()
    }, [])

    const keyExtractor = (item: (any), index: number): string => item.id_mob.toString() + index

    const renderItem = ({
        item,
        index
    }: {
        item: IInventary
        index: number
    }): JSX.Element => {
        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                setInventaryNew(item)
                setNombre(item.nombre_mob)
                setCantidad(item.cantidad_mob.toString())
                setCosto(item.costo_mob.toString())
                setAnchoCm(item.ancho_cm ? String(item.ancho_cm) : '')
                setAltoCm(item.alto_cm ? String(item.alto_cm) : '')
                setFondoCm(item.fondo_cm ? String(item.fondo_cm) : '')
                setPesoKg(item.peso_kg ? String(item.peso_kg) : '')
                setUsoEspacio(item.uso_espacio ?? '')
                setEstilo(item.estilo ?? '')
                setColor(item.color ?? '')
                setMaterial(item.material ?? '')
                setVisible(true)
            }}>
                <View style={{ paddingHorizontal: layout.contentHorizontalPadding, marginBottom: 10 }}>
                    <AppCard>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flex: 1, paddingRight: 8 }}>
                                <Text style={{ color: colors.Morado100, fontFamily: fonts.Inter.SemiBold, fontSize: 14 }}>
                                    {item.nombre_mob}
                                </Text>
                                <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: colors.gris300, marginTop: 4 }}>
                                    {item.cantidad_mob} pieza{item.cantidad_mob > 1 ? 's' : ''}
                                </Text>
                                <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 12, color: colors.Griss100, marginTop: 2 }}>
                                    ${item.costo_mob} c/u
                                </Text>
                            </View>
                            <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 12, color: colors.primario300 }}>Detalles</Text>
                        </View>
                    </AppCard>
                </View>
            </TouchableOpacity>
        )
    }

    const renderFooter = () => {
        return (
            <>
                {/* <View style={{ paddingHorizontal: 10 }}>
                    <PrimaryButton
                        containerStyle={{ width: '100%', paddingVertical: 5, marginBottom: 5 }}
                        textStyle={{ fontSize: 12, fontFamily: fonts.Roboto.Regular, color: '#fff' }}
                        backgroundButton="#9E2EBE"
                        onPress={() => {
                            setVisible(true)
                        }}
                        title='Agregar inventario'
                    />
                </View> */}
                {search.length < 3 && inventary.length > 10 &&
                    <View style={{ height: 30 }}>
                        <ActivityIndicator></ActivityIndicator>
                    </View>
                }
            </>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.DarkViolet300 }}>

            <FlatList
                ListHeaderComponent={
                    <View style={{ flex: 1 }}>
                        
                        <View style={{ display: 'flex', flexDirection: 'row', padding: layout.contentHorizontalPadding, backgroundColor: colors.background_parts.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: `${colors.Griss50}18` }}>
                            <View style={{ paddingTop: 10 }}>
                                <SearchIcon></SearchIcon>
                            </View>
                            <TextInput
                                style={{ flex: 1, height: 40, paddingVertical: 0, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: `${colors.Griss50}33`, color: colors.Griss50 }}
                                placeholder="Búsqueda"
                                placeholderTextColor={colors.gris400}
                                onChangeText={(value: string) => {
                                    setSearch(value)
                                    if (value === '') {
                                        setPage(1)
                                        setInventary(totalInventary.slice(0, page * ITEMS_PEER_PAGE))
                                    }
                                    else if (value.length > 2) {

                                        setPage(1)
                                        const total = totalInventary.filter((item: IInventary) => item.nombre_mob.toLocaleLowerCase().includes(value.toLocaleLowerCase()))
                                        setInventary(total)
                                    }

                                }}
                                value={search}
                            />
                            <TouchableOpacity onPress={() => {
                                setSearch('')
                                setInventary(totalInventary)
                                setPage(1)
                                setInventary(totalInventary.slice(0, page * ITEMS_PEER_PAGE))
                            }} style={{ paddingTop: 10, borderBottomWidth: 1 }}>
                                <CancelIcon></CancelIcon>
                            </TouchableOpacity>

                        </View>
                        <View style={{ paddingHorizontal: 10 }}>
                            <PrimaryButton
                                containerStyle={{ width: '100%', paddingVertical: 5, marginBottom: 5 }}
                                textStyle={{ fontSize: 12, fontFamily: fonts.Inter.SemiBold, color: colors.white }}
                                backgroundButton={colors.Morado600}
                                onPress={() => {
                                    setInventaryNew({ nombre_mob: '', cantidad_mob: 0, costo_mob: 0 })
                                    setNombre('')
                                    setCantidad('')
                                    setCosto('')
                                    setAnchoCm('')
                                    setAltoCm('')
                                    setFondoCm('')
                                    setPesoKg('')
                                    setUsoEspacio('')
                                    setEstilo('')
                                    setColor('')
                                    setMaterial('')
                                    setVisible(true)
                                }}
                                title='Agregar inventario'
                            />
                        </View>
                    </View>

                }
                stickyHeaderIndices={[0]}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                data={inventary}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListFooterComponent={renderFooter}
                onEndReachedThreshold={0.3}
                onEndReached={addData}
                ListEmptyComponent={
                    !loading && search.length < 3 ? (
                        <EmptyState title="Sin artículos en inventario." subtitle="Agrega uno con el botón superior." />
                    ) : null
                }
            />
            <Loading loading={loading} />
            <AppModal
                visible={visible}
                onRequestClose={() => setVisible(false)}
                keyboardAvoiding
                maxHeight={layout.modalMaxHeight}
            >
                    <View style={{ maxHeight: layout.modalMaxHeight }}>
                        <View style={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: 4 }}>
                            <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 22, color: colors.Griss50, letterSpacing: 0.2 }}>
                                Inventario
                            </Text>
                            <View
                                style={{
                                    alignSelf: 'flex-start',
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
                                    {inventaryNew.nombre_mob === '' ? 'Agregar artículo' : 'Modificar artículo'}
                                </Text>
                            </View>
                        </View>
                        <ScrollView
                            style={{ paddingHorizontal: 18, maxHeight: layout.modalMaxHeight - (inventaryNew.id_mob ? 250 : 190) }}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            bounces={false}
                        >
                            <View>
                                <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 8 }}>
                                    Nombre
                                </Text>
                                <TextInput
                                    autoCapitalize="none"
                                    value={nombre}
                                    placeholder="Nombre del artículo"
                                    placeholderTextColor={colors.gris400}
                                    onChangeText={setNombre}
                                    style={{
                                        width: '100%',
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
                                />
                            </View>
                            <View style={{ flexDirection: 'row', paddingTop: 16, gap: 12 }}>
                                <View style={{ flex: 1, minWidth: 0 }}>
                                    <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300 }}>
                                        Cantidad
                                    </Text>
                                    <TextInput
                                        value={cantidad}
                                        onChangeText={(value: string) => setCantidad(value)}
                                        keyboardType="number-pad"
                                        autoCapitalize="none"
                                        placeholder="0"
                                        placeholderTextColor={colors.gris400}
                                        style={{
                                            width: '100%',
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
                                    />
                                </View>
                                <View style={{ flex: 1, minWidth: 0 }}>
                                    <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300 }}>
                                        Precio
                                    </Text>
                                    <TextInput
                                        keyboardType="numeric"
                                        value={costo}
                                        onChangeText={(value: string) => setCosto(value)}
                                        autoCapitalize="none"
                                        placeholder="0.00"
                                        placeholderTextColor={colors.gris400}
                                        style={{
                                            width: '100%',
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
                                    />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', paddingTop: 16, gap: 12 }}>
                                <View style={{ flex: 1, minWidth: 0 }}>
                                    <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300 }}>
                                        Ancho (cm) opcional
                                    </Text>
                                    <TextInput
                                        value={anchoCm}
                                        onChangeText={setAnchoCm}
                                        keyboardType="numeric"
                                        placeholder="Ej. 120"
                                        placeholderTextColor={colors.gris400}
                                        style={{ width: '100%', marginTop: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: `${colors.Morado100}44`, backgroundColor: `${colors.Griss50}0C`, color: colors.Griss50, fontFamily: fonts.Inter.Regular, fontSize: 15 }}
                                    />
                                </View>
                                <View style={{ flex: 1, minWidth: 0 }}>
                                    <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300 }}>
                                        Alto (cm) opcional
                                    </Text>
                                    <TextInput
                                        value={altoCm}
                                        onChangeText={setAltoCm}
                                        keyboardType="numeric"
                                        placeholder="Ej. 75"
                                        placeholderTextColor={colors.gris400}
                                        style={{ width: '100%', marginTop: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: `${colors.Morado100}44`, backgroundColor: `${colors.Griss50}0C`, color: colors.Griss50, fontFamily: fonts.Inter.Regular, fontSize: 15 }}
                                    />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', paddingTop: 16, gap: 12 }}>
                                <View style={{ flex: 1, minWidth: 0 }}>
                                    <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300 }}>
                                        Fondo (cm) opcional
                                    </Text>
                                    <TextInput
                                        value={fondoCm}
                                        onChangeText={setFondoCm}
                                        keyboardType="numeric"
                                        placeholder="Ej. 60"
                                        placeholderTextColor={colors.gris400}
                                        style={{ width: '100%', marginTop: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: `${colors.Morado100}44`, backgroundColor: `${colors.Griss50}0C`, color: colors.Griss50, fontFamily: fonts.Inter.Regular, fontSize: 15 }}
                                    />
                                </View>
                                <View style={{ flex: 1, minWidth: 0 }}>
                                    <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300 }}>
                                        Peso (kg) opcional
                                    </Text>
                                    <TextInput
                                        value={pesoKg}
                                        onChangeText={setPesoKg}
                                        keyboardType="numeric"
                                        placeholder="Ej. 20"
                                        placeholderTextColor={colors.gris400}
                                        style={{ width: '100%', marginTop: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: `${colors.Morado100}44`, backgroundColor: `${colors.Griss50}0C`, color: colors.Griss50, fontFamily: fonts.Inter.Regular, fontSize: 15 }}
                                    />
                                </View>
                            </View>
                            <View style={{ paddingTop: 16 }}>
                                <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300 }}>
                                    Uso de espacio opcional (indoor, outdoor, both)
                                </Text>
                                <TextInput
                                    value={usoEspacio}
                                    onChangeText={setUsoEspacio}
                                    autoCapitalize="none"
                                    placeholder="indoor"
                                    placeholderTextColor={colors.gris400}
                                    style={{ width: '100%', marginTop: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: `${colors.Morado100}44`, backgroundColor: `${colors.Griss50}0C`, color: colors.Griss50, fontFamily: fonts.Inter.Regular, fontSize: 15 }}
                                />
                            </View>
                            <View style={{ flexDirection: 'row', paddingTop: 16, gap: 12 }}>
                                <View style={{ flex: 1, minWidth: 0 }}>
                                    <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300 }}>
                                        Estilo opcional
                                    </Text>
                                    <TextInput
                                        value={estilo}
                                        onChangeText={setEstilo}
                                        placeholder="boho"
                                        placeholderTextColor={colors.gris400}
                                        style={{ width: '100%', marginTop: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: `${colors.Morado100}44`, backgroundColor: `${colors.Griss50}0C`, color: colors.Griss50, fontFamily: fonts.Inter.Regular, fontSize: 15 }}
                                    />
                                </View>
                                <View style={{ flex: 1, minWidth: 0 }}>
                                    <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300 }}>
                                        Color opcional
                                    </Text>
                                    <TextInput
                                        value={color}
                                        onChangeText={setColor}
                                        placeholder="beige"
                                        placeholderTextColor={colors.gris400}
                                        style={{ width: '100%', marginTop: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: `${colors.Morado100}44`, backgroundColor: `${colors.Griss50}0C`, color: colors.Griss50, fontFamily: fonts.Inter.Regular, fontSize: 15 }}
                                    />
                                </View>
                            </View>
                            <View style={{ paddingTop: 16 }}>
                                <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300 }}>
                                    Material opcional
                                </Text>
                                <TextInput
                                    value={material}
                                    onChangeText={setMaterial}
                                    placeholder="madera"
                                    placeholderTextColor={colors.gris400}
                                    style={{ width: '100%', marginTop: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: `${colors.Morado100}44`, backgroundColor: `${colors.Griss50}0C`, color: colors.Griss50, fontFamily: fonts.Inter.Regular, fontSize: 15 }}
                                />
                            </View>
                        </ScrollView>
                        <View
                            style={{
                                paddingTop: 16,
                                paddingHorizontal: 18,
                                paddingBottom: 18,
                                borderTopWidth: StyleSheet.hairlineWidth,
                                borderTopColor: `${colors.Griss50}22`,
                                gap: 12,
                            }}
                        >
                            <PrimaryButton
                                containerStyle={{
                                    width: '100%',
                                    paddingVertical: 14,
                                    borderRadius: 14,
                                    minHeight: 50,
                                }}
                                textStyle={{ fontSize: 15, fontFamily: fonts.Inter.SemiBold, color: colors.white }}
                                backgroundButton={colors.Morado600}
                                onPress={() => {

                                    if (inventaryNew.nombre_mob === '') {
                                        if (nombre.length === 0 || cantidad.length === 0 || costo.length === 0) {
                                            Toast.show({
                                                type: 'error',
                                                text1: 'Error',
                                                text2: 'Todos los campos son obligatorios',
                                                visibilityTime: 3000,
                                                autoHide: true,
                                                onHide: () => { }
                                            })
                                            return
                                        }

                                        const body = {
                                            name: nombre,
                                            quantity: parseInt(cantidad),
                                            price: costo,
                                            widthCm: anchoCm,
                                            heightCm: altoCm,
                                            depthCm: fondoCm,
                                            weightKg: pesoKg,
                                            spaceUsage: usoEspacio,
                                            style: estilo,
                                            color,
                                            material
                                        }

                                        try {

                                            inventaryService.addInventary(body)
                                            const last = totalInventary[totalInventary.length - 1].id_mob
                                            const inv: IInventary = {
                                                id_mob: last ? last + 1 : 9999,
                                                nombre_mob: body.name,
                                                cantidad_mob: body.quantity,
                                                costo_mob: parseInt(body.price),
                                                ancho_cm: anchoCm ? Number(anchoCm) : null,
                                                alto_cm: altoCm ? Number(altoCm) : null,
                                                fondo_cm: fondoCm ? Number(fondoCm) : null,
                                                peso_kg: pesoKg ? Number(pesoKg) : null,
                                                uso_espacio: usoEspacio ? (usoEspacio as any) : null,
                                                estilo: estilo || null,
                                                color: color || null,
                                                material: material || null
                                            }
                                            setTotalInventary([...totalInventary, inv])
                                            setInventary([...inventary, inv])
                                            setVisible(false)
                                            Toast.show({
                                                type: 'success',
                                                text1: 'Exito',
                                                text2: 'Se agrego correctamente',
                                                visibilityTime: 3000,
                                                autoHide: true,
                                                onHide: () => { }
                                            })
                                        } catch (error) {
                                            console.log(error);

                                        }
                                    } else {
                                        if ((nombre.length === 0 && inventaryNew.nombre_mob === nombre) || (cantidad.length === 0 && inventaryNew.cantidad_mob === parseInt(cantidad)) || (costo.length === 0 && inventaryNew.costo_mob === parseInt(costo))) {
                                            Toast.show({
                                                type: 'error',
                                                text1: 'Error',
                                                text2: 'No se puede modificar el mismo elemento',
                                                visibilityTime: 3000,
                                                autoHide: true,
                                                onHide: () => { }
                                            })
                                            return
                                        }
                                        const body = {
                                            id: inventaryNew.id_mob,
                                            name: nombre,
                                            quantity: parseInt(cantidad),
                                            price: costo,
                                            widthCm: anchoCm,
                                            heightCm: altoCm,
                                            depthCm: fondoCm,
                                            weightKg: pesoKg,
                                            spaceUsage: usoEspacio,
                                            style: estilo,
                                            color,
                                            material
                                        }

                                        try {

                                            inventaryService.updateInventary(body)
                                            inventaryNew.nombre_mob = body.name
                                            inventaryNew.cantidad_mob = body.quantity
                                            inventaryNew.costo_mob = parseInt(body.price)
                                            inventaryNew.ancho_cm = anchoCm ? Number(anchoCm) : null
                                            inventaryNew.alto_cm = altoCm ? Number(altoCm) : null
                                            inventaryNew.fondo_cm = fondoCm ? Number(fondoCm) : null
                                            inventaryNew.peso_kg = pesoKg ? Number(pesoKg) : null
                                            inventaryNew.uso_espacio = usoEspacio ? (usoEspacio as any) : null
                                            inventaryNew.estilo = estilo || null
                                            inventaryNew.color = color || null
                                            inventaryNew.material = material || null

                                            inventary.find((item: IInventary, index: number) => {
                                                if (item.id_mob === inventaryNew.id_mob) {
                                                    inventary[index] = inventaryNew
                                                }
                                            })

                                            totalInventary.find((item: IInventary, index: number) => {
                                                if (item.id_mob === inventaryNew.id_mob) {
                                                    totalInventary[index] = inventaryNew
                                                }
                                            })

                                            setInventaryNew({ nombre_mob: '', cantidad_mob: 0, costo_mob: 0 })

                                            setVisible(false)
                                            Toast.show({
                                                type: 'success',
                                                text1: 'Exito',
                                                text2: 'Se agrego correctamente',
                                                visibilityTime: 3000,
                                                autoHide: true,
                                                onHide: () => { }
                                            })
                                        } catch (error) {
                                            console.log(error);

                                        }

                                    }
                                    setNombre('')
                                    setCantidad('')
                                    setCosto('')
                                    setAnchoCm('')
                                    setAltoCm('')
                                    setFondoCm('')
                                    setPesoKg('')
                                    setUsoEspacio('')
                                    setEstilo('')
                                    setColor('')
                                    setMaterial('')

                                }}
                                title={inventaryNew.nombre_mob === '' ? 'Guardar artículo' : 'Guardar cambios'}
                            />
                            <PrimaryButton
                                containerStyle={{
                                    width: '100%',
                                    paddingVertical: 14,
                                    borderRadius: 14,
                                    minHeight: 50,
                                    borderWidth: 1.5,
                                    borderColor: `${colors.Morado100}66`,
                                    backgroundColor: 'transparent',
                                }}
                                textStyle={{ fontSize: 15, fontFamily: fonts.Inter.SemiBold, color: colors.Griss50 }}
                                backgroundButton="transparent"
                                onPress={() => setVisible(false)}
                                title="Cancelar"
                            />
                            {Boolean(inventaryNew.id_mob) && (
                                <PrimaryButton
                                    containerStyle={{
                                        width: '100%',
                                        paddingVertical: 14,
                                        borderRadius: 14,
                                        minHeight: 50,
                                    }}
                                    textStyle={{ fontSize: 15, fontFamily: fonts.Inter.SemiBold, color: colors.white }}
                                    backgroundButton={colors.red}
                                    onPress={() => {
                                        Alert.alert(
                                            'Eliminar inventario',
                                            'Esta acción realizará una baja lógica del artículo. ¿Deseas continuar?',
                                            [
                                                {
                                                    text: 'Cancelar',
                                                    style: 'cancel',
                                                },
                                                {
                                                    text: 'Eliminar',
                                                    style: 'destructive',
                                                    onPress: async () => {
                                                        try {
                                                            const inventoryId = inventaryNew.id_mob ? inventaryNew.id_mob : 0
                                                            await inventaryService.remove(inventoryId)

                                                            const inv = totalInventary.filter((item: IInventary) => item.id_mob !== inventaryNew.id_mob)
                                                            setTotalInventary(inv)
                                                            setInventary(inv.slice(0, page * ITEMS_PEER_PAGE))
                                                            setSearch('')
                                                            setVisible(false)
                                                            Toast.show({
                                                                type: 'success',
                                                                text1: 'Exito',
                                                                text2: 'Se elimino correctamente',
                                                                visibilityTime: 3000,
                                                                autoHide: true,
                                                                onHide: () => { }
                                                            })
                                                        } catch (error) {
                                                            console.log(error);
                                                            Toast.show({
                                                                type: 'error',
                                                                text1: 'Error',
                                                                text2: 'No se pudo eliminar el inventario',
                                                                visibilityTime: 3000,
                                                                autoHide: true,
                                                                onHide: () => { }
                                                            })
                                                        } finally {
                                                            setInventaryNew({ nombre_mob: '', cantidad_mob: 0, costo_mob: 0 })
                                                            setVisible(false)
                                                        }
                                                    },
                                                },
                                            ],
                                            { cancelable: true },
                                        )
                                    }}
                                    title="Eliminar del inventario"
                                />
                            )}
                        </View>
                    </View>
            </AppModal>
        </View>
    )
}
export default Inventary