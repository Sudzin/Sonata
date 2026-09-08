const fs = require('fs');

let code = fs.readFileSync('src/context/PlayerContext.tsx', 'utf8');

// Add repeatMode to context type
code = code.replace(
  /isShuffled: boolean;/,
  `isShuffled: boolean;\n  repeatMode: 'none' | 'all' | 'one';`
);

// Add toggleRepeat to context type
code = code.replace(
  /toggleShuffle: \(\) => void;/,
  `toggleShuffle: () => void;\n  toggleRepeat: () => void;`
);

// Add repeatMode state
code = code.replace(
  /const \[isShuffled, setIsShuffled\] = useState\(false\);/,
  `const [isShuffled, setIsShuffled] = useState(false);\n  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');`
);

// Initialize volume from localStorage
code = code.replace(
  /const \[volume, setVolumeState\] = useState\(1\);/,
  `const [volume, setVolumeState] = useState(() => {\n    const saved = localStorage.getItem('sonata_volume');\n    return saved ? parseFloat(saved) : 1;\n  });`
);

// Add volume effect
code = code.replace(
  /useEffect\(\(\) => \{\n    localStorage.setItem\('lang', language\);\n  \}, \[language\]\);/,
  `useEffect(() => {\n    localStorage.setItem('lang', language);\n  }, [language]);\n\n  useEffect(() => {\n    engine.setVolume(volume);\n  }, []);\n\n  useEffect(() => {\n    localStorage.setItem('sonata_volume', volume.toString());\n  }, [volume]);`
);

// Fix nextTrack logic to respect repeatMode
code = code.replace(
  /const nextTrack = \(\) => \{\n    if \(queue\.length === 0\) return;\n    let nextIdx = currentTrackIndex \+ 1;\n    if \(nextIdx >= queue\.length\) nextIdx = 0;\n    playTrack\(queue\[nextIdx\], queue\);\n  \};/,
  `const nextTrack = () => {\n    if (queue.length === 0) return;\n    if (repeatMode === 'one' && currentTime < duration - 1) {\n      engine.seek(0);\n      engine.play();\n      return;\n    }\n    let nextIdx = currentTrackIndex + 1;\n    if (nextIdx >= queue.length) {\n      if (repeatMode === 'none') return;\n      nextIdx = 0;\n    }\n    playTrack(queue[nextIdx], queue);\n  };`
);

// Add toggleRepeat function
code = code.replace(
  /const toggleShuffle = \(\) => \{\n    setIsShuffled\(!isShuffled\);\n  \};/,
  `const toggleShuffle = () => {\n    setIsShuffled(!isShuffled);\n  };\n\n  const toggleRepeat = () => {\n    const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];\n    const idx = modes.indexOf(repeatMode);\n    setRepeatMode(modes[(idx + 1) % modes.length]);\n  };`
);

// Export them
code = code.replace(
  /isShuffled,\n\s*language,/,
  `isShuffled,\n        repeatMode,\n        language,`
);

code = code.replace(
  /toggleShuffle,\n\s*setLanguage/,
  `toggleShuffle,\n        toggleRepeat,\n        setLanguage`
);

fs.writeFileSync('src/context/PlayerContext.tsx', code);
console.log("PlayerContext updated!");
