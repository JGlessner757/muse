import AWS from 'aws-sdk';
import axios from 'axios';

const rekognition = new AWS.Rekognition();

export const handler = async (event) => {
  try {
    // Step 1: Process the image with Rekognition
    const image = event.body; // The image will be sent as a base64-encoded string

    const params = {
      Image: {
        Bytes: Buffer.from(image, 'base64')
      }
    };

    const rekognitionData = await rekognition.detectLabels(params).promise();

    // Combine the labels into a single string as a description
    const labels = rekognitionData.Labels.map(label => label.Name).join(', ');
    console.log("Rekognition Description:", labels);

    // Step 2: Call OpenAI API to generate lyrics based on the description
    try {
      const openaiApiKey = process.env.OPENAI_API_KEY;
      const openaiResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Write a song in a lyrical style using the following words: ${labels}`
            }
          ],
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            "Authorization": `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Extract the lyrics text from OpenAI response
      const lyrics = openaiResponse.data.choices[0].message.content.trim();
      console.log("Generated Lyrics:", lyrics);
      
      // Return the Rekognition description and generated lyrics
      return {
        statusCode: 200,
        body: JSON.stringify({ description: labels, lyrics: lyrics }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // Allow CORS for frontend access
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization'
        },
      };
    } catch (error) {
      console.error("Error calling OpenAI API:", error.response ? error.response.data : error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to generate lyrics from OpenAI API' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // Allow CORS for frontend access
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization'
        },
      };
    }
  } catch (error) {
    console.error("Error processing image with Rekognition:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process image and generate lyrics' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow CORS for frontend access
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization'
      },
    };
  }
};
