import { getBezierPath, useInternalNode, Position, EdgeProps, InternalNode } from '@xyflow/react'

// returns the position (top,right,bottom or right) passed node compared to
function getParams(nodeA: InternalNode, nodeB: InternalNode): [number, number, Position] {
    const centerA = getNodeCenter(nodeA)
    const centerB = getNodeCenter(nodeB)
    let position: Position = centerA.x > centerB.x ? Position.Left : Position.Right
    const [x, y] = getHandleCoordsByPosition(nodeA, position)
    return [x, y, position]
  }
   
function getHandleCoordsByPosition(node: InternalNode, handlePosition: Position): [number, number] {
    // all handles are from type source, that's why we use handleBounds.source here
    const handle = node.internals.handleBounds?.source?.find(
        (h) => h.position === handlePosition,
    )

    let offsetX = (handle?.width ?? 0) / 2
    let offsetY = (handle?.height ?? 0) / 2

    switch (handlePosition) {
        case Position.Left:
        offsetX = 0
        break
        case Position.Right:
        offsetX = handle?.width ?? 0
        break
    }

    const x = node.internals.positionAbsolute.x + (handle?.x ?? 0) + offsetX
    const y = node.internals.positionAbsolute.y + (handle?.y ?? 0) + offsetY

    return [x, y]
}
   
function getNodeCenter(node: InternalNode) {
    return {
        x: node.internals.positionAbsolute.x + (node.measured.width ?? 0) / 2,
        y: node.internals.positionAbsolute.y + (node.measured.height ?? 0) / 2,
    }
}
   
// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: InternalNode, target: InternalNode) {
    const [sx, sy, sourcePos] = getParams(source, target)
    const [tx, ty, targetPos] = getParams(target, source)

    return {
        sx,
        sy,
        tx,
        ty,
        sourcePos,
        targetPos,
    }
}

export default function SimpleFloatingEdge({ id, source, target, markerEnd, style }: EdgeProps) {
    const sourceNode = useInternalNode(source)
    const targetNode = useInternalNode(target)

    if (!sourceNode || !targetNode) {
        return null
    }

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
        sourceNode,
        targetNode,
    )

    const [edgePath] = getBezierPath({
        sourceX: sx,
        sourceY: sy,
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        targetX: tx,
        targetY: ty,
    })

    return (
        <path
            id={id}
            className="react-flow__edge-path"
            d={edgePath}
            strokeWidth={5}
            markerEnd={markerEnd}
            style={style}
        />
    )
}