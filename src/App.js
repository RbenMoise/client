import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [youtubeResults, setYoutubeResults] = useState([]);
  const [fmaResults, setFmaResults] = useState([]);
  const [soundcloudResults, setSoundcloudResults] = useState([]);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);

  // Test backend connection
  const testConnection = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/test');
      setConnectionStatus(response.data.message);
      setError(null);
    } catch (err) {
      setConnectionStatus(null);
      setError('Failed to connect to backend: ' + err.message);
    }
  };

  // Search all APIs
  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setYoutubeResults([]);
    setFmaResults([]);
    setSoundcloudResults([]);
    try {
      // YouTube
      const youtubeRes = await axios.get('http://localhost:5000/api/search/youtube', {
        params: { query },
      });
      setYoutubeResults(youtubeRes.data);

      // Free Music Archive
      const fmaRes = await axios.get('http://localhost:5000/api/search/fma', {
        params: { query },
      });
      setFmaResults(fmaRes.data);

      // SoundCloud
      const soundcloudRes = await axios.get('http://localhost:5000/api/search/soundcloud', {
        params: { query },
      });
      setSoundcloudResults(soundcloudRes.data);
    } catch (err) {
      console.error('API Error:', err.response?.data || err.message);
      setError('Failed to fetch results: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="app">
      <h1> Downloader</h1>
      <button onClick={testConnection} className="test-button">
        Test Backend Connection
      </button>
      {connectionStatus && <p className="success">{connectionStatus}</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for songs or artists"
          required
        />
        <button type="submit">Search</button>
      </form>
      <section>
        <h2>YouTube Results</h2>
        <ul>
          {youtubeResults.map((video) => (
            <li key={video.id.videoId}>
              <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} />
              <span>{video.snippet.title}</span>
              <a
                href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link-button"
              >
                Watch
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Free Music Archive Results</h2>
        <ul>
          {fmaResults.map((track) => (
            <li key={track.identifier}>
              <span>{track.title} by {track.creator}</span>
              <a
                href={`https://archive.org/download/${track.identifier}/${track.source}`}
                download
                className="download-button"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>SoundCloud Results</h2>
        <ul>
          {soundcloudResults.map((track) => (
            <li key={track.id}>
              <span>{track.title} by {track.user.username}</span>
              {track.download_url && (
                <a
                  href={`${track.download_url}?client_id=${process.env.REACT_APP_SOUNDCLOUD_CLIENT_ID}`}
                  download
                  className="download-button"
                >
                  Download
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;