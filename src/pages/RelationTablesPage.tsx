import { Link, useParams } from 'react-router-dom'
import { Box, Card, CardContent, Typography } from '@mui/material'
import { useRelationTablesList } from '../services/docs_flow'

export default function RelationTablesPage() {

    const { storeId } = useParams()
    const { data: relationTables } = useRelationTablesList(storeId || '')

    return (
        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1vw'}} >
            { relationTables && relationTables.map(relationTable => {
                return (
                    <Card key={relationTable.id}>
                        <CardContent>
                            <Link
                                to={`/relation_tables/${relationTable.id}/graph/`}
                                style={{textDecoration: 'none'}}
                            >
                                <Typography textAlign='center' fontSize={36}>{relationTable.name}</Typography>
                            </Link>
                        </CardContent>
                    </Card>
                )
            })}
        </Box>
    )
}