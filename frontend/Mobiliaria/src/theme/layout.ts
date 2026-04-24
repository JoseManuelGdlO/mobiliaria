import { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'

export const BREAKPOINTS = {
  tablet: 768,
  largeTablet: 1024,
} as const

export interface LayoutMetrics {
  width: number
  height: number
  isTablet: boolean
  isLargeTablet: boolean
  isLandscape: boolean
  contentMaxWidth: number
  contentHorizontalPadding: number
  sectionGap: number
  listColumns: number
  modalMaxHeight: number
}

export const getLayoutMetrics = (width: number, height: number): LayoutMetrics => {
  const isTablet = width >= BREAKPOINTS.tablet
  const isLargeTablet = width >= BREAKPOINTS.largeTablet
  const isLandscape = width > height
  const contentHorizontalPadding = isTablet ? (isLandscape ? 28 : 22) : 16
  const contentMaxWidth = width
  const sectionGap = isTablet ? 16 : 12
  const listColumns = isLargeTablet ? 3 : isTablet ? 2 : 1
  const modalMaxHeight = Math.max(320, height - (isTablet ? 80 : 100))

  return {
    width,
    height,
    isTablet,
    isLargeTablet,
    isLandscape,
    contentMaxWidth,
    contentHorizontalPadding,
    sectionGap,
    listColumns,
    modalMaxHeight,
  }
}

export const useLayoutMetrics = (): LayoutMetrics => {
  const { width, height } = useWindowDimensions()
  return useMemo(() => getLayoutMetrics(width, height), [width, height])
}

