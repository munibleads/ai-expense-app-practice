'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  Avatar,
  TextField,
  Button,
  Divider,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LoadingSpinner from '@/app/components/LoadingSpinner';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
}));

export default function ProfilePage() {
  const [loading, setLoading] = React.useState(false);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ 
            color: 'text.primary',
            fontWeight: 600,
            mb: 3,
          }}
        >
          Profile
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Overview Card */}
          <Grid item xs={12} md={4}>
            <StyledCard>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <Avatar
                    src="/avatars/avatar1.jpg"
                    sx={{ 
                      width: 120, 
                      height: 120,
                      border: '4px solid #fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Button
                    size="small"
                    sx={{
                      minWidth: 'unset',
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: '#2e7d32',
                      color: 'white',
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      '&:hover': {
                        bgcolor: '#1b5e20',
                      },
                    }}
                  >
                    <CameraAltIcon fontSize="small" />
                  </Button>
                </Box>
                
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                  John Doe
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Software Engineer at Tech Corp
                </Typography>
                
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  sx={{ 
                    borderColor: '#2e7d32',
                    color: '#2e7d32',
                    '&:hover': {
                      borderColor: '#1b5e20',
                      bgcolor: 'rgba(46, 125, 50, 0.04)',
                    },
                  }}
                >
                  Edit Profile
                </Button>
              </Box>
            </StyledCard>
          </Grid>

          {/* Personal Information Card */}
          <Grid item xs={12} md={8}>
            <StyledCard>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    defaultValue="John"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    defaultValue="Doe"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    defaultValue="john.doe@example.com"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    defaultValue="+1 234 567 8900"
                    disabled
                  />
                </Grid>
              </Grid>
            </StyledCard>

            {/* Work Information Card */}
            <StyledCard sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Work Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    defaultValue="Tech Corp"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Position"
                    defaultValue="Software Engineer"
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Department"
                    defaultValue="Engineering"
                    disabled
                  />
                </Grid>
              </Grid>
            </StyledCard>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
} 