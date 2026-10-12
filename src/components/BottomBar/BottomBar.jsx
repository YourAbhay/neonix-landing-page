import { FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

function BottomBar() {
  return (
    <div className="bottom-bar">
      <div className="container">
        <div className="row">
          <div className="span-3">
            <button className="play-button">▶ Play Intro</button>
          </div>

          <div className="span-3">
            <div className="bottom-item">
              <span>01</span>
              <p>Creative digital solutions.</p>
            </div>
          </div>

          <div className="span-3">
            <div className="bottom-item">
              <span>02</span>
              <p>Technology meets design.</p>
            </div>
          </div>

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
