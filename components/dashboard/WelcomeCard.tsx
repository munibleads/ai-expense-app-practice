'use client';

import { Box, Card, Typography } from '@mui/material';

interface WelcomeCardProps {
  name: string;
  message: string;
}

export default function WelcomeCard({ name, message }: WelcomeCardProps) {
  return (
    <Card
      sx={{
        p: 3,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/images/green-mountain-pexels.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
          zIndex: 1,
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 1, 
            fontWeight: 600,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Welcome back 👋
          <br /> {name}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'rgba(255,255,255,0.9)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
            maxWidth: '80%',
            lineHeight: 1.6,
          }}
        >
          {message}
        </Typography>
      </Box>
    </Card>
  );
} 