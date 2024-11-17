# Create a song in the style of ${style} with lyrics prominently featuring the keyword "${extraKeyword}" and inspired by the keywords ${combinedKeywords}. Write the song as Bob Dylan would. The song should be written in the key of ${key} and follow this structure, in this exact order:

#1. CHORUS - Emphasize the main theme with memorable, catchy lines featuring the extra keyword.
#2. VERSE 1 - Introduce the theme, incorporating supporting keywords naturally.
#3. VERSE 2 - Expand on Verse 1, maintaining a similar rhythm and theme.

#Each section should be labeled clearly, with the text "CHORUS," "VERSE 1," and "VERSE 2" at the start of each respective section. Use a common 4-chord progression suitable for the key, like I–V–vi–IV or I–vi–IV–V, and ensure the lyrics and chord changes fit smoothly with the BPM of ${bpm}.

  let prompt = '';
    if (style === 'Trop Rock') {
      prompt = `Write a Trop Rock song with a relaxed vibe around ${bpm} BPM in the key of ${key} with lyrics prominently featuring the keyword ${extraKeyword}. Use the following vivid words creatively: ${labelsString}. The song should have 3 verses and 2 choruses. Write the song as Jimmy Buffett would. Use a common 3 or 4-chord progression suitable for the key, like I–V–vi–IV or I–vi–IV–V, and ensure the lyrics and chord changes fit smoothly with the BPM of ${bpm}. In the ouptut, label where each chord change should take place`;
    } else if (style === 'Southern Blues') {
      prompt = `Write a Southern Blues song with a soulful vibe around ${bpm} BPM in the key of ${key} with lyrics prominently featuring the keyword ${extraKeyword}. Use the following vivid words creatively: ${labelsString}. The song should have 3 verses and 2 choruses. Write the song as Chris Stapleton would. Use a common 3 or 4-chord progression suitable for the key, like I–V–vi–IV or I–vi–IV–V, and ensure the lyrics and chord changes fit smoothly with the BPM of ${bpm}. In the ouptut, label where each chord change should take place`;
    } else if (style === 'Honky Tonk Hits') {
      prompt = `Write a song with an upbeat-bootstomping vibe around ${bpm} BPM in the key of ${key} with lyrics prominently featuring the keyword ${extraKeyword}. Use the following vivid words creatively: ${labelsString}. The song should have 3 verses and 2 choruses. Write the song as Toby Keith would. Use a common 3 or 4-chord progression suitable for the key, like I–V–vi–IV or I–vi–IV–V, and ensure the lyrics and chord changes fit smoothly with the BPM of ${bpm}. In the ouptut, label where each chord change should take place`;
    }