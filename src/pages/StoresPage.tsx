import { Link, useParams } from 'react-router-dom'
import { Box, Card, CardContent, Typography } from '@mui/material'
import { useStoresList } from '../services/docs_flow'

export default function StoresPage() {

    const { projectId } = useParams()
    const { data: stores } = useStoresList(projectId || '')

    return (
        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1vw'}} >
            { stores && stores.map(store => {
                return (
                    <Card key={store.id}>
                        <CardContent>
                            <Link
                                to={`/stores/${store.id}/relation_tables/`}
                                style={{textDecoration: 'none'}}
                            >
                                <Typography textAlign='center' fontSize={36}>{store.name}</Typography>
                            </Link>
                            <Typography textAlign='center' fontSize={24}>{store.type}</Typography>
                        </CardContent>
                    </Card>
                )
            })}
        </Box>
    )
}