import { memo, useState } from 'react'
import { Typography, Box } from '@mui/material'
import { NodeProps, NodeResizer, ResizeParams, ResizeDragEvent, useNodes } from '@xyflow/react'
 
interface Props extends NodeProps {
    data: {
        label: string,
        fixedHeight: number,
    }
}

function TableNode({ id, data, selected, ...props }: Props) {

    const [maxHeight, setMaxHeight] = useState<number>(data.fixedHeight)
    const nodes = useNodes().filter(node => node.parentId === id)

    return (
        <Box>
            <NodeResizer
                color='red'
                isVisible={selected}
                minWidth={100}
                minHeight={maxHeight}
                maxHeight={maxHeight}
                onResizeEnd={(event: ResizeDragEvent, params: ResizeParams) => {
                    nodes.forEach(node => {
                        if (node.style) {
                            node.style.width = params.width
                        }
                    })
                }}
            />
            <Typography textAlign='center' fontSize={24} padding={1}>{data.label}</Typography>
        </Box>
    )
}
 
export default memo(TableNode)