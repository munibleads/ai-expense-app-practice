'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Stack,
  Divider,
  Button,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTheme } from '@mui/material/styles';

// Sample chat messages for demonstration
const sampleMessages = [
  {
    role: 'assistant',
    content: 'Hello! I\'m your AI assistant for expense management. How can I help you today?',
  },
  {
    role: 'user',
    content: 'Can you help me analyze my recent expenses?',
  },
  {
    role: 'assistant',
    content: 'I\'d be happy to help analyze your expenses. I notice that your highest spending category this month is "Office Supplies" at SAR 67,900. This is 43% higher than last month. Would you like me to provide a detailed breakdown of your expenses or suggest ways to optimize your spending?',
  },
];

export default function ChatPage() {
  const theme = useTheme();
  const [messages] = useState(sampleMessages);
  const [inputValue, setInputValue] = useState('');

  return (
    <Container maxWidth="xl" sx={{ height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          height: 'calc(100vh - 90px)', // Adjust based on your layout
          pt: 3,
          pb: 3,
          gap: 3,
        }}
      >
        {/* Left Sidebar - Chat History */}
        <Paper
          sx={{
            width: 260,
            p: 2,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            gap: 2,
            bgcolor: '#ffffff',
            borderRadius: 2,
          }}
        >
          <Button
            variant="contained"
            sx={{
              bgcolor: '#2e7d32',
              color: 'white',
              '&:hover': {
                bgcolor: '#1b5e20',
              },
            }}
          >
            New Chat
          </Button>

          <Divider />

          <Typography variant="subtitle2" color="text.secondary" sx={{ px: 1 }}>
            Previous Chats
          </Typography>

          <Stack spacing={1}>
            {['Expense Analysis', 'Budget Planning', 'Cost Optimization'].map((chat) => (
              <Button
                key={chat}
                sx={{
                  justifyContent: 'flex-start',
                  px: 2,
                  py: 1,
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  },
                }}
              >
                {chat}
              </Button>
            ))}
          </Stack>
        </Paper>

        {/* Main Chat Area */}
        <Paper
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#ffffff',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Chat Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Chat with AI Assistant
            </Typography>
            <IconButton color="inherit" size="small">
              <DeleteOutlineIcon />
            </IconButton>
          </Box>

          {/* Messages Area */}
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              bgcolor: '#f8f9fa',
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start',
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: message.role === 'assistant' ? '#2e7d32' : '#f5f5f5',
                    color: message.role === 'assistant' ? 'white' : '#2e7d32',
                  }}
                >
                  {message.role === 'assistant' ? (
                    <SmartToyOutlinedIcon />
                  ) : (
                    <PersonOutlineOutlinedIcon />
                  )}
                </Avatar>
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    bgcolor: message.role === 'assistant' ? '#ffffff' : '#e8f5e9',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1">{message.content}</Typography>
                </Paper>
              </Box>
            ))}
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: '#ffffff',
            }}
          >
            <Paper
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1,
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                borderRadius: 2,
              }}
            >
              <TextField
                fullWidth
                placeholder="Type your message..."
                variant="standard"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  sx: { px: 1 },
                }}
              />
              <IconButton
                color="primary"
                sx={{
                  bgcolor: '#2e7d32',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#1b5e20',
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </Paper>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', textAlign: 'center', mt: 1 }}
            >
              AI Assistant may produce inaccurate information about expenses
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 