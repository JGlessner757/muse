import AWS from 'aws-sdk';
import axios from 'axios';

const rekognition = new AWS.Rekognition();

export const handler = async (event) => {
  try {
    // Validate and parse the event body
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    if (!body || !body.image) {
      throw new Error("Missing required field 'image'. Ensure the image is provided as a base64 string.");
    }

    const { image, style, bpm, key } = body;

    if (!style || !bpm || !key) {
      throw new Error("Missing required fields 'style', 'bpm', or 'key'. Ensure all parameters are provided.");
    }

    // Step 1: Process the image with Rekognition
    const params = {
      Image: {
        Bytes: Buffer.from(image, 'base64'),
      },
    };

    const rekognitionData = await rekognition.detectLabels(params).promise();

    // Combine the labels into a single string as a description
    const labels = rekognitionData.Labels.map((label) => label.Name).join(', ');
    console.log('Rekognition Description:', labels);

    // Step 2: Call OpenAI API to generate lyrics based on the description and provided parameters
    try {
      const openaiApiKey = process.env.OPENAI_API_KEY;
      const openaiResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `Create a song in the style of ${style} with a BPM of ${bpm} and in the key of ${key}. 
                        Use these keywords: ${labels}. Structure the song as follows: 
                        1. CHORUS - Main theme with memorable lines.
                        2. VERSE 1 - Introduce the theme naturally.
                        3. VERSE 2 - Expand on Verse 1. 
                        Ensure each section starts with "CHORUS" or "VERSE" and includes strong lyrical imagery.`,
            },
          ],
          max_tokens: 700,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Extract the lyrics text from OpenAI response
      const lyrics = openaiResponse.data.choices[0].message.content.trim();
      console.log('Generated Lyrics:', lyrics);

      // Return the Rekognition description and generated lyrics
      return {
        statusCode: 200,
        body: JSON.stringify({ description: labels, lyrics: lyrics }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
      };
    } catch (error) {
      console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to generate lyrics from OpenAI API' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
      };
    }
  } catch (error) {
    console.error('Error processing image with Rekognition or OpenAI:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process image and generate lyrics', details: error.message }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      },
    };
  }
};
