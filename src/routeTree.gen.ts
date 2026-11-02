/* eslint-disable */
// @ts-nocheck
// Generated to match the TanStack Router file routes in this boilerplate.
// Vite overwrites this file on the next dev or build.

import { Route as rootRouteImport } from './routes/__root'
import { Route as SelectTenantRouteImport } from './routes/select-tenant'
import { Route as LoginRouteImport } from './routes/login'
import { Route as AppRouteImport } from './routes/_app'
import { Route as IndexRouteImport } from './routes/index'
import { Route as AppNotesRouteImport } from './routes/_app.notes'
import { Route as AppHomeRouteImport } from './routes/_app.home'

const LoginRoute = LoginRouteImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRouteImport,
} as any)
const SelectTenantRoute = SelectTenantRouteImport.update({
  id: '/select-tenant',
  path: '/select-tenant',
  getParentRoute: () => rootRouteImport,
} as any)
const AppRoute = AppRouteImport.update({
  id: '/_app',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const AppNotesRoute = AppNotesRouteImport.update({
  id: '/notes',
  path: '/notes',
  getParentRoute: () => AppRoute,
} as any)
const AppHomeRoute = AppHomeRouteImport.update({
  id: '/home',
  path: '/home',
  getParentRoute: () => AppRoute,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/login': typeof LoginRoute
  '/select-tenant': typeof SelectTenantRoute
  '/home': typeof AppHomeRoute
  '/notes': typeof AppNotesRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/login': typeof LoginRoute
  '/select-tenant': typeof SelectTenantRoute
  '/home': typeof AppHomeRoute
  '/notes': typeof AppNotesRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/login': typeof LoginRoute
  '/select-tenant': typeof SelectTenantRoute
  '/_app': typeof AppRouteWithChildren
  '/_app/home': typeof AppHomeRoute
  '/_app/notes': typeof AppNotesRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/login' | '/select-tenant' | '/home' | '/notes'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/login' | '/select-tenant' | '/home' | '/notes'
  id:
    | '__root__'
    | '/'
    | '/login'
    | '/select-tenant'
    | '/_app'
    | '/_app/home'
    | '/_app/notes'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AppRoute: typeof AppRouteWithChildren
  LoginRoute: typeof LoginRoute
  SelectTenantRoute: typeof SelectTenantRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/select-tenant': {
      id: '/select-tenant'
      path: '/select-tenant'
      fullPath: '/select-tenant'
      preLoaderRoute: typeof SelectTenantRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_app': {
      id: '/_app'
      path: ''
      fullPath: '/'
      preLoaderRoute: typeof AppRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_app/home': {
      id: '/_app/home'
      path: '/home'
      fullPath: '/home'
      preLoaderRoute: typeof AppHomeRouteImport
      parentRoute: typeof AppRoute
    }
    '/_app/notes': {
      id: '/_app/notes'
      path: '/notes'
      fullPath: '/notes'
      preLoaderRoute: typeof AppNotesRouteImport
      parentRoute: typeof AppRoute
    }
  }
}

const AppRouteChildren = {
  AppHomeRoute: AppHomeRoute,
  AppNotesRoute: AppNotesRoute,
}

const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren)

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AppRoute: AppRouteWithChildren,
  LoginRoute: LoginRoute,
  SelectTenantRoute: SelectTenantRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { startInstance } from './start.ts'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
    config: Awaited<ReturnType<typeof startInstance.getOptions>>
  }
}
