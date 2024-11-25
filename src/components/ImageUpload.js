import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [lyrics, setLyrics] = useState('');
  const [style, setStyle] = useState('Trop Rock');
  const [key, setKey] = useState('C');
  const [bpm, setBpm] = useState('100');
  const [extraKeyword, setExtraKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const MAX_FILE_SIZE_MB = 10;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const allowedFormats = ['image/jpeg', 'image/png'];
    if (!allowedFormats.includes(file.type)) {
      alert('Invalid file format. Please upload a JPG or PNG image.');
      return;
    }
    if (file.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
      alert(`File size exceeds ${MAX_FILE_SIZE_MB} MB. Please select a smaller file.`);
      return;
    }
    setSelectedFile(file);
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
          extraKeyword,
        });

        setLyrics(response.data.lyrics || 'No lyrics generated.');
      } catch (error) {
        console.error('Error in API request:', error);
        alert('Failed to process the image and generate lyrics.');
      } finally {
        setLoading(false);
      }
    };
  };

  // function for

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this song I just generated with MUSE!",
          text: `🎶 Here's my song lyrics:\n\n${lyrics}\n\n🎵 Play this song in the key of ${key} and at ${bpm} BPM. 🎵`,
          url: "https://master.d2el33hfyb2pay.amplifyapp.com/", // Include your app's URL here
        })
        .then(() => console.log("Shared successfully!"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      alert("Sharing is not supported on this device or browser.");
    }
  };
  
  return (
    <div className="container mt-5 text-center">
      <img
    src="full_logo_black.png"
    alt="SongSnap Logo"
    style={{ width: "200px", marginBottom: "20px" }}
  />
      <h5 className="mb-4">Pics to Songs with AI</h5>
      <div className="mb-4">
      <label htmlFor="style-select" className="form-label">📷 Share a Pic 📷</label>
        <input type="file" className="form-control" onChange={handleFileChange} />
      </div>
      <div className="mb-4">
        <label htmlFor="style-select" className="form-label">Choose a Musical Style 
        </label>
        <select className="form-select" id="style-select" onChange={(e) => handleStyleChange(e.target.value)} value={style}>
          <option value="Trop Rock">🌴 Trop Rock 🌴</option>
          <option value="Southern Blues">🎸 Southern Blues 🎸</option>
          <option value="Honky Tonk Hits">👢 Honky Tonk Hits 👢</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="extra-keyword" className="form-label">Whats Special In This Pic?</label>
        <input
          type="text"
          id="extra-keyword"
          className="form-control"
          placeholder="Optional, but helps inspiration"
          value={extraKeyword}
          onChange={(e) => setExtraKeyword(e.target.value)}
        />
      </div>
      <button
  onClick={handleSubmit}
  disabled={!selectedFile || loading}
  className="btn d-flex align-items-center justify-content-center mx-auto"
  style={{
    backgroundColor: '#4b2e83', // Purple shade matching the note emojis
    borderColor: '#32006e', // Slightly darker shade for border
    color: 'white', // White text for contrast
    padding: '10px 20px',
    borderRadius: '8px', // Rounded button edges
    fontWeight: 'bold',
  }}
>
  {loading ? (
    <>
      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      MUSE-ing...
    </>
  ) : (
    'Generate Song Lyrics'
  )}
</button>


      {lyrics && (
        <div className="mt-5">          
          <h2>🎶 My Lyrics 🎶</h2>          
          <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left', padding: '1em', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            {lyrics}
          </pre>
          
          <p>Play this song in the key of <strong> {key}</strong></p>
          <p>Play a beat at <strong> {bpm} BPM</strong></p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
