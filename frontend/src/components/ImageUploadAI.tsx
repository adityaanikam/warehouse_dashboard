// frontend/src/components/ImageUploadAI.tsx
import React, { useState } from 'react';
import { Button, Input, Box, Typography, Alert } from '@mui/material';
import { uploadProductImage } from '../api/apiService';

interface PredictionResult {
    product_name: string;
    estimated_quantity: number;
}

/**
 * A component for uploading an image to the AI backend for product detection.
 */
const ImageUploadAI: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
      setPrediction(null);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    try {
      const response = await uploadProductImage(selectedFile);
      setPrediction(response.prediction);
      setError('');
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    }
  };

  return (
    <Box>
      <Typography variant="body1" gutterBottom>
        Upload an image of a product to identify it and estimate the quantity.
      </Typography>
      <Input
        type="file"
        onChange={handleFileChange}
        inputProps={{ accept: 'image/*' }}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleUpload} disabled={!selectedFile}>
        Analyze Image
      </Button>
      
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {prediction && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography><strong>Product Detected:</strong> {prediction.product_name}</Typography>
          <Typography><strong>Estimated Quantity:</strong> {prediction.estimated_quantity}</Typography>
        </Alert>
      )}
    </Box>
  );
};

export default ImageUploadAI;