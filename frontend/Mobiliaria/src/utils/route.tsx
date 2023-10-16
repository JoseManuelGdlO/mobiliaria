export const getActiveRouteState = function (route: NavigationRouteState | PurpleRoute | FluffyRoute): NavigationRouteState | PurpleRoute | FluffyRoute {
  if ('state' in route && route.state !== undefined) {
    const routes = route.state.routes[route.state.index]
    return getActiveRouteState(routes)
  } else {
    return route
  }
}

export interface NavigationRoute {
  state: NavigationRouteState
}

export interface NavigationRouteState {
  index: number
  routeNames: string[]
  routes: PurpleRoute[]
  state?: NavigationRouteState
}

export interface PurpleRoute {
  key: string
  name: string
  state: RouteState
}

export interface RouteState {
  stale: boolean
  type: string
  key: string
  index: number
  routeNames: string[]
  routes: FluffyRoute[]
}

export interface FluffyRoute {
  key: string
  name: string
  params?: any
}
