import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Search, X } from "lucide-react";
import { FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

const API_URL = "https://saavnapi-nine.vercel.app";

function getSongList(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data?.results)) return result.data.results;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.results)) return result.results;
  if (Array.isArray(result?.songs)) return result.songs;
  return [];
}

function getAudioUrl(song) {
  if (song?.streamUrl) return song.streamUrl;

  if (song?.downloadUrl && typeof song.downloadUrl === "string") {
    return song.downloadUrl;
  }

  const urls = song?.downloadUrl;

  if (Array.isArray(urls)) {
    const preferred =
      urls.find((item) => item.quality === "320kbps") ||
      urls.find((item) => item.quality === "160kbps") ||
      urls.find((item) => item.quality === "96kbps") ||
      urls[urls.length - 1];

    return typeof preferred === "string" ? preferred : preferred?.url || "";
  }

  return song?.url || song?.media_url || "";
}

// Add more locally stored songs to this array.
// Put the audio files inside public/music/ and use URLs like /music/song-name.mp3.
const MANUAL_SONGS = [
  {
    id: "manual-1",
    title: "Mera Mann",
    artist: "Artist",
    streamUrl: "/music/Mera-Mann.mp3",
  },
];

function normalizeTrack(song, index = 0) {
  const artist =
    song?.artists?.primary
      ?.map((item) => item.name)
      .filter(Boolean)
      .join(", ") ||
    song?.primaryArtists ||
    song?.artist ||
    song?.artists ||
    "Unknown artist";

  return {
    id: String(song?.id || song?.songId || `${song?.name || "song"}-${index}`),
    title: song?.name || song?.title || "Unknown song",
    artist: typeof artist === "string" ? artist : "Unknown artist",
    streamUrl: getAudioUrl(song),
  };
}

function BottomBar() {
  const audioRef = useRef(null);
  const shouldAutoplayRef = useRef(false);
  const requestIdRef = useRef(0);

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

  // Load Hindi songs when the component mounts.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchTrendingTracks() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/result?query=${encodeURIComponent("Best Bollywood Hindi Songs")}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Unable to load songs.");
        }

        const result = await response.json();
        const apiTracks = getSongList(result)
          .map((song, index) => normalizeTrack(song, index))
          .filter((song) => song.streamUrl);

        const allTracks = [...MANUAL_SONGS, ...apiTracks];

        if (!allTracks.length) {
          throw new Error("No playable songs found.");
        }

        setQueue(allTracks);
        setTrack(allTracks[0]);
        setCurrentIndex(0);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("JioSaavn error:", err);

          // Keep manually added songs available even if the API fails.
          if (MANUAL_SONGS.length) {
            setQueue(MANUAL_SONGS);
            setTrack(MANUAL_SONGS[0]);
            setCurrentIndex(0);
          } else {
            setError("Music is currently unavailable.");
          }
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

  // Play a selected song after its audio source updates.
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !track || !shouldAutoplayRef.current) return;

    shouldAutoplayRef.current = false;
    audio.load();

    audio.play().catch((err) => {
      console.error("Playback error:", err);
      setIsPlaying(false);
      setError("Unable to play this song. Try another song.");
    });
  }, [track]);

  // Search both manually added songs and songs from the API.
  const searchTracks = async (event) => {
     console.log("SEARCH FUNCTION CALLED");
    event.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    const requestId = ++requestIdRef.current;

    try {
      setIsSearching(true);
      setError("");
      setSearchResults([]);

      //   const manualResults = MANUAL_SONGS.filter((song) =>
      //     `${song.title} ${song.artist}`.toLowerCase().includes(query.toLowerCase()),
      //   );
      const normalizedQuery = query.toLowerCase().trim();

      const manualResults = MANUAL_SONGS.filter(
        (song) =>
          song.title.toLowerCase().includes(normalizedQuery) ||
          song.artist.toLowerCase().includes(normalizedQuery),
      );

      let apiTracks = [];

      try {
        const response = await fetch(
          `${API_URL}/result?query=${encodeURIComponent(query)}`,
        );

        if (response.ok) {
          const result = await response.json();
          apiTracks = getSongList(result)
            .map((song, index) => normalizeTrack(song, index))
            .filter((song) => song.streamUrl);
        }
      } catch (apiError) {
        // Manual song matches can still be shown if the API is unavailable.
        console.error("JioSaavn search error:", apiError);
      }

      // Ignore older search responses.
      if (requestId !== requestIdRef.current) return;

      const allResults = [...manualResults, ...apiTracks];
      console.log("Search query:", query);
      console.log("Manual results:", manualResults);
      console.log("All results:", allResults);
      setSearchResults(allResults);
      console.log("Final search results:", allResults);

      if (!allResults.length) {
        setError("No playable songs found. Try another search.");
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        console.error("Music search error:", err);
        setError("Search failed. Please try again.");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsSearching(false);
      }
    }
  };

  // Select a song and create a queue.
  const selectTrack = (selectedTrack, tracks = queue) => {
    const selectedQueue = tracks.length ? tracks : [selectedTrack];
    const index = selectedQueue.findIndex(
      (item) => item.id === selectedTrack.id,
    );
    const audio = audioRef.current;

    if (audio) audio.pause();

    setIsPlaying(false);
    setQueue(selectedQueue);
    setCurrentIndex(index >= 0 ? index : 0);
    setTrack(selectedTrack);
    setError("");
    shouldAutoplayRef.current = true;
  };

  // Play and pause.
  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio || !track || isLoading) return;

    if (audio.paused) {
      try {
        setError("");
        await audio.play();
      } catch (err) {
        console.error("Playback error:", err);
        setIsPlaying(false);
        setError("Unable to play this song. Try another song.");
      }
    } else {
      audio.pause();
    }
  };

  // Previous and next songs.
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

  const streamUrl = track?.streamUrl || undefined;

  return (
    <div className="bottom-bar">
      <div className="container">
        <div className="row">
          {/* MUSIC PLAYER */}
          <div className="span-12">
            <div className="music-player">
              <div className="music-controls">
                <button
                  type="button"
                  className="music-nav-button"
                  onClick={playPrevious}
                  disabled={!queue.length || isLoading}
                  aria-label="Previous track"
                  title="Previous"
                >
                  <SkipBack size={16} />
                </button>

                <button
                  type="button"
                  className="play-button"
                  onClick={toggleMusic}
                  disabled={isLoading || !track}
                  aria-label={isPlaying ? "Pause music" : "Play music"}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  <span>
                    {isLoading
                      ? "Loading Music..."
                      : isPlaying
                        ? "Pause Music"
                        : "Play Music"}
                  </span>
                </button>

                <button
                  type="button"
                  className="music-nav-button"
                  onClick={playNext}
                  disabled={!queue.length || isLoading}
                  aria-label="Next track"
                  title="Next"
                >
                  <SkipForward size={16} />
                </button>

                {/* SEARCH BUTTON */}
                <button
                  type="button"
                  className="music-nav-button"
                  onClick={() => {
                    setIsSearchOpen((open) => !open);
                    setError("");
                  }}
                  aria-label={isSearchOpen ? "Close search" : "Search music"}
                  title="Search music"
                >
                  {isSearchOpen ? <X size={16} /> : <Search size={16} />}
                </button>
              </div>

              {/* CURRENT TRACK */}
              {track && (
                <div className="music-track-info">
                  <span className="music-track-title">{track.title}</span>
                  <span className="music-track-artist">{track.artist}</span>
                </div>
              )}

              {/* SEARCH PANEL */}
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
                          onClick={() => {
                            selectTrack(item, searchResults);
                            setIsSearchOpen(false);
                          }}
                        >
                          <span className="music-result-text">
                            <span className="music-result-title">
                              {item.title}
                            </span>
                            <span className="music-result-artist">
                              {item.artist}
                            </span>
                          </span>
                          <Play size={15} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ERROR MESSAGE */}
              {error && (
                <p className="music-error" role="status">
                  {error}
                </p>
              )}

              {/* AUDIO */}
              <audio
                ref={audioRef}
                src={streamUrl}
                preload="none"
                onPlay={() => {
                  setIsPlaying(true);
                  setError("");
                }}
                onPause={() => setIsPlaying(false)}
                onEnded={playNext}
                onError={() => {
                  setIsPlaying(false);
                  if (track && !isLoading) {
                    setError("This song could not be played. Try another.");
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* BOTTOM INFO */}
        <div className="row bottom-info-row">
          {/* ITEM 01 */}
          <div className="span-5">
            <div className="bottom-item">
              <span>01</span>
              <p>Creative digital solutions.</p>
            </div>
          </div>

          {/* ITEM 02 */}
          <div className="span-5">
            <div className="bottom-item">
              <span>02</span>
              <p>Technology meets design.</p>
            </div>
          </div>

          {/* SOCIAL LINKS */}
          <div className="span-2">
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
