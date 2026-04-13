import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useTheme } from '@hooks/useTheme';
import AppCard from '@components/AppCard';
import * as designService from '@services/design';
import { createAppPickerSelectStyle } from '@utils/pickerSelectTheme';
import { designAnalyticsEvents, trackDesignEvent } from '@utils/design-analytics';

const DesignEvent = (): JSX.Element => {
  const { colors, fonts } = useTheme();
  const [loading, setLoading] = useState(false);
  const [eventType, setEventType] = useState('social');
  const [style, setStyle] = useState('boho');
  const [guestCount, setGuestCount] = useState('80');
  const [budget, setBudget] = useState('0');
  const [eventId, setEventId] = useState('0');
  const [filterStyle, setFilterStyle] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');
  const [filterSpaceUsage, setFilterSpaceUsage] = useState('');
  const [maxWeightKg, setMaxWeightKg] = useState('');
  const [recommendation, setRecommendation] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);

  React.useEffect(() => {
    trackDesignEvent(designAnalyticsEvents.flowOpened);
    return () => {
      trackDesignEvent(designAnalyticsEvents.flowAbandoned);
    };
  }, []);

  const pickerSelectStyles = useMemo(() => createAppPickerSelectStyle(colors, fonts), [colors, fonts]);

  const getErrorLogData = (error: any) => ({
    message: error?.message,
    code: error?.code,
    status: error?.response?.status,
    data: error?.response?.data,
  });

  const buildRecommendation = async (): Promise<void> => {
    setLoading(true);
    try {
      trackDesignEvent(designAnalyticsEvents.recommendationRequested, { eventType, style });
      const payload = {
        eventType,
        style,
        guestCount: Number(guestCount),
        budget: Number(budget),
        filters: {
          style: filterStyle,
          color: filterColor,
          material: filterMaterial,
          spaceUsage: filterSpaceUsage,
          maxWeightKg: Number(maxWeightKg || 0),
        },
      };
      console.log('[DesignEvent] buildRecommendation:start', payload);
      const data = await designService.getMoodboardRecommendation(payload);
      console.log('[DesignEvent] buildRecommendation:moodboard:ok', {
        style: data?.style?.label,
        recommendedItems: data?.recommendedItems?.length ?? 0,
      });
      setRecommendation(data);
      const live = await designService.getLiveQuote({
        items: data.recommendedItems,
        packages: [],
        logisticsFee: 0,
        discountPct: 0,
        applyIva: false,
      });
      console.log('[DesignEvent] buildRecommendation:liveQuote:ok', {
        subtotal: live?.breakdown?.subtotal,
        total: live?.breakdown?.total,
      });
      setQuote(live.breakdown);
      trackDesignEvent(designAnalyticsEvents.recommendationSucceeded, {
        style,
        itemCount: data.recommendedItems?.length ?? 0,
      });
      trackDesignEvent(designAnalyticsEvents.liveQuoteGenerated, { total: live.breakdown?.total ?? 0 });
      Toast.show({ type: 'success', text1: 'Listo', text2: 'Moodboard y cotización generados' });
    } catch (error) {
      console.error('[DesignEvent] buildRecommendation:error', getErrorLogData(error));
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo generar la propuesta' });
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async (): Promise<void> => {
    if (recommendation == null) {
      Toast.show({ type: 'info', text1: 'Primero genera una propuesta' });
      return;
    }
    setLoading(true);
    try {
      console.log('[DesignEvent] saveDraft:start', {
        eventId: Number(eventId) || 0,
        hasRecommendation: recommendation != null,
        hasQuote: quote != null,
      });
      await designService.saveDesignDraft(Number(eventId) || 0, {
        form: { eventType, style, guestCount: Number(guestCount), budget: Number(budget) },
        recommendation,
        quote,
      });
      console.log('[DesignEvent] saveDraft:ok');
      trackDesignEvent(designAnalyticsEvents.draftSaved, { eventId: Number(eventId) || 0 });
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Borrador de diseño actualizado' });
    } catch (error) {
      console.error('[DesignEvent] saveDraft:error', getErrorLogData(error));
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar el borrador' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.DarkViolet300 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <AppCard>
          <Text style={{ color: colors.Griss50, fontFamily: fonts.Inter.SemiBold, fontSize: 18 }}>
            Diseña tu evento
          </Text>
          <Text style={{ color: colors.gris300, fontFamily: fonts.Inter.Regular, marginTop: 6 }}>
            Crea un moodboard inteligente y obtén una cotización viva en segundos.
          </Text>

          <Text style={{ color: colors.gris300, marginTop: 14, fontFamily: fonts.Inter.Medium }}>Tipo de evento</Text>
          <RNPickerSelect
            useNativeAndroidPickerStyle={false}
            doneText="Listo"
            style={pickerSelectStyles}
            value={eventType}
            onValueChange={(value) => setEventType(String(value))}
            items={[
              { label: 'Social', value: 'social' },
              { label: 'Boda', value: 'boda' },
              { label: 'Corporativo', value: 'corporativo' },
            ]}
          />

          <Text style={{ color: colors.gris300, marginTop: 10, fontFamily: fonts.Inter.Medium }}>Estilo</Text>
          <RNPickerSelect
            useNativeAndroidPickerStyle={false}
            doneText="Listo"
            style={pickerSelectStyles}
            value={style}
            onValueChange={(value) => setStyle(String(value))}
            items={[
              { label: 'Boho', value: 'boho' },
              { label: 'Minimal', value: 'minimal' },
              { label: 'Corporativo elegante', value: 'corporativo' },
              { label: 'Clásico', value: 'clasico' },
            ]}
          />

          <Text style={{ color: colors.gris300, marginTop: 10, fontFamily: fonts.Inter.Medium }}>Invitados</Text>
          <TextInput
            value={guestCount}
            onChangeText={setGuestCount}
            keyboardType="number-pad"
            style={{ color: colors.Griss50, borderBottomColor: colors.gris400, borderBottomWidth: 1, paddingVertical: 8 }}
          />

          <Text style={{ color: colors.gris300, marginTop: 10, fontFamily: fonts.Inter.Medium }}>Presupuesto objetivo</Text>
          <TextInput
            value={budget}
            onChangeText={setBudget}
            keyboardType="number-pad"
            style={{ color: colors.Griss50, borderBottomColor: colors.gris400, borderBottomWidth: 1, paddingVertical: 8 }}
          />

          <Text style={{ color: colors.gris300, marginTop: 10, fontFamily: fonts.Inter.Medium }}>ID Evento (0 si aún no existe)</Text>
          <TextInput
            value={eventId}
            onChangeText={setEventId}
            keyboardType="number-pad"
            style={{ color: colors.Griss50, borderBottomColor: colors.gris400, borderBottomWidth: 1, paddingVertical: 8 }}
          />

          <Text style={{ color: colors.gris300, marginTop: 10, fontFamily: fonts.Inter.Medium }}>Filtro estilo (opcional)</Text>
          <TextInput
            value={filterStyle}
            onChangeText={setFilterStyle}
            style={{ color: colors.Griss50, borderBottomColor: colors.gris400, borderBottomWidth: 1, paddingVertical: 8 }}
          />

          <Text style={{ color: colors.gris300, marginTop: 10, fontFamily: fonts.Inter.Medium }}>Filtro color (opcional)</Text>
          <TextInput
            value={filterColor}
            onChangeText={setFilterColor}
            style={{ color: colors.Griss50, borderBottomColor: colors.gris400, borderBottomWidth: 1, paddingVertical: 8 }}
          />

          <Text style={{ color: colors.gris300, marginTop: 10, fontFamily: fonts.Inter.Medium }}>Filtro material (opcional)</Text>
          <TextInput
            value={filterMaterial}
            onChangeText={setFilterMaterial}
            style={{ color: colors.Griss50, borderBottomColor: colors.gris400, borderBottomWidth: 1, paddingVertical: 8 }}
          />

          <Text style={{ color: colors.gris300, marginTop: 10, fontFamily: fonts.Inter.Medium }}>Uso espacio (indoor/outdoor/both)</Text>
          <TextInput
            value={filterSpaceUsage}
            onChangeText={setFilterSpaceUsage}
            autoCapitalize="none"
            style={{ color: colors.Griss50, borderBottomColor: colors.gris400, borderBottomWidth: 1, paddingVertical: 8 }}
          />

          <Text style={{ color: colors.gris300, marginTop: 10, fontFamily: fonts.Inter.Medium }}>Peso máximo kg (opcional)</Text>
          <TextInput
            value={maxWeightKg}
            onChangeText={setMaxWeightKg}
            keyboardType="number-pad"
            style={{ color: colors.Griss50, borderBottomColor: colors.gris400, borderBottomWidth: 1, paddingVertical: 8 }}
          />

          <TouchableOpacity
            disabled={loading}
            onPress={buildRecommendation}
            style={{ marginTop: 16, borderRadius: 12, backgroundColor: colors.Morado600, paddingVertical: 12, alignItems: 'center' }}
          >
            <Text style={{ color: colors.white, fontFamily: fonts.Inter.SemiBold }}>Generar propuesta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={loading}
            onPress={saveDraft}
            style={{ marginTop: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.Morado100, paddingVertical: 12, alignItems: 'center' }}
          >
            <Text style={{ color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }}>Guardar borrador</Text>
          </TouchableOpacity>
        </AppCard>

        {recommendation != null && (
          <AppCard style={{ marginTop: 12 }}>
            <Text style={{ color: colors.Griss50, fontFamily: fonts.Inter.SemiBold, fontSize: 16 }}>
              Moodboard: {recommendation.style?.label}
            </Text>
            {recommendation.recommendedItems?.slice(0, 5).map((item: any) => (
              <View key={`rec-${item.id_mob}`} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <MaterialCommunityIcons name="sofa-outline" size={18} color={colors.Morado100} />
                <Text style={{ marginLeft: 8, color: colors.Griss50, fontFamily: fonts.Inter.Regular }}>
                  {item.nombre_mob} x{item.cantidad}
                </Text>
              </View>
            ))}
          </AppCard>
        )}

        {quote != null && (
          <AppCard style={{ marginTop: 12 }}>
            <Text style={{ color: colors.Griss50, fontFamily: fonts.Inter.SemiBold, fontSize: 16 }}>
              Cotización viva
            </Text>
            <Text style={{ color: colors.gris300, marginTop: 8 }}>Subtotal: ${Number(quote.subtotal).toFixed(2)}</Text>
            <Text style={{ color: colors.gris300, marginTop: 4 }}>IVA: ${Number(quote.ivaAmount).toFixed(2)}</Text>
            <Text style={{ color: colors.Morado100, marginTop: 4, fontFamily: fonts.Inter.SemiBold }}>
              Total estimado: ${Number(quote.total).toFixed(2)}
            </Text>
          </AppCard>
        )}
      </ScrollView>
      <Toast />
    </View>
  );
};

export default DesignEvent;
