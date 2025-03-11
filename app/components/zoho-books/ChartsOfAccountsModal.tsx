'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ChartOfAccount {
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  parent_account_name?: string;
  description?: string;
}

interface ChartsOfAccountsModalProps {
  open: boolean;
  onClose: () => void;
  accounts: ChartOfAccount[];
}

interface AccountNode extends ChartOfAccount {
  children: AccountNode[];
  level: number;
}

function buildAccountTree(accounts: ChartOfAccount[]): AccountNode[] {
  const accountMap = new Map<string, AccountNode>();
  const rootAccounts: AccountNode[] = [];

  // First pass: Create all nodes
  accounts.forEach(account => {
    accountMap.set(account.account_name, {
      ...account,
      children: [],
      level: 0
    });
  });

  // Second pass: Build the tree
  accounts.forEach(account => {
    const node = accountMap.get(account.account_name)!;
    if (account.parent_account_name && accountMap.has(account.parent_account_name)) {
      const parent = accountMap.get(account.parent_account_name)!;
      parent.children.push(node);
      node.level = parent.level + 1;
    } else {
      rootAccounts.push(node);
    }
  });

  return rootAccounts;
}

function AccountRows({ accounts, level = 0 }: { accounts: AccountNode[], level?: number }) {
  return (
    <>
      {accounts.map((account) => (
        <>
          <TableRow key={account.account_id}>
            <TableCell>
              <Box sx={{ pl: level * 4 }}>
                {account.account_code}
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ pl: level * 4 }}>
                {account.account_name}
              </Box>
            </TableCell>
            <TableCell>{account.account_type}</TableCell>
          </TableRow>
          {account.children.length > 0 && (
            <AccountRows accounts={account.children} level={level + 1} />
          )}
        </>
      ))}
    </>
  );
}

export default function ChartsOfAccountsModal({
  open,
  onClose,
  accounts,
}: ChartsOfAccountsModalProps) {
  const accountTree = buildAccountTree(accounts);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Charts of Accounts</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Account Code</TableCell>
                <TableCell>Account Name</TableCell>
                <TableCell>Account Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accountTree.length > 0 ? (
                <AccountRows accounts={accountTree} />
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No accounts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
} 