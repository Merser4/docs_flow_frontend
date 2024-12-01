import { memo } from 'react'
import { Typography } from '@mui/material'
import { NodeResizer, NodeProps } from '@xyflow/react'
 
interface Props extends NodeProps {
    data: {
        label: string,
    }
}

function StoreNode({ data, selected, ...props }: Props) {
    return (
        <>
            <NodeResizer
                color='red'
                isVisible={selected}
                minWidth={100}
                minHeight={100}
            />
            <Typography textAlign='center' fontSize={36} padding={1}>{data.label}</Typography>
        </>
    )
}
 
export default memo(StoreNode)