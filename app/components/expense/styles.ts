import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import TableCell from '@mui/material/TableCell';

export const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}));

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&.header': {
    backgroundColor: theme.palette.background.default,
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },
}));

export const VisuallyHiddenInput = styled('input')({
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