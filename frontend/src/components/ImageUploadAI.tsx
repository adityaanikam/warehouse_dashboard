// frontend/src/components/ImageUploadAI.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUploadOutlined';
import { getErrorMessage, uploadProductImage } from '../api/apiService';
import { IPrediction } from '../types';

const MAX_MB = 5;

/**
 * Upload box for the demo "AI product detection" feature.
 * The backend returns a random product name and does not analyse the picture, and the
 * UI says so, so nobody mistakes it for a real vision model.
 */
const ImageUploadAI: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<IPrediction | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Release the temporary preview URL when it is replaced or the component goes away.
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const choose = (picked?: File) => {
    setPrediction(null);
    setError('');
    if (!picked) return;
    if (!picked.type.startsWith('image/')) return setError('Please choose an image file.');
    if (picked.size > MAX_MB * 1024 * 1024) return setError(`Image must be smaller than ${MAX_MB} MB.`);
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
  };

  const analyse = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      setPrediction((await uploadProductImage(file)).prediction);
    } catch (e) {
      setError(getErrorMessage(e, 'Upload failed. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); choose(e.dataTransfer.files?.[0]); }}
        sx={(theme) => ({
          cursor: 'pointer',
          textAlign: 'center',
          p: 3,
          borderRadius: 3,
          border: `2px dashed ${dragging ? theme.palette.primary.main : theme.palette.divider}`,
          backgroundColor: dragging ? theme.palette.action.hover : 'transparent',
          transition: 'border-color .15s, background-color .15s',
        })}
      >
        {previewUrl ? (
          <Box component="img" src={previewUrl} alt="Selected product" sx={{ maxHeight: 140, maxWidth: '100%', borderRadius: 2 }} />
        ) : (
          <CloudUploadIcon color="primary" sx={{ fontSize: 40 }} />
        )}
        <Typography sx={{ mt: 1 }} fontWeight={600}>
          {file ? file.name : 'Drop an image here or click to browse'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          PNG or JPG, up to {MAX_MB} MB
        </Typography>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => choose(e.target.files?.[0])} />
      </Box>

      <Button variant="contained" onClick={analyse} disabled={!file || busy}
        startIcon={busy ? <CircularProgress size={18} color="inherit" /> : undefined}>
        {busy ? 'Analysing...' : 'Analyse image'}
      </Button>

      {error && <Alert severity="error">{error}</Alert>}

      {prediction && (
        <Alert severity="success" icon={false}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography fontWeight={700}>{prediction.product_name}</Typography>
            <Chip size="small" label={`about ${prediction.estimated_quantity} units`} />
          </Stack>
        </Alert>
      )}

      <Typography variant="caption" color="text.secondary">
        Demo feature: the server returns a random product and does not look at the image.
      </Typography>
    </Stack>
  );
};

export default ImageUploadAI;
