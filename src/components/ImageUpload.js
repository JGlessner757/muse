import React, { useState } from 'react';
import axios from 'axios';

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [keywords, setKeywords] = useState(''); // Renamed description to keywords
  const [lyrics, setLyrics] = useState(''); // State to hold the generated lyrics
  const [style, setStyle] = useState('Kenny Chesney'); // Default style selection
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
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

        // Choose prompt based on selected style
        let prompt = '';
        if (style === 'Kenny Chesney') {
          prompt = `Write a song in the style of Kenny Chesney, focusing on good vibes, sunny beaches, and the joy of living in the moment. Use the following keywords: ${keywords}`;
        } else if (style === 'Adele') {
          prompt = `Write a soulful, emotional ballad in the style of Adele. The song should explore love, longing, and self-reflection. Use the following keywords: ${keywords}`;
        } else if (style === 'Luke Bryan') {
          prompt = `Write a high-energy country rock song in the style of Luke Bryan. The song should be upbeat and focus on having a good time, freedom, and adventure. Use the following keywords: ${keywords}`;
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
        <select id="style-select" onChange={(e) => setStyle(e.target.value)} value={style}>
          <option value="Kenny Chesney">Beach Vibes (Kenny Chesney)</option>
          <option value="Adele">Emotional Ballad (Adele)</option>
          <option value="Luke Bryan">Upbeat Country Rock (Luke Bryan)</option>
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
