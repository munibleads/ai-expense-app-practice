'use client';

import React, { useState, useCallback } from 'react';
import {
  Select,
  MenuItem,
  SelectProps,
  Typography,
  Box,
  OutlinedInput,
  ListSubheader,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export interface HierarchicalOption {
  id: string;
  label: string;
  code?: string;
  children?: HierarchicalOption[];
  level: number;
}

interface HierarchicalSelectProps {
  options: HierarchicalOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  labelId?: string;
  required?: boolean;
}

export default function HierarchicalSelect({
  options,
  value,
  onChange,
  label,
  placeholder,
  labelId,
  required,
}: HierarchicalSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Function to check if an option matches the search term
  const matchesSearch = (option: HierarchicalOption): boolean => {
    const searchLower = searchTerm.toLowerCase();
    return (
      option.label.toLowerCase().includes(searchLower) ||
      option.code?.toLowerCase().includes(searchLower) ||
      (option.children?.some(child => matchesSearch(child)) ?? false)
    );
  };

  // Function to filter options based on search term
  const filterOptions = (options: HierarchicalOption[]): HierarchicalOption[] => {
    if (!searchTerm) return options;

    return options.reduce<HierarchicalOption[]>((acc, option) => {
      if (option.children?.length) {
        const filteredChildren = filterOptions(option.children);
        if (filteredChildren.length > 0) {
          acc.push({
            ...option,
            children: filteredChildren,
          });
        } else if (matchesSearch(option)) {
          acc.push(option);
        }
      } else if (matchesSearch(option)) {
        acc.push(option);
      }
      return acc;
    }, []);
  };

  const renderOptions = (options: HierarchicalOption[]) => {
    return options.map((option) => {
      if (option.children?.length) {
        return [
          <ListSubheader
            key={option.id}
            sx={{
              fontWeight: 600,
              backgroundColor: 'background.paper',
              lineHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {option.code && (
              <Typography
                variant="body2"
                component="span"
                color="text.secondary"
              >
                [{option.code}]
              </Typography>
            )}
            {option.label}
          </ListSubheader>,
          ...option.children.map((child) => (
            <MenuItem
              key={child.id}
              value={child.code || child.id}
              sx={{
                pl: 4,
                py: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {child.code && (
                <Typography
                  variant="body2"
                  component="span"
                  color="text.secondary"
                >
                  [{child.code}]
                </Typography>
              )}
              {child.label}
            </MenuItem>
          )),
        ];
      }

      return (
        <MenuItem
          key={option.id}
          value={option.code || option.id}
          sx={{
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {option.code && (
            <Typography
              variant="body2"
              component="span"
              color="text.secondary"
            >
              [{option.code}]
            </Typography>
          )}
          {option.label}
        </MenuItem>
      );
    });
  };

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  // Handle keyboard events to prevent Select from capturing them
  const handleSearchKeyDown = useCallback((event: React.KeyboardEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <Select
      labelId={labelId}
      value={value}
      onChange={(e) => onChange(e.target.value as string)}
      input={<OutlinedInput label={label} />}
      displayEmpty
      required={required}
      renderValue={(selected) => {
        if (!selected) {
          return (
            <Typography color="text.secondary">
              {placeholder || 'Select an option'}
            </Typography>
          );
        }

        const findOption = (options: HierarchicalOption[]): HierarchicalOption | undefined => {
          for (const option of options) {
            if (option.code === selected || option.id === selected) {
              return option;
            }
            if (option.children) {
              const found = findOption(option.children);
              if (found) return found;
            }
          }
          return undefined;
        };

        const selectedOption = findOption(options);
        if (!selectedOption) return placeholder;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedOption.code && (
              <Typography variant="body2" component="span" color="text.secondary">
                [{selectedOption.code}]
              </Typography>
            )}
            {selectedOption.label}
          </Box>
        );
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            maxHeight: 400,
            '&::-webkit-scrollbar': {
              width: '8px',
              backgroundColor: '#f5f5f5',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#bdbdbd',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
            },
          },
        },
      }}
    >
      <Box 
        sx={{ 
          position: 'sticky', 
          top: 0, 
          bgcolor: 'background.paper', 
          zIndex: 1, 
          p: 1,
          // Add a subtle shadow to make the search bar stand out
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <TextField
          size="small"
          fullWidth
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          onClick={(e) => e.stopPropagation()}
          autoComplete="off"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'divider',
              },
            },
          }}
        />
      </Box>
      {renderOptions(filterOptions(options))}
    </Select>
  );
} 