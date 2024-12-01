import { type Node, type Edge } from '@xyflow/react'
import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'

const BASE_URL: string = process.env.REACT_APP_DOCS_FLOW_URL || ''

export interface IProject {
    id: number
    name: string
}

export interface IStore {
    id: number
    name: string
    type: string
    project_id: number
}

export interface IRelationTable {
    id: number
    name: string
    store_id: number
}

export interface IRelationTableField {
    id: number
    name: string
    type: string
    order: number
    field_id: number | null
    table_id: number
    table_name: string
    store_id: number
    store_name: string
}

export function useProjectsList() {
    const { data } = useQuery({
        queryKey: ['projects'],
        queryFn: () => { return axios.get<IProject[]>(`${BASE_URL}api/v1/projects/`) },
        select: data => data.data
    })

    return { data }
}

export function useStoresList(projectId: string) {
    const { data } = useQuery({
        queryKey: ['stores', projectId],
        queryFn: () => { return axios.get<IStore[]>(`${BASE_URL}api/v1/projects/${projectId}/stores/`) },
        select: data => data.data,
        enabled: !!projectId
    })

    return { data }
}

export function useRelationTablesList(storeId: string) {
    const { data } = useQuery({
        queryKey: ['relationTables', storeId],
        queryFn: () => { return axios.get<IRelationTable[]>(`${BASE_URL}api/v1/stores/${storeId}/relation_tables/`) },
        select: data => data.data,
        enabled: !!storeId
    })

    return { data }
}

export function useRelationTableGraph(relationTableId: string, fetchGraph: boolean) {
    const { data, refetch } = useQuery({
        queryKey: ['relationTableGraph', relationTableId],
        queryFn: () => { return axios.get<IRelationTableField[]>(`${BASE_URL}api/v1/relation_tables/${relationTableId}/graph/`) },
        select: data => data.data,
        enabled: !!relationTableId && fetchGraph
    })

    return { data, refetch }
}

export function useRelationTableLoadSnapshot(relationTableId: string) {
    const { data, isFetched, isError } = useQuery({
        queryKey: ['relationTableLoadSnapshot', relationTableId],
        queryFn: () => { return axios.get(`${BASE_URL}api/v1/relation_tables/${relationTableId}/load_snapshot/`) },
        select: data => data.data,
        enabled: !!relationTableId,
        retry: 0,
    })

    return { data, isFetched, isError }
}

export function useRelationTableSaveSnapshot(relationTableId: string) {
    const { mutate, isSuccess } = useMutation({
        mutationKey: ['relationTableSaveSnapshot'],
        mutationFn: (snapshot: {nodes: Node[], edges: Edge[]}) => axios.post(`${BASE_URL}api/v1/relation_tables/${relationTableId}/save_snapshot/`, snapshot)
    })

    return { mutate, isSuccess }
}

export function useSync() {
    const { mutate, isSuccess } = useMutation({
        mutationKey: ['sync'],
        mutationFn: () => axios.post(`${BASE_URL}api/v1/sync/`)
    })

    return { mutate, isSuccess }
}