import React, { useState } from 'react';
import axios from 'axios';

function ImageUpload() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Replace this with your API Gateway endpoint URL
  const apiUrl = "https://ghvgmdk314.execute-api.us-east-2.amazonaws.com/prod";

  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
    setDescription(""); // Clear previous description
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!selectedImage) {
      alert("Please upload an image first.");
      return;
    }
  
    try {
      setLoading(true);
      console.log("Image selected:", selectedImage);
  
      // Convert the image file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result.split(",")[1]; // Remove the data:image part
        console.log("Base64 image generated:", base64Image.slice(0, 30) + "..."); // Log first part of base64 string
  
        try {
          // Send the base64 image to the Lambda function
          const response = await axios.post(apiUrl, JSON.stringify({ image: base64Image }), {
            headers: {
              "Content-Type": "application/json",
            },
          });
          console.log("Response from Lambda:", response.data);
  
          // Display the description
          setDescription(response.data.description);
        } catch (error) {
          console.error("Error in API request:", error);
          alert("Failed to process image in API.");
        }
        
        setLoading(false);
      };
  
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        alert("Failed to read image file.");
        setLoading(false);
      };
  
      reader.readAsDataURL(selectedImage);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Muse - Generate Song Lyrics from Your Image</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Generate Lyrics"}
        </button>
      </form>
      {description && (
        <div>
          <h2>Description:</h2>
          <p>{description}</p>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
