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
  
        // Prepare keywords for prompt
        const combinedKeywords = extraKeyword ? `${keywords}, ${extraKeyword}` : keywords;
  
        // Updated prompt with increased max_tokens
        let prompt = `Create a song in the style of ${style} with lyrics prominently featuring the keyword "${extraKeyword}" and inspired by the keywords ${combinedKeywords}. The song should be written in the key of ${key} and follow this structure, in this exact order:

1. CHORUS - Emphasize the main theme with memorable, catchy lines featuring the extra keyword.
2. VERSE 1 - Introduce the theme, incorporating supporting keywords naturally.
3. VERSE 2 - Expand on Verse 1, maintaining a similar rhythm and theme.

Each section should be labeled clearly, with the text "CHORUS," "VERSE 1," and "VERSE 2" at the start of each respective section. Use a common 4-chord progression suitable for the key, like I–V–vi–IV or I–vi–IV–V, and ensure the lyrics and chord changes fit smoothly with the BPM of ${bpm}.
`;
        let response = await axios.post('https://ghvgmdk314.execute-api.us-east-2.amazonaws.com/prod/museImageAnalyzer', {
          image: base64Image,
          prompt: prompt,
          max_tokens: 700 // Allows for a larger response
        });
  
        let lyrics = response.data.lyrics.replace(/\\n/g, '\n');
  
        // Check if lyrics appear cut off (e.g., if they don't end with Verse 2)
        if (!lyrics.includes("Verse 2") || lyrics.endsWith("...")) {
          const continuationPrompt = "Please continue the song lyrics starting from where they left off.";
          response = await axios.post('https://ghvgmdk314.execute-api.us-east-2.amazonaws.com/prod/museImageAnalyzer', {
            prompt: continuationPrompt,
            max_tokens: 300 // Adjust as needed for continuation
          });
          lyrics += "\n" + response.data.lyrics.replace(/\\n/g, '\n');
        }
  
        setLyrics(lyrics);
  
        // Filter top 5 keywords used in the lyrics
        const usedKeywords = response.data.description
          .split(',')
          .filter(keyword => lyrics.includes(keyword))
          .slice(0, 5)
          .join(', ');
          
        setKeywords(usedKeywords);
      } catch (error) {
        console.error('Error in API request:', error);
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

      <div className="mb-3">
        <label htmlFor="extra-keyword" className="form-label">What's Happening Around You? (optional):</label>
        <input type="text" className="form-control" id="extra-keyword" value={extraKeyword} onChange={(e) => setExtraKeyword(e.target.value)} />
      </div>

      <button onClick={handleSubmit} disabled={!selectedFile || loading} className="btn btn-primary">
        {loading ? 'Generating...' : 'Generate Lyrics'}
      </button>

      {lyrics && (
  <div className="lyrics-container mt-5 p-4 border rounded bg-light">
    <h2>🎶Lyrics🎶</h2>
    <pre className="pre-wrap">{lyrics}</pre>
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
