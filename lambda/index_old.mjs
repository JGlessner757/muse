import AWS from 'aws-sdk';
import axios from 'axios';

const rekognition = new AWS.Rekognition();

// List of stale words to filter out from Rekognition
const staleWords = ['male', 'female', 'person', 'accessories', 'clothing'];

function filterAndEnhanceLabels(labels) {
  return labels
    .filter((label) => !staleWords.includes(label.toLowerCase())) // Remove stale words
    .map((label) => {
      // Enhance specific words
      if (label.toLowerCase() === 'sand') return 'soft sand';
      //if (label.toLowerCase() === 'beach') return 'sun-kissed beach';
      //if (label.toLowerCase() === 'sky') return 'vast blue sky';
      return label; // Keep other labels as they are
    });
}

export const handler = async (event) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const image = body.image;
    const style = body.style || 'Trop Rock';
    const bpm = body.bpm || '100';
    const key = body.key || 'C';

    const params = {
      Image: {
        Bytes: Buffer.from(image, 'base64'),
      },
    };

    const rekognitionData = await rekognition.detectLabels(params).promise();
    let labels = rekognitionData.Labels.map((label) => label.Name);
    labels = filterAndEnhanceLabels(labels);
    const labelsString = labels.join(', ');

    let prompt = '';
    if (style === 'Trop Rock') {
      prompt = `Write a Trop Rock song with a relaxed vibe around ${bpm} BPM in the key of ${key} with lyrics prominently featuring the keyword ${extraKeyword}. Use the following vivid words creatively: ${labelsString}. The song should have 3 verses and 2 choruses. Write the song as Jimmy Buffett would. Use a common 3 or 4-chord progression suitable for the key, like I–V–vi–IV or I–vi–IV–V, and ensure the lyrics and chord changes fit smoothly with the BPM of ${bpm}. In the ouptut, label where each chord change should take place`;
    } else if (style === 'Southern Blues') {
      prompt = `Write a Southern Blues song with a soulful vibe around ${bpm} BPM in the key of ${key} with lyrics prominently featuring the keyword ${extraKeyword}. Use the following vivid words creatively: ${labelsString}. The song should have 3 verses and 2 choruses. Write the song as Chris Stapleton would. Use a common 3 or 4-chord progression suitable for the key, like I–V–vi–IV or I–vi–IV–V, and ensure the lyrics and chord changes fit smoothly with the BPM of ${bpm}. In the ouptut, label where each chord change should take place`;
    } else if (style === 'Honky Tonk Hits') {
      prompt = `Write a song with an upbeat-bootstomping vibe around ${bpm} BPM in the key of ${key} with lyrics prominently featuring the keyword ${extraKeyword}. Use the following vivid words creatively: ${labelsString}. The song should have 3 verses and 2 choruses. Write the song as Toby Keith would. Use a common 3 or 4-chord progression suitable for the key, like I–V–vi–IV or I–vi–IV–V, and ensure the lyrics and chord changes fit smoothly with the BPM of ${bpm}. In the ouptut, label where each chord change should take place`;
    }

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
        max_tokens: 500, // Increased token limit to handle longer lyrics
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const lyrics = openaiResponse.data.choices[0].message.content.trim();
    console.log('Generated Lyrics:', lyrics);

    return {
      statusCode: 200,
      body: JSON.stringify({ description: labelsString, lyrics }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      },
    };
  } catch (error) {
    console.error('Error processing image with Rekognition or OpenAI:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process image and generate lyrics' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      },
    };
  }
};
