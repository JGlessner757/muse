import AWS from 'aws-sdk';
import axios from 'axios';

const rekognition = new AWS.Rekognition();

// Define a list of "boring" words to filter out
const boringWords = ['male', 'female', 'person', 'accessories', 'object', 'human', 'people'];

export const handler = async (event) => {
  try {
    // Parse the event body
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { image, style, bpm, key, extraKeyword } = body;

    // Step 1: Process the image with Rekognition
    const params = {
      Image: {
        Bytes: Buffer.from(image, 'base64'),
      },
    };

    const rekognitionData = await rekognition.detectLabels(params).promise();
    let labels = rekognitionData.Labels.map((label) => label.Name);

    // Filter out boring words
    labels = labels.filter((label) => !boringWords.includes(label.toLowerCase()));

    const labelsString = labels.join(', ');

    // Construct the OpenAI prompt
    let prompt = '';
    if (style === 'Trop Rock') {
      prompt = `Write a Trop Rock song with a relaxed vibe around ${bpm} BPM in the key of ${key} with lyrics prominently featuring the keyword "${extraKeyword}". Use the following vivid words creatively: ${labelsString}. The song should onlyhave 2 verses and a chorus. Write the song as Jimmy Buffett would. Use a common 3 or 4-chord progression suitable for the key, like I–V–vi–IV or I–vi–IV–V, and ensure the lyrics and chord changes fit smoothly with the BPM of ${bpm}. In the output, label where each chord change should take place.`;
    } else if (style === 'Southern Blues') {
      prompt = `Write a Southern Blues song with a soulful vibe around ${bpm} BPM in the key of ${key} with lyrics prominently featuring the keyword "${extraKeyword}". Use the following vivid words creatively: ${labelsString}. The song should only have 2 verses and a chorus. Write the song as Chris Stapleton would. Use a common 3 or 4-chord progression suitable for the key, like I–V–vi–IV or I–vi–IV–V, and ensure the lyrics and chord changes fit smoothly with the BPM of ${bpm}. In the output, label where each chord change should take place.`;
    } else if (style === 'Honky Tonk Hits') {
      prompt = `Write a song with an upbeat-bootstomping vibe around ${bpm} BPM in the key of ${key} with lyrics prominently featuring the keyword "${extraKeyword}". Use the following vivid words creatively: ${labelsString}. The song should only have 2 verses and a chorus. Write the song as Toby Keith would. Use a common 3 or 4-chord progression suitable for the key, like I–V–vi–IV or I–vi–IV–V, and ensure the lyrics and chord changes fit smoothly with the BPM of ${bpm}. In the output, label where each chord change should take place.`;
    }

    // Step 2: Call OpenAI API
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract the lyrics from the OpenAI response
    const lyrics = openaiResponse.data.choices[0].message.content.trim();
    console.log('Generated Lyrics:', lyrics);

    // Return the lyrics, key, and BPM
    return {
      statusCode: 200,
      body: JSON.stringify({
        lyrics: lyrics,
        key: key,
        bpm: bpm,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      },
    };
  } catch (error) {
    console.error('Error processing image with Rekognition or OpenAI:', error.message || error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process image and generate lyrics',
        details: error.message || error,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      },
    };
  }
};
