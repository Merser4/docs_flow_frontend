import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProjectPage from './pages/ProjectPage'
import ProjectsPage from './pages/ProjectsPage'
import RelationTableGraphPage from './pages/RelationTableGraphPage'
import RelationTablesPage from './pages/RelationTablesPage'
import StoresPage from './pages/StoresPage'

const router = createBrowserRouter([
    {
        path: '/',
        element: <ProjectsPage />,
    },
    {
        path: '/projects/:projectId/',
        element: <ProjectPage />,
    },
    {
        path: '/projects/:projectId/stores/',
        element: <StoresPage />,
    },
    {
        path: '/stores/:storeId/relation_tables/',
        element: <RelationTablesPage />,
    },
    {
        path: '/relation_tables/:relationTableId/graph/',
        element: <RelationTableGraphPage />,
    },
])

const queryClient = new QueryClient()

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
)
root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </React.StrictMode>
)
