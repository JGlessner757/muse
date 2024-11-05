import React, { useState } from 'react';
import axios from 'axios';

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [keywords, setKeywords] = useState(''); // Renamed description to keywords
  const [lyrics, setLyrics] = useState(''); // State to hold the generated lyrics
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

        // Send to API Gateway
        const response = await axios.post('https://ghvgmdk314.execute-api.us-east-2.amazonaws.com/prod/museImageAnalyzer', {
          image: base64Image
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
      <button onClick={handleSubmit} disabled={!selectedFile || loading}>
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
