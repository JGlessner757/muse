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

  const MAX_FILE_SIZE_MB = 5;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      alert(`File size should not exceed ${MAX_FILE_SIZE_MB} MB. Please choose a smaller file.`);
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
      setBpm('95');
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

        let prompt = '';
        if (style === 'Trop Rock') {
          prompt = `Write a Trop Rock song with a relaxed, beachy vibe around ${bpm} BPM in the key of ${key}. Use the following keywords: ${keywords}`;
        } else if (style === 'Southern Blues') {
          prompt = `Write a soulful Southern Blues song around ${bpm} BPM in the key of ${key}. The lyrics should convey deep emotion and soul. Use the following keywords: ${keywords}`;
        } else if (style === 'Honky Tonk Hits') {
          prompt = `Write an upbeat Honky Tonk song around ${bpm} BPM in the key of ${key}. The lyrics should be fun and lively. Use the following keywords: ${keywords}`;
        }

        const response = await axios.post('https://ghvgmdk314.execute-api.us-east-2.amazonaws.com/prod/museImageAnalyzer', {
          image: base64Image,
          prompt: prompt
        });

        setKeywords(response.data.description);
        // Insert line breaks for readability
        const formattedLyrics = response.data.lyrics.replace(/\\n/g, '\n');
        setLyrics(formattedLyrics);
      } catch (error) {
        console.error('Error in API request:', error);
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div className="container mt-5 text-center">
      <h1 className="mb-4">Muse - Generate Song Lyrics from Your Image</h1>

      <div className="mb-3">
        <input type="file" className="form-control" onChange={handleFileChange} />
      </div>
      
      <div className="mb-3">
        <label htmlFor="style-select" className="form-label">Choose a Style:</label>
        <select className="form-select" id="style-select" onChange={(e) => handleStyleChange(e.target.value)} value={style}>
          <option value="Trop Rock">🌴 Trop Rock 🌴</option>
          <option value="Southern Blues">🥃 Southern Blues 🥃</option>
          <option value="Honky Tonk Hits">👢 Honky Tonk Hits 👢</option>
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="key-select" className="form-label">Choose a Key:</label>
        <select className="form-select" id="key-select" onChange={(e) => setKey(e.target.value)} value={key}>
          {style === 'Trop Rock' && (
            <>
              <option value="C">C</option>
              <option value="G">G</option>
              <option value="F">F</option>
            </>
          )}
          {style === 'Southern Blues' && (
            <>
              <option value="E">E</option>
              <option value="A">A</option>
              <option value="D">D</option>
            </>
          )}
          {style === 'Honky Tonk Hits' && (
            <>
              <option value="G">G</option>
              <option value="D">D</option>
              <option value="E">E</option>
            </>
          )}
        </select>
      </div>

      <button onClick={handleSubmit} disabled={!selectedFile || loading} className="btn btn-primary">
        {loading ? 'Generating...' : 'Generate Lyrics'}
      </button>

      {lyrics && (
        <div className="mt-5 p-4 border rounded bg-light">
          <h2 className="text-dark">Your Song Lyrics 🎶</h2>
          <pre style={{ fontSize: '1.2em', fontStyle: 'italic', whiteSpace: 'pre-wrap', color: '#333' }}>{lyrics}</pre>
          <p className="mt-2 text-secondary">Key: {key}, BPM: {bpm}</p>
        </div>
      )}

      {keywords && (
        <div className="mt-4 p-3 border rounded bg-light">
          <h2>Key Words 📝</h2>
          <p className="text-muted">{keywords}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
