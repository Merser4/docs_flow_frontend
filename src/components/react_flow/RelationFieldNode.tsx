import { memo } from 'react'
import { Typography, Box } from '@mui/material'
import { NodeProps, Handle, Position } from '@xyflow/react'
 
interface Props extends NodeProps {
    data: {
        label: string,
        type: string,
    }
}

function RelationFieldNode({ data, isConnectable, ...props }: Props) {

    return (
        <Box height='100%'>
            <Typography 
                textAlign='center' 
                fontSize={16}
                padding={1}
            >
                {data.label} <Typography component='span' color='#0064a5'>{data.type}</Typography>
            </Typography>
            <Handle type='target' position={Position.Left} id='a' />
            <Handle type='target' position={Position.Right} id='b' />
            <Handle type='source' position={Position.Left} id='c' />
            <Handle type='source' position={Position.Right} id='d' />
        </Box>
    )
}
 
export default memo(RelationFieldNode)