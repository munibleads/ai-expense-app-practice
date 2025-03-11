import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Divider as MuiDivider,
  Stack,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  CircularProgress,
  Alert,
  Slider,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { SavedReceipt } from '@/app/services/receiptService';
import { formatCurrency } from '@/app/constants/expense';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
}));

const DetailRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5, 0),
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 'calc(100vh - 200px)',
  overflow: 'auto',
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  '&::-webkit-scrollbar': {
    width: '10px',
    height: '10px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[200],
    borderRadius: '5px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[400],
    borderRadius: '5px',
    '&:hover': {
      background: theme.palette.grey[500],
    },
  },
}));

const ImageWrapper = styled(Box)({
  position: 'relative',
  minWidth: '100%',
  minHeight: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ImagePreview = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  borderRadius: 8,
  transition: 'transform 0.3s ease',
  transformOrigin: 'center center',
});

const ZoomControls = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(12),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: theme.shadows[3],
  zIndex: 1200,
  backdropFilter: 'blur(4px)',
}));

const ControlDivider = styled('div')(({ theme }) => ({
  width: 1,
  height: 24,
  backgroundColor: theme.palette.divider,
  margin: theme.spacing(0, 1),
}));

interface ReceiptDetailsPanelProps {
  receipt: SavedReceipt | null;
  onClose: () => void;
  onEdit?: () => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const MIN_ZOOM = 0.5; // Minimum zoom at 50% of original size
const MAX_ZOOM = 2; // Maximum zoom at 200% of original size
const ZOOM_STEP = 0.1; // Smaller step size for finer control
const WHEEL_ZOOM_MULTIPLIER = 0.1; // Smaller multiplier for smoother mouse wheel zooming
const ROTATION_STEP = 90;

// Add new keyboard shortcut constant
const KEYBOARD_SHORTCUTS = {
  ZOOM_IN: ['ctrl+plus', 'cmd+plus'],
  ZOOM_OUT: ['ctrl+minus', 'cmd+minus'],
  RESET: ['ctrl+0', 'cmd+0'],
  ROTATE_LEFT: ['ctrl+l', 'cmd+l'],
  ROTATE_RIGHT: ['ctrl+r', 'cmd+r'],
} as const;

const ReceiptDetailsPanel: React.FC<ReceiptDetailsPanelProps> = ({ 
  receipt, 
  onClose,
  onEdit 
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!receipt) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string | undefined) => {
    switch ((status || 'Pending').toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  // Function to get image URL with cache busting
  const getImageUrl = useCallback((url: string) => {
    const timestamp = Date.now();
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${timestamp}`;
  }, []);

  // Function to handle image loading
  const loadImage = useCallback((url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      const timeoutId = setTimeout(() => {
        reject(new Error('Image load timed out'));
      }, 30000); // 30 second timeout
      
      img.onload = () => {
        clearTimeout(timeoutId);
        resolve();
      };
      
      img.onerror = (error) => {
        clearTimeout(timeoutId);
        reject(error);
      };
      
      // Add cache busting and force no-cache
      const cacheBuster = `t=${Date.now()}`;
      const separator = url.includes('?') ? '&' : '?';
      img.src = `${url}${separator}${cacheBuster}`;
    });
  }, []);

  const handleImageLoad = () => {
    setIsImageLoading(false);
    setImageError(null);
    setRetryCount(0);
  };

  const handleImageError = async () => {
    console.error('Failed to load receipt image. S3 URL:', receipt?.s3Url);
    
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      setImageError(`Loading failed. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
      
      try {
        // Add exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        await loadImage(receipt!.s3Url);
        handleImageLoad();
      } catch (error) {
        if (retryCount + 1 >= MAX_RETRIES) {
          setIsImageLoading(false);
          setImageError('Failed to load receipt image. Please try downloading the image instead.');
        } else {
          handleImageError(); // Retry again
        }
      }
    } else {
      setIsImageLoading(false);
      setImageError('Failed to load receipt image. Please try downloading the image instead.');
    }
  };

  const handleViewReceipt = async () => {
    if (!receipt?.s3Url) return;
    
    setIsImageModalOpen(true);
    setIsImageLoading(true);
    setImageError(null);
    setRetryCount(0);
    setZoom(1); // Only set zoom to 1x when first opening
    setRotation(0); // Only reset rotation when first opening
    
    try {
      await loadImage(receipt.s3Url);
      handleImageLoad();
    } catch (error) {
      handleImageError();
    }
  };

  const handleDownload = async () => {
    try {
      setIsImageLoading(true);
      const response = await fetch(receipt.s3Url);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receipt.invoiceId || receipt.id}.${blob.type.split('/')[1]}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      setImageError('Failed to download receipt image. Please try again later.');
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const handleRotateLeft = () => {
    setRotation(prev => (prev - ROTATION_STEP + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotation(prev => (prev + ROTATION_STEP) % 360);
  };

  const handleResetTransform = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (zoom > 1) {
      event.preventDefault();
      const container = event.currentTarget as HTMLElement;
      setIsDragging(true);
      setDragStart({
        x: event.clientX + container.scrollLeft,
        y: event.clientY + container.scrollTop
      });
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      event.preventDefault();
      const container = event.currentTarget as HTMLElement;
      container.scrollLeft = dragStart.x - event.clientX;
      container.scrollTop = dragStart.y - event.clientY;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (event: React.WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY * -WHEEL_ZOOM_MULTIPLIER;
      setZoom(prev => {
        const newZoom = prev + delta;
        // Add smooth clamping to prevent abrupt stops at limits
        return Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);
      });
    }
  };

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setZoom(newValue as number);
  };

  // Reset transform when modal is closed
  const handleCloseModal = () => {
    setIsImageModalOpen(false);
    setZoom(1);
    setRotation(0);
  };

  // Add useEffect for keyboard shortcuts
  useEffect(() => {
    if (!isImageModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      
      if (isCtrlOrCmd) {
        switch (event.key.toLowerCase()) {
          case '=':
          case '+':
            event.preventDefault();
            handleZoomIn();
            break;
          case '-':
            event.preventDefault();
            handleZoomOut();
            break;
          case '0':
            event.preventDefault();
            handleResetTransform();
            break;
          case 'l':
            event.preventDefault();
            handleRotateLeft();
            break;
          case 'r':
            event.preventDefault();
            handleRotateRight();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImageModalOpen, handleZoomIn, handleZoomOut, handleRotateLeft, handleRotateRight, handleResetTransform]);

  return (
    <>
      <StyledCard>
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ReceiptLongIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h6">Receipt Details</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {onEdit && (
                <Button
                  size="small"
                  onClick={onEdit}
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
              )}
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <MuiDivider sx={{ mb: 3 }} />

          {/* Status and View Receipt */}
          <Box sx={{ 
            mb: 3, 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Chip
              label={receipt.status || 'Pending'}
              color={getStatusColor(receipt.status) as any}
              variant="outlined"
              size="small"
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={handleViewReceipt}
            >
              View Receipt
            </Button>
          </Box>

          {/* Details */}
          <Stack spacing={1}>
            <DetailRow>
              <Typography color="text.secondary">Invoice/Receipt #</Typography>
              <Typography fontWeight="medium">{receipt.invoiceId}</Typography>
            </DetailRow>

            <DetailRow>
              <Typography color="text.secondary">Vendor</Typography>
              <Typography fontWeight="medium">{receipt.vendorName}</Typography>
            </DetailRow>

            <DetailRow>
              <Typography color="text.secondary">Date</Typography>
              <Typography fontWeight="medium">{formatDate(receipt.date)}</Typography>
            </DetailRow>

            <DetailRow>
              <Typography color="text.secondary">VAT Number</Typography>
              <Typography fontWeight="medium">{receipt.vatNumber || '-'}</Typography>
            </DetailRow>

            <MuiDivider sx={{ my: 2 }} />

            <DetailRow>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography fontWeight="medium">{formatCurrency(receipt.subtotal)}</Typography>
            </DetailRow>

            <DetailRow>
              <Typography color="text.secondary">VAT</Typography>
              <Typography fontWeight="medium">{formatCurrency(receipt.taxAmount)}</Typography>
            </DetailRow>

            <DetailRow>
              <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                {formatCurrency(receipt.total)}
              </Typography>
            </DetailRow>
          </Stack>

          {/* Line Items */}
          {receipt.lineItems && receipt.lineItems.length > 0 && (
            <>
              <MuiDivider sx={{ my: 3 }} />
              <Typography variant="subtitle2" gutterBottom>Line Items</Typography>
              <Stack spacing={2}>
                {receipt.lineItems.map((item, index) => (
                  <Box key={item.id || index} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body2" gutterBottom>{item.description}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(item.amount)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </>
          )}
        </Box>
      </StyledCard>

      {/* Receipt Image Modal */}
      <Dialog
        open={isImageModalOpen}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: 'calc(100vh - 64px)',
            m: 2,
            position: 'relative',
            bgcolor: 'grey.100', // Slightly darker background for better contrast
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper',
          py: 1.5,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Receipt Image</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {Math.round(zoom * 100)}%
              </Typography>
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleCloseModal}
                aria-label="close"
                sx={{ 
                  '&:hover': { 
                    bgcolor: 'grey.200',
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent 
          sx={{ 
            p: 0, 
            overflow: 'hidden',
            position: 'relative',
            bgcolor: 'grey.100',
            '& .MuiDialogContent-root': {
              overflow: 'hidden',
            },
          }}
        >
          {isImageLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          )}
          {imageError && (
            <Alert 
              severity="error" 
              sx={{ m: 2 }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={handleDownload}
                >
                  Download Instead
                </Button>
              }
            >
              {imageError}
            </Alert>
          )}
          <ImageContainer 
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <ImageWrapper>
              {receipt?.s3Url && (
                <ImagePreview
                  id="receipt-image"
                  src={getImageUrl(receipt.s3Url)}
                  alt="Receipt"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{ 
                    display: isImageLoading ? 'none' : 'block',
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    cursor: isDragging ? 'grabbing' : (zoom > 1 ? 'grab' : 'default'),
                  }}
                  crossOrigin="anonymous"
                  draggable={false}
                />
              )}
            </ImageWrapper>
            <ZoomControls>
              <Tooltip title="Zoom out (Ctrl/Cmd + -)">
                <span>
                  <IconButton 
                    onClick={handleZoomOut} 
                    disabled={zoom <= MIN_ZOOM}
                    size="small"
                    sx={{ 
                      '&:hover': { 
                        bgcolor: 'grey.200',
                      }
                    }}
                  >
                    <ZoomOutIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 280 }}>
                <Slider
                  value={zoom}
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={ZOOM_STEP}
                  onChange={handleSliderChange}
                  marks={[
                    { value: 0.5, label: '0.5x' },
                    { value: 1, label: '1x' },
                    { value: 2, label: '2x' }
                  ]}
                  sx={{ 
                    minWidth: '240px',
                    mx: 2,
                    '& .MuiSlider-markLabel': {
                      fontSize: '0.75rem',
                      '&[data-index="0"]': {
                        transform: 'translateX(0%)',
                      },
                      '&[data-index="1"]': {
                        transform: 'translateX(-50%)',
                      },
                      '&[data-index="2"]': {
                        transform: 'translateX(-100%)',
                      },
                    },
                    '& .MuiSlider-thumb': {
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
                      },
                    },
                  }}
                  aria-label="Zoom level"
                />
                <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'right' }}>
                  {Math.round(zoom * 100)}%
                </Typography>
              </Box>
              <Tooltip title="Zoom in (Ctrl/Cmd + +)">
                <span>
                  <IconButton 
                    onClick={handleZoomIn} 
                    disabled={zoom >= MAX_ZOOM}
                    size="small"
                    sx={{ 
                      '&:hover': { 
                        bgcolor: 'grey.200',
                      }
                    }}
                  >
                    <ZoomInIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <ControlDivider />
              <Tooltip title="Rotate left (Ctrl/Cmd + L)">
                <IconButton 
                  onClick={handleRotateLeft} 
                  size="small"
                  sx={{ 
                    '&:hover': { 
                      bgcolor: 'grey.200',
                    }
                  }}
                >
                  <RotateLeftIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Rotate right (Ctrl/Cmd + R)">
                <IconButton 
                  onClick={handleRotateRight} 
                  size="small"
                  sx={{ 
                    '&:hover': { 
                      bgcolor: 'grey.200',
                    }
                  }}
                >
                  <RotateRightIcon />
                </IconButton>
              </Tooltip>
              <ControlDivider />
              <Tooltip title="Reset zoom and rotation (Ctrl/Cmd + 0)">
                <span>
                  <IconButton 
                    onClick={handleResetTransform}
                    disabled={zoom === 1 && rotation === 0}
                    size="small"
                    sx={{ 
                      '&:hover': { 
                        bgcolor: 'grey.200',
                      }
                    }}
                  >
                    <RestartAltIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </ZoomControls>
          </ImageContainer>
        </DialogContent>
        <DialogActions sx={{ 
          position: 'relative', 
          zIndex: 1200,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          py: 1.5,
        }}>
          <Button 
            onClick={handleDownload} 
            startIcon={<DownloadIcon />}
            sx={{ 
              '&:hover': { 
                bgcolor: 'grey.100',
              }
            }}
          >
            Download
          </Button>
          <Button 
            onClick={handleCloseModal}
            sx={{ 
              '&:hover': { 
                bgcolor: 'grey.100',
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReceiptDetailsPanel; 