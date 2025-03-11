import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Fade from '@mui/material/Fade';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES, ERROR_MESSAGES } from '@/app/constants/expense';
import { S3Service } from '@/app/services/s3Service';
import { ReceiptService, SavedReceipt } from '@/app/services/receiptService';
import { ReceiptData } from '@/app/services/bedrockService';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Slider from '@mui/material/Slider';
import CloseIcon from '@mui/icons-material/Close';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// A hidden input for accessibility
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface UploadBoxProps {
  isDragging?: boolean;
  hasError?: boolean;
}

// Styled container for the file upload area
const UploadBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isDragging' && prop !== 'hasError'
})<UploadBoxProps>(({ theme, isDragging, hasError }) => ({
  border: `2px dashed ${hasError ? theme.palette.error.main : isDragging ? theme.palette.primary.main : '#ccc'}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: isDragging ? theme.palette.action.hover : theme.palette.background.paper,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  position: 'relative',
  minHeight: '180px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '&:hover': {
    borderColor: hasError ? theme.palette.error.main : theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  '& .MuiButton-root': {
    textTransform: 'none',
    fontWeight: 500,
    padding: theme.spacing(1, 3),
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
    },
  },
}));

const PreviewImage = styled('img')<{ isProcessed?: boolean }>(({ theme, isProcessed }) => ({
  maxWidth: '100%',
  maxHeight: '400px',
  width: 'auto',
  objectFit: 'contain',
  margin: theme.spacing(2, 0),
  padding: 0,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  transition: 'all 0.3s ease',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  padding: theme.spacing(1, 4),
  backgroundColor: 'transparent',
  border: 'none',
  width: '100%',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    transform: 'translateY(-1px)',
  },
  '&.MuiButton-containedPrimary': {
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: 'rgba(25, 118, 210, 0.04)',
    },
  },
  '&.MuiButton-containedSuccess': {
    color: theme.palette.success.main,
    '&:hover': {
      backgroundColor: 'rgba(46, 125, 50, 0.04)',
    },
  },
  '&.MuiButton-containedError': {
    color: theme.palette.error.main,
    '&:hover': {
      backgroundColor: 'rgba(211, 47, 47, 0.04)',
    },
  },
  '&.Mui-disabled': {
    color: theme.palette.action.disabled,
  },
}));

// Add a new ProcessingOverlay component
const ProcessingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
  borderRadius: theme.shape.borderRadius,
}));

// Add a new styled component for the info text
const InfoText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: 'center',
  padding: theme.spacing(0, 1),
  margin: theme.spacing(0, 0, 2),
  '& strong': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}));

// Add ImageDialog component
const ImageDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxHeight: 'calc(100vh - 64px)',
    margin: theme.spacing(2),
    position: 'relative',
    backgroundColor: theme.palette.grey[100],
  }
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

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const WHEEL_ZOOM_MULTIPLIER = 0.1;
const ROTATION_STEP = 90;

export interface FileUploadSectionProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  receipt: File | null;
  isLoading?: boolean;
  onCancel?: () => void;
  onProcessAgain?: () => void;
  receiptData: ReceiptData;
  onSaveSuccess?: (savedReceipt: SavedReceipt) => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({ 
  onFileChange, 
  receipt, 
  isLoading = false,
  onCancel,
  onProcessAgain,
  receiptData,
  onSaveSuccess
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [s3Key, setS3Key] = useState<string | null>(null);
  
  // Add new state for image preview dialog
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const s3Service = new S3Service();
  const receiptService = new ReceiptService();

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return ERROR_MESSAGES.FILE_TYPE(ALLOWED_FILE_TYPES.map(type => type.split('/')[1].toUpperCase()));
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${ERROR_MESSAGES.FILE_SIZE(MAX_FILE_SIZE)} (Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB)`;
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    setError(validationError);

    if (!validationError) {
      // Create preview for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }

      // Create a synthetic event to match the expected type
      const syntheticEvent = {
        target: {
          files: [file]
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      onFileChange(syntheticEvent);
    }
  }, [onFileChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const handleSave = async () => {
    if (!receipt) return;

    setIsSaving(true);
    setError(null);

    try {
      if (!receipt) {
        setError('Please choose a file before uploading.');
        return;
      }

      // Upload to S3
      const key = await s3Service.uploadFile(receipt);
      setS3Key(key);
      
      // Get the S3 URL
      const s3Url = s3Service.getFileUrl(key);
      
      // Save receipt data to database
      const savedReceipt = await receiptService.saveReceipt(receiptData, key, s3Url);
      
      if (onSaveSuccess) {
        onSaveSuccess(savedReceipt);
      }
    } catch (err: unknown) {
      console.error('Error saving receipt:', err);
      setError('An error occurred while uploading the file. Please try again.');
      
      // If we uploaded to S3 but failed to save to database, clean up the S3 file
      if (s3Key) {
        try {
          await s3Service.deleteFile(s3Key);
          setS3Key(null);
        } catch (cleanupError) {
          console.error('Failed to clean up S3 file:', cleanupError);
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // If we have an S3 key, delete the file from S3
    if (s3Key) {
      s3Service.deleteFile(s3Key).catch(console.error);
    }
    
    // Clear all states
    setPreview(null);
    setError(null);
    setS3Key(null);
    
    // Call parent's onCancel if provided
    if (onCancel) {
      onCancel();
    }
  };

  const handleProcessAgain = () => {
    if (onProcessAgain && receipt) {
      onProcessAgain();
    }
  };

  const getUploadStatus = () => {
    if (isLoading) return 'AI is Processing...';
    if (isSaving) return 'Saving Receipt...';
    if (receipt && !error) return 'Receipt Uploaded';
    return 'Upload Receipt';
  };

  const shouldShowHelperText = !isLoading && !isSaving && !receipt;

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
      setIsDraggingImage(true);
      setDragStart({
        x: event.clientX + container.scrollLeft,
        y: event.clientY + container.scrollTop
      });
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDraggingImage && zoom > 1) {
      event.preventDefault();
      const container = event.currentTarget as HTMLElement;
      container.scrollLeft = dragStart.x - event.clientX;
      container.scrollTop = dragStart.y - event.clientY;
    }
  };

  const handleMouseUp = () => {
    setIsDraggingImage(false);
  };

  const handleWheel = (event: React.WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY * -WHEEL_ZOOM_MULTIPLIER;
      setZoom(prev => {
        const newZoom = prev + delta;
        return Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);
      });
    }
  };

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setZoom(newValue as number);
  };

  const handleCloseModal = () => {
    setIsImageModalOpen(false);
    setZoom(1);
    setRotation(0);
  };

  return (
    <StyledCard>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        {!receipt && (
          <>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Upload Receipt
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Drag and drop your receipt or click to browse
              </Typography>
            </Box>

            <UploadBox
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById('receipt-upload')?.click()}
              isDragging={isDragging}
              hasError={!!error}
            >
              <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1.5 }} />
              <Typography variant="body1" gutterBottom>
                Drop your receipt here or click to browse
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supported formats: {ALLOWED_FILE_TYPES.map(type => type.split('/')[1].toUpperCase()).join(', ')}
              </Typography>
              <VisuallyHiddenInput
                type="file"
                id="receipt-upload"
                onChange={handleInputChange}
                accept={ALLOWED_FILE_TYPES.join(',')}
                disabled={isLoading}
              />
            </UploadBox>

            <InfoText variant="body2">
              Use <strong>AI to auto-fill</strong> expense details or enter them manually below.
            </InfoText>
          </>
        )}

        {receipt && (
          <>
            <UploadBox
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !isLoading && setIsImageModalOpen(true)}
              isDragging={isDragging}
              hasError={!!error}
              sx={{ cursor: 'pointer' }}
            >
              {isLoading ? (
                <ProcessingOverlay>
                  <CircularProgress size={48} sx={{ mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    Processing Receipt...
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Please wait while our AI analyzes your receipt
                  </Typography>
                </ProcessingOverlay>
              ) : (
                <PreviewImage src={preview || ''} alt="Receipt preview" />
              )}
            </UploadBox>
            {!isLoading && (
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={onProcessAgain}
                  disabled={isLoading}
                  sx={{ 
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: 'primary.dark',
                    }
                  }}
                >
                  Process Again
                </Button>
                <Button
                  startIcon={<CloudUploadIcon />}
                  onClick={() => document.getElementById('receipt-upload')?.click()}
                  disabled={isLoading}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: 'text.primary',
                    }
                  }}
                >
                  Upload Receipt Again
                </Button>
                <VisuallyHiddenInput
                  type="file"
                  id="receipt-upload"
                  onChange={handleInputChange}
                  accept={ALLOWED_FILE_TYPES.join(',')}
                  disabled={isLoading}
                />
              </Stack>
            )}
          </>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Image Preview Dialog */}
        <ImageDialog
          open={isImageModalOpen}
          onClose={handleCloseModal}
          maxWidth="lg"
          fullWidth
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
            <ImageContainer 
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <ImageWrapper>
                {preview && (
                  <PreviewImage
                    src={preview}
                    alt="Receipt"
                    style={{ 
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      cursor: isDraggingImage ? 'grabbing' : (zoom > 1 ? 'grab' : 'default'),
                    }}
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
                      }
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
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            py: 1.5,
          }}>
            <Button onClick={handleCloseModal}>
              Close
            </Button>
          </DialogActions>
        </ImageDialog>
      </CardContent>
    </StyledCard>
  );
};

export default FileUploadSection; 