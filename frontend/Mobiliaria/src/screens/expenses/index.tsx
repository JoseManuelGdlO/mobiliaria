import AppCard from '@components/AppCard'
import EmptyState from '@components/EmptyState'
import FilterChips from '@components/FilterChips'
import KpiCard from '@components/KpiCard'
import Loading from '@components/loading'
import PrimaryButton from '@components/PrimaryButton'
import SearchInput from '@components/SearchInput'
import { usePaginatedList } from '@hooks/usePaginatedList'
import { useTheme } from '@hooks/useTheme'
import { ExpenseCategory, ExpensePayload, ExpensesQueryParams, ExpenseType, IExpense } from '@interfaces/expenses'
import * as expenseService from '@services/expenses'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native'

const emptyForm: ExpensePayload = {
  categoria: 'nomina',
  tipo: 'ocasional',
  monto: 0,
  fecha: new Date().toISOString().split('T')[0],
  descripcion: '',
  periodicidad: null,
  status: 'activo',
}

const monthOptions = [
  { id: '1', label: 'Ene' }, { id: '2', label: 'Feb' }, { id: '3', label: 'Mar' }, { id: '4', label: 'Abr' },
  { id: '5', label: 'May' }, { id: '6', label: 'Jun' }, { id: '7', label: 'Jul' }, { id: '8', label: 'Ago' },
  { id: '9', label: 'Sep' }, { id: '10', label: 'Oct' }, { id: '11', label: 'Nov' }, { id: '12', label: 'Dic' },
]

const Expenses = (): JSX.Element => {
  const { colors, fonts } = useTheme()
  const [form, setForm] = useState<ExpensePayload>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const now = new Date()
  const [months, setMonths] = useState(1)
  const [period, setPeriod] = useState<'current_month' | 'previous_month' | 'rolling_months'>('current_month')
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()))
  const [baseMonth, setBaseMonth] = useState(String(now.getMonth() + 1))
  const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const [compareMonth, setCompareMonth] = useState(String(previousDate.getMonth() + 1))
  const [compareYear, setCompareYear] = useState(String(now.getFullYear() - 1))
  const [summary, setSummary] = useState({ income_total: 0, expenses_total: 0, balance: 0 })
  const [comparison, setComparison] = useState<{ income_total: number, expenses_total: number, balance: number } | null>(null)
  const [delta, setDelta] = useState<{ income_total: number, expenses_total: number, balance: number } | null>(null)

  const fetchExpenses = useCallback(async (params: ExpensesQueryParams & { page: number, pageSize: number }) => {
    const response = await expenseService.getExpenses(params)
    return {
      items: response.items,
      hasMore: response.hasMore,
      total: response.total,
    }
  }, [])

  const {
    items,
    query,
    total,
    loading,
    refreshing,
    loadingMore,
    setQuery,
    onRefresh,
    onEndReached,
    reload,
  } = usePaginatedList<IExpense, ExpensesQueryParams>({
    initialQuery: { search: '', category: '', type: '', status: 'activo' },
    fetchPage: fetchExpenses,
    getKey: (item) => item.id_gasto,
  })

  const refreshSummary = useCallback(async () => {
    try {
      const data = await expenseService.getFinancialSummary({
        period,
        months,
        year: Number(selectedYear),
        month: Number(baseMonth),
        compareMonth: Number(compareMonth),
        compareYear: Number(compareYear),
      })
      setSummary({
        income_total: Number(data.income_total || 0),
        expenses_total: Number(data.expenses_total || 0),
        balance: Number(data.balance || 0),
      })
      setComparison(data.compare ? {
        income_total: Number(data.compare.income_total || 0),
        expenses_total: Number(data.compare.expenses_total || 0),
        balance: Number(data.compare.balance || 0),
      } : null)
      setDelta(data.delta ? {
        income_total: Number(data.delta.income_total || 0),
        expenses_total: Number(data.delta.expenses_total || 0),
        balance: Number(data.delta.balance || 0),
      } : null)
    } catch (error) {
      console.log(error)
    }
  }, [months, period, selectedYear, baseMonth, compareMonth, compareYear])

  useEffect(() => {
    refreshSummary().catch(console.log)
  }, [refreshSummary])

  const categoryLabel = (value: ExpenseCategory): string => {
    if (value === 'nomina') return 'Nómina'
    if (value === 'gasolina') return 'Gasolina'
    return 'Varios'
  }

  const handleSubmit = async () => {
    const amount = Number(form.monto)
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto mayor a 0.')
      return
    }
    if (!form.fecha || !/^\d{4}-\d{2}-\d{2}$/.test(form.fecha)) {
      Alert.alert('Fecha inválida', 'Usa formato YYYY-MM-DD.')
      return
    }
    if (form.tipo === 'recurrente' && !form.periodicidad) {
      Alert.alert('Periodicidad requerida', 'Define una periodicidad para gastos recurrentes.')
      return
    }

    try {
      setSubmitting(true)
      await expenseService.addExpense({ ...form, monto: amount })
      Alert.alert('Guardado', 'El gasto se registró correctamente.')
      setForm(emptyForm)
      await Promise.all([reload(), refreshSummary()])
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'No se pudo guardar el gasto.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelExpense = async (item: IExpense) => {
    try {
      await expenseService.removeExpense(item.id_gasto)
      await Promise.all([reload(), refreshSummary()])
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'No se pudo cancelar el gasto.')
    }
  }

  const kpis = useMemo(() => {
    const recurrentes = items.filter((item) => item.tipo === 'recurrente').length
    const ocasionales = items.filter((item) => item.tipo === 'ocasional').length
    return { recurrentes, ocasionales }
  }, [items])

  return (
    <View style={[styles.root, { backgroundColor: colors.DarkViolet300 }]}>
      <FlatList
        data={items}
        keyExtractor={(item, index) => String(item.id_gasto ?? `g-${index}`)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { onRefresh().catch(console.log) }} tintColor={colors.Morado100} />}
        onEndReachedThreshold={0.3}
        onEndReached={() => { onEndReached().catch(console.log) }}
        ListHeaderComponent={
          <View style={styles.headerPad}>
            <AppCard>
              <Text style={[styles.sectionTitle, { color: colors.Griss50, fontFamily: fonts.Inter.SemiBold }]}>Registrar gasto</Text>
              <Text style={[styles.help, { color: colors.gris300 }]}>Categorías fijas: Nómina, Gasolina y Varios.</Text>
              <FilterChips
                selected={form.categoria}
                onSelect={(id) => setForm((prev) => ({ ...prev, categoria: id as ExpenseCategory }))}
                options={[
                  { id: 'nomina', label: 'Nómina' },
                  { id: 'gasolina', label: 'Gasolina' },
                  { id: 'varios', label: 'Varios' },
                ]}
              />
              <View style={{ marginTop: 8 }}>
                <FilterChips
                  selected={form.tipo}
                  onSelect={(id) => setForm((prev) => ({ ...prev, tipo: id as ExpenseType, periodicidad: id === 'recurrente' ? (prev.periodicidad || 'mensual') : null }))}
                  options={[
                    { id: 'ocasional', label: 'Ocasional' },
                    { id: 'recurrente', label: 'Recurrente' },
                  ]}
                />
              </View>
              <TextInput
                placeholder='Monto'
                placeholderTextColor={colors.gris300}
                keyboardType='numeric'
                value={form.monto ? String(form.monto) : ''}
                onChangeText={(value) => setForm((prev) => ({ ...prev, monto: Number(value || 0) }))}
                style={[styles.input, { borderColor: `${colors.white}22`, color: colors.Griss50 }]}
              />
              <TextInput
                placeholder='Fecha (YYYY-MM-DD)'
                placeholderTextColor={colors.gris300}
                value={form.fecha}
                onChangeText={(value) => setForm((prev) => ({ ...prev, fecha: value }))}
                style={[styles.input, { borderColor: `${colors.white}22`, color: colors.Griss50 }]}
              />
              <TextInput
                placeholder='Descripcion'
                placeholderTextColor={colors.gris300}
                value={form.descripcion}
                onChangeText={(value) => setForm((prev) => ({ ...prev, descripcion: value }))}
                style={[styles.input, { borderColor: `${colors.white}22`, color: colors.Griss50 }]}
              />
              {form.tipo === 'recurrente' ? (
                <TextInput
                  placeholder='Periodicidad (ejemplo: mensual)'
                  placeholderTextColor={colors.gris300}
                  value={form.periodicidad || ''}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, periodicidad: value }))}
                  style={[styles.input, { borderColor: `${colors.white}22`, color: colors.Griss50 }]}
                />
              ) : null}
              <PrimaryButton
                title={submitting ? 'Guardando...' : 'Guardar gasto'}
                onPress={() => { handleSubmit().catch(console.log) }}
                containerStyle={{ marginTop: 6, paddingVertical: 9 }}
                backgroundButton={colors.Morado600}
              />
            </AppCard>

            <View style={styles.sectionGap}>
              <AppCard>
                <Text style={[styles.sectionTitle, { color: colors.Griss50, fontFamily: fonts.Inter.SemiBold }]}>Finanzas</Text>
                <Text style={[styles.help, { color: colors.gris300 }]}>
                  {period === 'current_month'
                    ? 'Acumulado del mes actual'
                    : period === 'previous_month'
                      ? 'Acumulado del mes anterior'
                      : `Comparativo ${baseMonth}/${selectedYear} vs ${compareMonth}/${compareYear}`}
                </Text>
                <View style={styles.row}>
                  <PrimaryButton
                    title='Mes actual'
                    onPress={() => {
                      const current = new Date()
                      const prev = new Date(current.getFullYear(), current.getMonth() - 1, 1)
                      setPeriod('current_month')
                      setMonths(1)
                      setSelectedYear(String(current.getFullYear()))
                      setBaseMonth(String(current.getMonth() + 1))
                      setCompareMonth(String(prev.getMonth() + 1))
                      setCompareYear(String(prev.getFullYear()))
                    }}
                    containerStyle={styles.rangeButton}
                    backgroundButton={period === 'current_month' ? colors.Morado600 : `${colors.white}14`}
                  />
                  <PrimaryButton
                    title='Mes anterior'
                    onPress={() => {
                      const current = new Date()
                      const prev = new Date(current.getFullYear(), current.getMonth() - 1, 1)
                      const prev2 = new Date(current.getFullYear(), current.getMonth() - 2, 1)
                      setPeriod('previous_month')
                      setMonths(1)
                      setSelectedYear(String(prev.getFullYear()))
                      setBaseMonth(String(prev.getMonth() + 1))
                      setCompareMonth(String(prev2.getMonth() + 1))
                      setCompareYear(String(prev2.getFullYear()))
                    }}
                    containerStyle={styles.rangeButton}
                    backgroundButton={period === 'previous_month' ? colors.Morado600 : `${colors.white}14`}
                  />
                  <PrimaryButton
                    title='Comparar'
                    onPress={() => { setPeriod('rolling_months'); setMonths(1) }}
                    containerStyle={styles.rangeButton}
                    backgroundButton={period === 'rolling_months' ? colors.Morado600 : `${colors.white}14`}
                  />
                </View>
                {period === 'rolling_months' ? (
                  <View style={styles.sectionGap}>
                    <TextInput
                      placeholder='Año (ejemplo: 2026)'
                      placeholderTextColor={colors.gris300}
                      keyboardType='numeric'
                      value={selectedYear}
                      onChangeText={setSelectedYear}
                      style={[styles.input, { borderColor: `${colors.white}22`, color: colors.Griss50 }]}
                    />
                    <Text style={[styles.help, { color: colors.gris300 }]}>Mes base</Text>
                    <FilterChips
                      selected={baseMonth}
                      onSelect={setBaseMonth}
                      options={monthOptions}
                    />
                    <Text style={[styles.help, { color: colors.gris300 }]}>Mes a comparar</Text>
                    <TextInput
                      placeholder='Año a comparar (ejemplo: 2024)'
                      placeholderTextColor={colors.gris300}
                      keyboardType='numeric'
                      value={compareYear}
                      onChangeText={setCompareYear}
                      style={[styles.input, { borderColor: `${colors.white}22`, color: colors.Griss50 }]}
                    />
                    <FilterChips
                      selected={compareMonth}
                      onSelect={setCompareMonth}
                      options={monthOptions}
                    />
                  </View>
                ) : null}
                <View style={styles.kpiRow}>
                  <KpiCard label='Ingresos' value={`$${summary.income_total.toFixed(2)}`} />
                  <KpiCard label='Gastos' value={`$${summary.expenses_total.toFixed(2)}`} />
                  <KpiCard label='Balance' value={`$${summary.balance.toFixed(2)}`} />
                </View>
                {comparison && delta ? (
                  <View style={styles.kpiRow}>
                    <KpiCard label='Ingreso comp.' value={`$${comparison.income_total.toFixed(2)}`} hint={`Delta: $${delta.income_total.toFixed(2)}`} />
                    <KpiCard label='Gasto comp.' value={`$${comparison.expenses_total.toFixed(2)}`} hint={`Delta: $${delta.expenses_total.toFixed(2)}`} />
                    <KpiCard label='Balance comp.' value={`$${comparison.balance.toFixed(2)}`} hint={`Delta: $${delta.balance.toFixed(2)}`} />
                  </View>
                ) : null}
              </AppCard>
            </View>

            <View style={styles.sectionGap}>
              <SearchInput
                value={query.search ?? ''}
                placeholder='Buscar por descripcion o categoria'
                onChangeText={(value) => setQuery((prev: ExpensesQueryParams) => ({ ...prev, search: value }))}
              />
              <FilterChips
                selected={query.category ?? ''}
                onSelect={(id) => setQuery((prev: ExpensesQueryParams) => ({ ...prev, category: id as ExpensesQueryParams['category'] }))}
                options={[
                  { id: '', label: 'Todas' },
                  { id: 'nomina', label: 'Nómina' },
                  { id: 'gasolina', label: 'Gasolina' },
                  { id: 'varios', label: 'Varios' },
                ]}
              />
              <View style={{ marginTop: 8 }}>
                <FilterChips
                  selected={query.type ?? ''}
                  onSelect={(id) => setQuery((prev: ExpensesQueryParams) => ({ ...prev, type: id as ExpensesQueryParams['type'] }))}
                  options={[
                    { id: '', label: 'Todos' },
                    { id: 'recurrente', label: 'Recurrentes' },
                    { id: 'ocasional', label: 'Ocasionales' },
                  ]}
                />
              </View>
              <View style={styles.kpiRow}>
                <KpiCard label='Registros cargados' value={String(items.length)} hint={`Total: ${total}`} />
                <KpiCard label='Recurrentes' value={String(kpis.recurrentes)} />
                <KpiCard label='Ocasionales' value={String(kpis.ocasionales)} />
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.itemPad}>
            <AppCard>
              <Text style={[styles.expenseTitle, { color: colors.Griss50, fontFamily: fonts.Inter.SemiBold }]}>
                {categoryLabel(item.categoria)} · {item.tipo}
              </Text>
              <Text style={[styles.expenseAmount, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>
                ${Number(item.monto || 0).toFixed(2)}
              </Text>
              <Text style={[styles.help, { color: colors.gris300 }]}>
                Fecha: {item.fecha} · Estado: {item.status}
              </Text>
              <Text style={[styles.help, { color: colors.gris300 }]}>
                {item.descripcion || 'Sin descripcion'}
              </Text>
              {item.tipo === 'recurrente' ? (
                <Text style={[styles.help, { color: colors.gris300 }]}>Periodicidad: {item.periodicidad || 'mensual'}</Text>
              ) : null}
              {item.status === 'activo' ? (
                <PrimaryButton
                  title='Cancelar gasto'
                  onPress={() => { handleCancelExpense(item).catch(console.log) }}
                  containerStyle={{ marginTop: 10, paddingVertical: 7, alignSelf: 'flex-start' }}
                  backgroundButton={colors.red}
                />
              ) : null}
            </AppCard>
          </View>
        )}
        ListFooterComponent={loadingMore ? <Text style={[styles.loadMore, { color: colors.gris300 }]}>Cargando más...</Text> : null}
        ListEmptyComponent={!loading ? <EmptyState title='Sin gastos registrados.' subtitle='Agrega gastos para iniciar el seguimiento financiero.' /> : null}
      />
      <Loading loading={loading || submitting} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingBottom: 32 },
  headerPad: { paddingHorizontal: 16, paddingTop: 14 },
  sectionTitle: { fontSize: 16 },
  help: { fontSize: 12, marginTop: 5 },
  sectionGap: { marginTop: 12 },
  row: { flexDirection: 'row', marginTop: 10 },
  rangeButton: { paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, minWidth: 58 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 10, marginTop: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
  itemPad: { paddingHorizontal: 16, marginTop: 12 },
  expenseTitle: { fontSize: 15 },
  expenseAmount: { fontSize: 17, marginTop: 6 },
  loadMore: { textAlign: 'center', marginVertical: 14, fontSize: 12 },
})

export default Expenses
