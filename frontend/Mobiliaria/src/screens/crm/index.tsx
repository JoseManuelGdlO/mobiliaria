import AppCard from '@components/AppCard'
import KpiCard from '@components/KpiCard'
import PrimaryButton from '@components/PrimaryButton'
import { useTheme } from '@hooks/useTheme'
import { IPayments } from '@interfaces/payments'
import Clients from '@screens/clients/clients'
import Payments from '@screens/payments'
import * as paymentService from '@services/payments'
import React, { useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type CrmTab = 'seguimiento' | 'clientes' | 'pagos'

const CRM = (): JSX.Element => {
  const { colors, fonts } = useTheme()
  const [activeTab, setActiveTab] = useState<CrmTab>('seguimiento')
  const [snapshot, setSnapshot] = useState<IPayments[]>([])

  useEffect(() => {
    paymentService.getPayments({ page: 1, pageSize: 20 }).then((response) => {
      setSnapshot(response.items)
    }).catch(console.log)
  }, [])

  const kpis = useMemo(() => {
    const pending = snapshot.filter((item) => Number(item.saldo ?? 0) > 0)
    const dueThisPage = pending.reduce((acc, item) => acc + Number(item.saldo ?? 0), 0)
    const paid = snapshot.length - pending.length
    return { pending: pending.length, paid, dueThisPage }
  }, [snapshot])

  const renderBody = (): JSX.Element => {
    if (activeTab === 'clientes') return <Clients />
    if (activeTab === 'pagos') return <Payments />

    return (
      <View style={styles.overviewWrap}>
        <Text style={[styles.title, { color: colors.Griss50, fontFamily: fonts.Inter.SemiBold }]}>
          Seguimiento diario CRM
        </Text>
        <Text style={[styles.subtitle, { color: colors.gris300, fontFamily: fonts.Inter.Regular }]}>
          Prioriza cobranza y contacto de clientes desde un solo módulo.
        </Text>
        <View style={styles.kpiRow}>
          <KpiCard label='Pendientes' value={String(kpis.pending)} />
          <KpiCard label='Pagados' value={String(kpis.paid)} />
          <KpiCard label='Saldo visible' value={`$${kpis.dueThisPage.toFixed(2)}`} hint='Basado en la carga inicial' />
        </View>
        <AppCard>
          <Text style={{ color: colors.Morado100, fontFamily: fonts.Inter.SemiBold, fontSize: 15 }}>Acciones rápidas</Text>
          <View style={styles.quickActions}>
            <PrimaryButton
              title='Ver pagos pendientes'
              onPress={() => setActiveTab('pagos')}
              containerStyle={{ marginTop: 10, paddingVertical: 8 }}
            />
            <PrimaryButton
              title='Contactar clientes'
              onPress={() => setActiveTab('clientes')}
              containerStyle={{ marginTop: 8, paddingVertical: 8 }}
              backgroundButton={colors.primario300}
            />
          </View>
        </AppCard>
      </View>
    )
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.DarkViolet300 }]}>
      <View style={[styles.tabsRow, { borderBottomColor: `${colors.Griss50}22` }]}>
        {[
          { id: 'seguimiento', label: 'Seguimiento' },
          { id: 'clientes', label: 'Clientes' },
          { id: 'pagos', label: 'Pagos' },
        ].map((tab) => {
          const active = activeTab === tab.id
          return (
            <PrimaryButton
              key={tab.id}
              title={tab.label}
              onPress={() => setActiveTab(tab.id as CrmTab)}
              containerStyle={styles.tabButton}
              backgroundButton={active ? colors.Morado600 : `${colors.white}14`}
              textStyle={{ color: active ? colors.white : colors.gris300, fontFamily: fonts.Inter.SemiBold, fontSize: 12 }}
            />
          )
        })}
      </View>
      <View style={styles.body}>{renderBody()}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
  tabButton: { minWidth: 110, paddingVertical: 7, borderRadius: 10 },
  body: { flex: 1 },
  overviewWrap: { paddingHorizontal: 16, paddingTop: 12 },
  title: { fontSize: 18 },
  subtitle: { fontSize: 13, marginTop: 5, marginBottom: 12 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quickActions: { marginTop: 6 },
})

export default CRM
