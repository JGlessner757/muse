import React, { useState } from 'react';
import axios from 'axios';

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [keywords, setKeywords] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [style, setStyle] = useState('Trop Rock'); // Default style
  const [key, setKey] = useState('C'); // Default key
  const [bpm, setBpm] = useState('100'); // Default BPM for Trop Rock
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleStyleChange = (selectedStyle) => {
    setStyle(selectedStyle);

    // Adjust default BPM and Key options based on style
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

    // Convert the image to base64
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = async () => {
      try {
        const base64Image = reader.result.split(',')[1]; // Extract only the base64 part

        // Generate the prompt based on style, key, and bpm
        let prompt = '';
        if (style === 'Trop Rock') {
          prompt = `Write a Trop Rock song with a relaxed, beachy vibe around ${bpm} BPM in the key of ${key}. Use the following keywords: ${keywords}`;
        } else if (style === 'Southern Blues') {
          prompt = `Write a soulful Southern Blues song around ${bpm} BPM in the key of ${key}. The lyrics should convey deep emotion and soul. Use the following keywords: ${keywords}`;
        } else if (style === 'Honky Tonk Hits') {
          prompt = `Write an upbeat Honky Tonk song around ${bpm} BPM in the key of ${key}. The lyrics should be fun and lively. Use the following keywords: ${keywords}`;
        }

        // Send to API Gateway
        const response = await axios.post('https://ghvgmdk314.execute-api.us-east-2.amazonaws.com/prod/museImageAnalyzer', {
          image: base64Image,
          prompt: prompt // Pass the custom prompt to Lambda
        });

        // Display the results
        setKeywords(response.data.description); // Set keywords from Rekognition
        setLyrics(response.data.lyrics); // Set lyrics from OpenAI
      } catch (error) {
        console.error('Error in API request:', error);
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h1>Muse - Generate Song Lyrics from Your Image</h1>

      <input type="file" onChange={handleFileChange} />
      
      {/* Style Selection Dropdown */}
      <div style={{ marginTop: '20px' }}>
        <label htmlFor="style-select" style={{ marginRight: '10px' }}>Choose a Style:</label>
        <select id="style-select" onChange={(e) => handleStyleChange(e.target.value)} value={style}>
          <option value="Trop Rock">Trop Rock (100 BPM, Keys: C, G, F)</option>
          <option value="Southern Blues">Southern Blues (85 BPM, Keys: E, A, D)</option>
          <option value="Honky Tonk Hits">Honky Tonk Hits (95 BPM, Keys: G, D, E)</option>
        </select>
      </div>

      {/* Key Selection Dropdown */}
      <div style={{ marginTop: '20px' }}>
        <label htmlFor="key-select" style={{ marginRight: '10px' }}>Choose a Key:</label>
        <select id="key-select" onChange={(e) => setKey(e.target.value)} value={key}>
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

      <button onClick={handleSubmit} disabled={!selectedFile || loading} style={{ marginTop: '20px' }}>
        {loading ? 'Generating...' : 'Generate Lyrics'}
      </button>

      {/* Displaying Lyrics at the Top */}
      {lyrics && (
        <div style={{ marginTop: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9', maxWidth: '600px', margin: 'auto' }}>
          <h2>Your Song Lyrics 🎶</h2>
          <p style={{ fontSize: '1.2em', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>{lyrics}</p>
          <p style={{ marginTop: '10px', fontWeight: 'bold' }}>Key: {key}, BPM: {bpm}</p>
        </div>
      )}

      {/* Displaying Keywords at the Bottom */}
      {keywords && (
        <div style={{ marginTop: '40px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#eef2f3', maxWidth: '600px', margin: 'auto' }}>
          <h2>Key Words 📝</h2>
          <p style={{ fontSize: '1em', color: '#555' }}>{keywords}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
