import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface PaginatedData<T> {
  items: T[]
  hasMore: boolean
  total?: number
}

interface UsePaginatedListParams<T, Q> {
  initialPageSize?: number
  initialQuery: Q
  fetchPage: (params: Q & { page: number, pageSize: number }) => Promise<PaginatedData<T>>
  getKey: (item: T) => string | number
}

export const usePaginatedList = <T, Q extends Record<string, any>>({
  initialPageSize = 20,
  initialQuery,
  fetchPage,
  getKey,
}: UsePaginatedListParams<T, Q>) => {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState<Q>(initialQuery)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fetchPageRef = useRef(fetchPage)
  const getKeyRef = useRef(getKey)

  useEffect(() => {
    fetchPageRef.current = fetchPage
  }, [fetchPage])

  useEffect(() => {
    getKeyRef.current = getKey
  }, [getKey])

  const mergeDedup = useCallback((previous: T[], incoming: T[]) => {
    const map = new Map<string | number, T>()
    previous.forEach((item) => map.set(getKeyRef.current(item), item))
    incoming.forEach((item) => map.set(getKeyRef.current(item), item))
    return Array.from(map.values())
  }, [])

  const load = useCallback(async (targetPage: number, mode: 'initial' | 'refresh' | 'loadMore') => {
    if (mode === 'initial') setLoading(true)
    if (mode === 'refresh') setRefreshing(true)
    if (mode === 'loadMore') setLoadingMore(true)

    try {
      setError(null)
      const response = await fetchPageRef.current({ ...query, page: targetPage, pageSize: initialPageSize })
      setHasMore(response.hasMore)
      setTotal(response.total ?? 0)
      setPage(targetPage)
      setItems((prev) => (targetPage === 1 ? response.items : mergeDedup(prev, response.items)))
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo cargar la información')
      setHasMore(false)
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }, [initialPageSize, mergeDedup, query])

  useEffect(() => {
    void load(1, 'initial')
  }, [query, load])

  const onRefresh = useCallback(async () => {
    await load(1, 'refresh')
  }, [load])

  const onEndReached = useCallback(async () => {
    if (loading || refreshing || loadingMore || !hasMore) return
    await load(page + 1, 'loadMore')
  }, [hasMore, load, loading, loadingMore, page, refreshing])

  return useMemo(() => ({
    items,
    query,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    total,
    error,
    setQuery,
    onRefresh,
    onEndReached,
    reload: () => load(1, 'initial'),
  }), [hasMore, items, load, loading, loadingMore, onEndReached, onRefresh, query, total])
}
