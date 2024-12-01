import { Link, useParams } from 'react-router-dom'
import { Box, Card, CardContent, Typography } from '@mui/material'

export default function ProjectPage() {

    const { projectId } = useParams()

    return (
        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1vw'}} >
            <Card>
                <CardContent>
                    <Link
                        to={`/projects/${projectId}/stores/`}
                        style={{textDecoration: 'none'}}
                    >
                        <Typography textAlign='center' fontSize={36}>Stores</Typography>
                    </Link>
                </CardContent>
            </Card>
        </Box>
    )
}