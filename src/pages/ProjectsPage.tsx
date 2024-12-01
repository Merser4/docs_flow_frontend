import { Link } from 'react-router-dom'
import { Box, Card, CardContent, Typography } from '@mui/material'
import { useProjectsList } from '../services/docs_flow'

export default function ProjectsPage() {

    const { data: projects } = useProjectsList()

    return (
        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1vw'}} >
            { projects && projects.map(project => {
                return (
                    <Card key={project.id}>
                        <CardContent>
                            <Link
                                to={`/projects/${project.id}/`}
                                style={{textDecoration: 'none'}}
                            >
                                <Typography textAlign='center' fontSize={36}>{project.name}</Typography>
                            </Link>
                        </CardContent>
                    </Card>
                )
            })}
        </Box>
    )
}