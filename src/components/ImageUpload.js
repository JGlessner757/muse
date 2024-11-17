import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [keywords, setKeywords] = useState('');
  const [lyrics, setLyrics] = useState([]); // Store lyrics as an array of sections
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current verse/chorus
  const [style, setStyle] = useState('Trop Rock');
  const [key, setKey] = useState('C');
  const [bpm, setBpm] = useState('100');
  const [extraKeyword, setExtraKeyword] = useState(''); // Extra keyword state
  const [loading, setLoading] = useState(false);

  const MAX_FILE_SIZE_MB = 10;

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

        // Send the image to the backend Lambda
        const response = await axios.post('https://ghvgmdk314.execute-api.us-east-2.amazonaws.com/prod/museImageAnalyzer', {
          image: base64Image,
          style,
          bpm,
          key,
        });

        // Split the lyrics into sections (verses and choruses)
        const fullLyrics = response.data.lyrics.split('\n\n'); // Assumes sections are separated by double newlines
        setLyrics(fullLyrics);
        setKeywords(response.data.description);
        setCurrentIndex(0); // Reset to the first section
      } catch (error) {
        console.error('Error in API request:', error);
      } finally {
        setLoading(false);
      }
    };
  };

  const handleNext = () => {
    if (lyrics.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % lyrics.length); // Loop back to the start
    }
  };

  const handleRegenerate = () => {
    // Clear the lyrics and regenerate with the same parameters
    setLyrics([]);
    handleSubmit();
  };

  return (
    <div className="container mt-5 text-center">
      <h1 className="mb-4">🎵 MUUZE 🎵</h1>

      <div className="mb-4">
        <input type="file" className="form-control" onChange={handleFileChange} />
      </div>

      <div className="mb-4">
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
        {loading ? 'Generating...' : 'Inspire Me'}
      </button>

      {/* Show lyrics and buttons to navigate */}
      {lyrics.length > 0 && (
        <div className="lyrics-container mt-5 p-4 border rounded bg-light">
          <h2>🎶 Verse/Chorus 🎶</h2>
          <p style={{ fontSize: '1.2em', fontStyle: 'italic', whiteSpace: 'pre-wrap', color: '#333' }}>
            {lyrics[currentIndex]}
          </p>
          <div className="mt-3">
            <button onClick={handleNext} className="btn btn-secondary me-2">Next Verse/Chorus</button>
            <button onClick={handleRegenerate} className="btn btn-danger">Re-Generate Lyrics</button>
          </div>
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
