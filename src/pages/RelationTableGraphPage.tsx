import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import {
    ReactFlow,
    Background,
    useNodesState,
    useEdgesState,
    MiniMap,
    Controls,
    MarkerType,
    Panel,
    type Node,
    type Edge,
} from '@xyflow/react'
import { 
    useRelationTableGraph, 
    useRelationTableLoadSnapshot, 
    useRelationTableSaveSnapshot,
    useSync, 
    IRelationTableField,
} from '../services/docs_flow'
import RelationFieldNode from '../components/react_flow/RelationFieldNode'
import SimpleFloatingEdge from '../components/react_flow/SimpleFloatingEdge'
import StoreNode from '../components/react_flow/StoreNode'
import TableNode from '../components/react_flow/TableNode'
import '@xyflow/react/dist/style.css'

const STORE_MARGIN: number = 100
const TABLE_WIDTH: number = 200
const TABLE_MARGIN: number = 50
const FIELD_HEIGHT: number = 50

const nodeTypes = {
    RelationFieldNode,
    StoreNode,
    TableNode,
}   

const edgeTypes = {
    SimpleFloatingEdge,
}

function prepareNodes(fields: IRelationTableField[]): Node[] {

    // Сбор необходимой информации для отрисовки блоков Store и Tables
    let statsByStores: Map<number, {name: string, tableIds: Set<number>, maxFields: number}> = new Map()
    let statsByTables: Map<number, {name: string, fieldIds: Set<number>, storeId: number}> = new Map()
    fields.forEach(field => {
        if (!statsByStores.has(field.store_id)) {
            statsByStores.set(field.store_id, {name: field.store_name, tableIds: new Set(), maxFields: 0})
        }
        let storeStats = statsByStores.get(field.store_id)
        storeStats?.tableIds.add(field.table_id)
        if (storeStats) {
            storeStats.name = field.store_name
        }

        if (!statsByTables.has(field.table_id)) {
            statsByTables.set(field.table_id, {name: field.table_name, fieldIds: new Set(), storeId: field.store_id})
        }
        let tableStats = statsByTables.get(field.table_id)
        tableStats?.fieldIds.add(field.id)
        if (tableStats) {
            tableStats.name = field.table_name
            tableStats.storeId = field.store_id
        }
    })

    statsByTables.forEach((tableValue, tableId) => {
        let storeStats = statsByStores.get(tableValue.storeId)
        if (storeStats) {
            storeStats.maxFields = storeStats.maxFields > tableValue.fieldIds.size ? storeStats.maxFields : tableValue.fieldIds.size
        }
    })

    let preparedNodes: Node[] = []

    // Отрисовка области Stores
    let currentStoreMargin: number = 0
    statsByStores.forEach((storeValue, storeId) => {
        const projectWidth: number = storeValue.tableIds.size * TABLE_WIDTH + (storeValue.tableIds.size + 1) * TABLE_MARGIN
        preparedNodes.push({
            id: `s.${storeId}`,
            type: 'StoreNode',
            data: { 
                label: storeValue.name,
            },
            position: { x: currentStoreMargin, y: 0 },
            style: { 
                width: projectWidth, 
                height: STORE_MARGIN * 2 + storeValue.maxFields * FIELD_HEIGHT,
                border: '1px solid gray',
            }
        })
        currentStoreMargin += projectWidth + STORE_MARGIN
    })

    // Отрисовка облисти таблиц
    let tableMarginByProject: Map<number, number> = new Map()
    statsByTables.forEach((tableValue, tableId) => {
        if (!tableMarginByProject.has(tableValue.storeId)) {
            tableMarginByProject.set(tableValue.storeId, TABLE_MARGIN)
        }

        let currentTableMargin = tableMarginByProject.get(tableValue.storeId) ?? TABLE_MARGIN
        const tableHeight: number = TABLE_MARGIN + tableValue.fieldIds.size * FIELD_HEIGHT
        preparedNodes.push({
            id: `t.${tableId}`,
            type: 'TableNode',
            data: { 
                label: tableValue.name, 
                fixedHeight: tableHeight,
            },
            position: { x: currentTableMargin, y: STORE_MARGIN },
            parentId: `s.${tableValue.storeId}`,
            extent: 'parent',
            style: { width: TABLE_WIDTH, height: tableHeight, border: '1px solid #0064a5' }
        })
        currentTableMargin += TABLE_MARGIN + TABLE_WIDTH
        tableMarginByProject.set(tableValue.storeId, currentTableMargin)
    })

    // Отрисовка полей
    fields.sort((lhs, rhs) => {
        if (lhs.order > rhs.order) {
            return 1
        } else if (lhs.order < rhs.order) {
            return -1
        }
        return 0
    })
    let fieldOrderByTable: Map<number, number> = new Map()
    fields.forEach(field => {
        if (!fieldOrderByTable.has(field.table_id)) {
            fieldOrderByTable.set(field.table_id, 0)
        }
        let currentFieldOrder: number = fieldOrderByTable.get(field.table_id) ?? 0
        preparedNodes.push({
            id: `f.${field.id}`,
            type: 'RelationFieldNode',
            data: { 
                label: field.name, 
                type: field.type, 
            },
            position: { x: 0, y: TABLE_MARGIN + currentFieldOrder * FIELD_HEIGHT },
            parentId: `t.${field.table_id}`,
            draggable: false,
            style: { width: TABLE_WIDTH, height: FIELD_HEIGHT, borderTop: '1px solid #0064a5' }
        })
        fieldOrderByTable.set(field.table_id, ++currentFieldOrder)
    })

    return preparedNodes
}

function prepareEdges(fields: IRelationTableField[]): Edge[] {
    let preparedEdges: Edge[] = []
    fields.forEach(field => {
        if (field.field_id) {
            preparedEdges.push({
                id: `f.${field.id}->f.${field.field_id}`,
                type: 'SimpleFloatingEdge',
                source: `f.${field.id}`,
                target: `f.${field.field_id}`,
                sourceHandle: 'c',
                targetHandle: 'a',
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: 'black',
                },
                style: {
                    strokeWidth: 1,
                    stroke: 'black',
                }
            })
        }
    })
    return preparedEdges
}

export default function RelationTableGraphPage() {

    const { relationTableId } = useParams()
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

    const [fetchGraph, setFetchGraph] = useState<boolean>(false)
    const { data: snapshot, isFetched: snapshotIsFetched } = useRelationTableLoadSnapshot(relationTableId || '')
    const { data: fields, refetch: refetchFields } = useRelationTableGraph(relationTableId || '', fetchGraph)
    const { mutate } = useRelationTableSaveSnapshot(relationTableId || '')
    const { mutate: syncData } = useSync()

    useEffect(() => {
        if (snapshotIsFetched && snapshot) {
            setNodes(snapshot.nodes)
            setEdges(snapshot.edges)
        } else if (snapshotIsFetched) {
            setFetchGraph(true)
        }
    }, [snapshotIsFetched, snapshot])

    useEffect(() => {
        if (fetchGraph && fields) {
            setNodes(prepareNodes(fields))
            setEdges(prepareEdges(fields))
            setFetchGraph(false)
        }
    }, [fields])

    function saveSnapshot() {
        mutate({nodes: nodes, edges: edges})
    }

    function SyncData() {
        syncData()
        refetchFields()
        setFetchGraph(true)
    }

    return (
        <Box sx={{height: '100vh', width: '100vw'}}>
            <ReactFlow
                nodes={nodes}
                onNodesChange={onNodesChange}
                nodeTypes={nodeTypes}
                edges={edges}
                onEdgesChange={onEdgesChange}
                edgeTypes={edgeTypes}
                fitView
                minZoom={0.5}
                maxZoom={4}
            >
                <MiniMap />
                <Controls />
                <Background color='#E6E6E6' />
                <Panel position='top-right'>
                    <Button onClick={saveSnapshot}>Save</Button>
                    <Button onClick={SyncData}>Sync</Button>
                </Panel>
            </ReactFlow>
        </Box>
    )
}