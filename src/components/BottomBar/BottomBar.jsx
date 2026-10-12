import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Search, X } from "lucide-react";
import { FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

const API_URL = "https://discoveryprovider.audius.co/v1";
const APP_NAME = "NEONIX";

function BottomBar() {
  const audioRef = useRef(null);
  const shouldAutoplayRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [track, setTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load trending tracks when the component mounts
  useEffect(() => {
    const controller = new AbortController();

    async function fetchTrendingTracks() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/tracks/trending?app_name=${APP_NAME}&limit=20`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Unable to load trending tracks.");
        }

        const result = await response.json();

        const tracks = (result.data || []).filter(
          (item) => item.id && item.is_streamable !== false,
        );

        if (!tracks.length) {
          throw new Error("No tracks available.");
        }

        setQueue(tracks);
        setTrack(tracks[0]);
        setCurrentIndex(0);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Audius error:", err);
          setError("Music is currently unavailable.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchTrendingTracks();

    return () => controller.abort();
  }, []);

  // Play a newly selected track after its audio source updates
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !track || !shouldAutoplayRef.current) return;

    shouldAutoplayRef.current = false;
    audio.load();

    audio.play().catch((err) => {
      console.error("Playback error:", err);
      setIsPlaying(false);
      setError("Unable to play this track. Try another song.");
    });
  }, [track]);

  // Search tracks by title or artist
  const searchTracks = async (event) => {
    event.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    try {
      setIsSearching(true);
      setError("");
      setSearchResults([]);

      const response = await fetch(
        `${API_URL}/tracks/search?query=${encodeURIComponent(query)}&app_name=${APP_NAME}&limit=15`,
      );

      if (!response.ok) {
        throw new Error("Search request failed.");
      }

      const result = await response.json();

      const tracks = (result.data || []).filter(
        (item) => item.id && item.is_streamable !== false,
      );

      setSearchResults(tracks);

      if (!tracks.length) {
        setError("No songs found. Try another search.");
      }
    } catch (err) {
      console.error("Audius search error:", err);
      setError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Select a song and play it
  const selectTrack = (selectedTrack, tracks = queue) => {
    const selectedQueue = tracks.length ? tracks : [selectedTrack];
    const index = selectedQueue.findIndex(
      (item) => item.id === selectedTrack.id,
    );

    setQueue(selectedQueue);
    setCurrentIndex(index >= 0 ? index : 0);
    setTrack(selectedTrack);
    setError("");
    shouldAutoplayRef.current = true;
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;

    if (!audio || !track || isLoading) return;

    if (audio.paused) {
      try {
        setError("");
        await audio.play();
      } catch (err) {
        console.error("Playback error:", err);
        setError("Unable to play this track. Try another song.");
      }
    } else {
      audio.pause();
    }
  };

  const playTrackAt = (index) => {
    if (!queue.length) return;

    const nextIndex = (index + queue.length) % queue.length;
    selectTrack(queue[nextIndex], queue);
  };

  const playPrevious = () => {
    const audio = audioRef.current;

    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    playTrackAt(currentIndex - 1);
  };

  const playNext = () => {
    playTrackAt(currentIndex + 1);
  };

  const streamUrl = track
    ? `${API_URL}/tracks/${track.id}/stream?app_name=${APP_NAME}`
    : undefined;

  return (
    <div className="bottom-bar">
      <div className="container">
        <div className="row">
          {/* MUSIC PLAYER */}
          <div className="span-3">
            <div className="music-player">
              <div className="music-controls">
                <button
                  type="button"
                  className="music-nav-button"
                  onClick={playPrevious}
                  aria-label="Previous track"
                >
                  <SkipBack size={16} />
                </button>

                <button
                  type="button"
                  className="play-button"
                  onClick={toggleMusic}
                  aria-label={isPlaying ? "Pause music" : "Play music"}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isPlaying ? "Pause Music" : "Play Music"}</span>
                </button>

                <button
                  type="button"
                  className="music-nav-button"
                  onClick={playNext}
                  aria-label="Next track"
                >
                  <SkipForward size={16} />
                </button>
              </div>

              {track && (
                <div className="music-track-info">
                  <span className="music-track-title">{track.title}</span>
                  <span className="music-track-artist">
                    {track.user?.name || "Unknown artist"}
                  </span>
                </div>
              )}

              {isSearchOpen && (
                <div className="music-search-panel">
                  <form className="music-search-form" onSubmit={searchTracks}>
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search songs or artists..."
                      aria-label="Search songs or artists"
                    />

                    <button
                      type="submit"
                      disabled={isSearching || !searchQuery.trim()}
                      aria-label="Submit music search"
                    >
                      <Search size={17} />
                    </button>
                  </form>

                  {isSearching && (
                    <p className="music-search-message">Searching songs...</p>
                  )}

                  {!isSearching && searchResults.length > 0 && (
                    <div className="music-search-results">
                      {searchResults.map((item) => (
                        <button
                          type="button"
                          className="music-search-result"
                          key={item.id}
                          onClick={() => selectTrack(item, searchResults)}
                        >
                          <span className="music-result-text">
                            <span className="music-result-title">
                              {item.title}
                            </span>
                            <span className="music-result-artist">
                              {item.user?.name || "Unknown artist"}
                            </span>
                          </span>
                          <Play size={15} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="music-error" role="status">
                  {error}
                </p>
              )}

              <audio
                ref={audioRef}
                src={streamUrl}
                preload="none"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={playNext}
                onError={() => {
                  setIsPlaying(false);
                  setError("This track could not be played. Try another.");
                }}
              />
            </div>
          </div>

          {/* ITEM 01 */}
          <div className="span-3">
            <div className="bottom-item">
              <span>01</span>
              <p>Creative digital solutions.</p>
            </div>
          </div>

          {/* ITEM 02 */}
          <div className="span-3">
            <div className="bottom-item">
              <span>02</span>
              <p>Technology meets design.</p>
            </div>
          </div>

          {/* SOCIAL LINKS */}
          <div className="span-3">
            <div className="social-links">
              <a
                href="https://www.instagram.com/abhay.jsx/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>

              <a
                href="https://www.linkedin.com/in/abhay-munakhiya-8656162b0/?isSelfProfile=true"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn />
              </a>

              <a
                href="https://x.com/i_shiv24"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
              >
                <FaTwitter />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BottomBar;
