import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [keywords, setKeywords] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [style, setStyle] = useState('Trop Rock');
  const [key, setKey] = useState('C');
  const [bpm, setBpm] = useState('100');
  const [loading, setLoading] = useState(false);
  const MAX_FILE_SIZE_MB = 10;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
      alert(`File size exceeds ${MAX_FILE_SIZE_MB} MB. Please select a smaller file.`);
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
    }
  };

  const handleStyleChange = (selectedStyle) => {
    setStyle(selectedStyle);
    if (selectedStyle === 'Trop Rock') {
      setBpm('100');
      setKey('C');
    } else if (selectedStyle === 'Southern Blues') {
      setBpm('85');
      setKey('E');
    } else if (selectedStyle === 'Honky Tonk Hits') {
      setBpm('120');
      setKey('G');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setLoading(true);

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = async () => {
      try {
        const base64Image = reader.result.split(',')[1];
        const response = await axios.post('https://ghvgmdk314.execute-api.us-east-2.amazonaws.com/prod/museImageAnalyzer', {
          image: base64Image,
          style,
          bpm,
          key,
        });

        setLyrics(response.data.lyrics || 'No lyrics generated.');
        setKeywords(response.data.description || 'No keywords detected.');
      } catch (error) {
        console.error('Error in API request:', error);
        alert('Failed to process the image and generate lyrics.');
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div className="container mt-5 text-center">
      <h1 className="mb-4">🎵 MUSE 🎵</h1>
      <div className="mb-4">
        <input type="file" className="form-control" onChange={handleFileChange} />
      </div>
      <div className="mb-4">
        <label htmlFor="style-select" className="form-label">Choose a Style:</label>
        <select className="form-select" id="style-select" onChange={(e) => handleStyleChange(e.target.value)} value={style}>
          <option value="Trop Rock">🌴 Trop Rock</option>
          <option value="Southern Blues">🎸 Southern Blues</option>
          <option value="Honky Tonk Hits">👢 Honky Tonk Hits</option>
        </select>
      </div>
      <button onClick={handleSubmit} disabled={!selectedFile || loading} className="btn btn-primary">
        {loading ? 'Generating...' : 'Generate Lyrics'}
      </button>
      {lyrics && (
        <div className="mt-5">
          <h2>🎶 Lyrics 🎶</h2>
          <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left', padding: '1em', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            {lyrics}
          </pre>
        </div>
      )}
      {keywords && (
        <div className="mt-4">
          <h2>🔑 Key Words</h2>
          <p>{keywords}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
