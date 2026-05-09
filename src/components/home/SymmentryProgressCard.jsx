import React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography, Paper } from '@mui/material';

function SymmetryProgressCard({ data }) {
  // MUI X Charts expects arrays for axes or a formatted dataset
  const xData = data.map((item) => item.week);
  const yData = data.map((item) => item.symmetry);

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
          Symmetry Progress
        </Typography>
        <Typography
          variant="caption"
          fontWeight="bold"
          color="text.secondary"
          sx={{ textTransform: 'uppercase', fontSize: '10px' }}
        >
          Timeline
        </Typography>
      </Box>

      {/* Chart Container */}
      <Box sx={{ width: '100%', height: 200 }}>
        <LineChart
          xAxis={[{ 
            data: xData, 
            scaleType: 'point',
            hideTooltip: false 
          }]}
          series={[
            {
              data: yData,
              area: true, // Enables the "Area" look
              color: '#1a73e8',
              showMark: false, // Cleaner look; set to true if you want dots
            },
          ]}
          // Remove margins to let the chart breathe
          margin={{ left: 1, right: 1, top: 10, bottom: 30 }}
          slotProps={{
            legend: { hidden: true }, // Hide legend to match original design
          }}
          // Styling the area fill via SX
          sx={{
            '.MuiAreaElement-root': {
              fill: 'url(#area-gradient)',
              fillOpacity: 0.2,
            },
          }}
        >
          {/* Custom Gradient for that modern look */}
          <defs>
            <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1a73e8" stopOpacity={0} />
            </linearGradient>
          </defs>
        </LineChart>
      </Box>
    </Paper>
  );
}

export default SymmetryProgressCard;