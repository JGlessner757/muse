import AWS from 'aws-sdk';
import axios from 'axios';

const rekognition = new AWS.Rekognition();

// List of stale words to filter out from Rekognition
const staleWords = ['male', 'female', 'person', 'accessories', 'clothing'];

// Function to filter and enhance Rekognition labels
function filterAndEnhanceLabels(labels) {
  return labels
    .filter((label) => !staleWords.includes(label.toLowerCase())) // Remove stale words
    .map((label) => {
      // Enhance specific words
      if (label.toLowerCase() === 'tree') return 'majestic tree';
      if (label.toLowerCase() === 'beach') return 'sun-kissed beach';
      if (label.toLowerCase() === 'sky') return 'vast blue sky';
      return label; // Keep other labels as they are
    });
}

export const handler = async (event) => {
  try {
    // Parse the event body if it's a JSON string
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const image = body.image; // Assuming the body contains a field called `image` with base64-encoded data
    const style = body.style || 'Trop Rock'; // Default to Trop Rock if no style is provided
    const bpm = body.bpm || '100'; // Default to 100 BPM
    const key = body.key || 'C'; // Default to C key

    // Step 1: Process the image with Rekognition
    const params = {
      Image: {
        Bytes: Buffer.from(image, 'base64')
      }
    };

    const rekognitionData = await rekognition.detectLabels(params).promise();

    // Filter and enhance Rekognition labels
    let labels = rekognitionData.Labels.map((label) => label.Name);
    labels = filterAndEnhanceLabels(labels);
    const labelsString = labels.join(', ');

    console.log("Enhanced Rekognition Labels:", labelsString);

    // Step 2: Construct a tailored prompt for OpenAI based on style
    let prompt = '';
    if (style === 'Trop Rock') {
      prompt = `Write a Trop Rock song with a relaxed, poetic vibe around ${bpm} BPM in the key of ${key}. Use the following vivid words creatively: ${labelsString}. The song should have 2 verses and a chorus, focusing on the joy of beach life with storytelling and metaphors.`;
    } else if (style === 'Southern Blues') {
      prompt = `Write a Southern Blues song with a soulful, emotional tone around ${bpm} BPM in the key of ${key}. Use the following vivid words creatively: ${labelsString}. The song should explore themes of longing and self-reflection, with 2 verses and a heartfelt chorus.`;
    } else if (style === 'Honky Tonk Hits') {
      prompt = `Write an upbeat Honky Tonk song around ${bpm} BPM in the key of ${key}. Use the following descriptive words: ${labelsString}. Focus on fun, lively lyrics with a playful tone. Include 2 verses and a catchy chorus.`;
    }

    console.log("Constructed Prompt for OpenAI:", prompt);

    // Step 3: Call OpenAI API to generate lyrics
    try {
      const openaiApiKey = process.env.OPENAI_API_KEY;
      const openaiResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 250, // Increased max tokens for longer lyrics
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
        body: JSON.stringify({ description: labelsString, lyrics: lyrics }),
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
