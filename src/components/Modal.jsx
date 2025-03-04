import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box
} from '@mui/material';

const DimensionsModal = ({ open, onClose, onConfirm }) => {
  const [dimensions, setDimensions] = useState({
    width: '',
    length: ''
  });

  const handleChange = (prop) => (event) => {
    setDimensions({ ...dimensions, [prop]: event.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      width: parseFloat(dimensions.width),
      length: parseFloat(dimensions.length)
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Set Rectangle Dimensions</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Width (meters)"
              type="number"
              value={dimensions.width}
              onChange={handleChange('width')}
              inputProps={{ step: "0.1", min: "0" }}
              required
              fullWidth
            />
            <TextField
              label="Length (meters)"
              type="number"
              value={dimensions.length}
              onChange={handleChange('length')}
              inputProps={{ step: "0.1", min: "0" }}
              required
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            OK
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DimensionsModal; 