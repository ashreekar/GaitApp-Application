import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Typography, Paper } from '@mui/material';

function GaitCycleCard({ data }) {
  // data expected: [{ name: 'Left', stance: 60, swing: 40 }, { name: 'Right', stance: 58, swing: 42 }]

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '32px',
        border: '1px solid',
        borderColor: 'grey.100',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
          Gait Cycle Distribution
        </Typography>
        <Typography
          variant="caption"
          fontWeight="bold"
          color="text.secondary"
          sx={{ textTransform: 'uppercase', fontSize: '10px' }}
        >
          Session
        </Typography>
      </Box>

      {/* Chart Container */}
      <Box sx={{ width: '100%', height: 160 }}>
        <BarChart
          dataset={data}
          yAxis={[
            {
              scaleType: 'band',
              dataKey: 'name',
            },
          ]}
          series={[
            { 
              dataKey: 'stance', 
              stack: 'total', 
              color: '#1a73e8',
              label: 'Stance' 
            },
            { 
              dataKey: 'swing', 
              stack: 'total', 
              color: '#e5e7eb',
              label: 'Swing' 
            },
          ]}
          layout="horizontal"
          // Hide axes and grid for a cleaner "card" look
          leftAxis={null} 
          bottomAxis={null}
          margin={{ left: 10, right: 10, top: 0, bottom: 0 }}
          slotProps={{
            legend: { hidden: true },
          }}
          // Style adjustments for rounded bars
          sx={{
            '.MuiBarElement-root': {
              rx: 8, // Adds slight rounding to bar edges
            },
          }}
        />
      </Box>
      
      {/* Optional: Custom Legend since we hid the default one */}
      <Box display="flex" gap={2} mt={1}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1a73e8' }} />
          <Typography variant="caption" color="text.secondary">Stance</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#e5e7eb' }} />
          <Typography variant="caption" color="text.secondary">Swing</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default GaitCycleCard;