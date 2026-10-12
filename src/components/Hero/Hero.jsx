import { motion } from "motion/react";


function Hero() {
  return (
    <section className="hero" id="home">
      <div className="container">
        <div className="row">

          {/* IMAGE */}
          <div className="span-7">
            <motion.div
              className="hero-image-wrapper"
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <img
                src="/hero-woman.jpeg"
                alt="Futuristic woman"
                className="hero-image"
              />
            </motion.div>
          </div>

          {/* CONTENT */}
          <div className="span-5">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <p className="hero-label">
                DIGITAL INNOVATION STUDIOs
              </p>

              <h1>
                NEONIX-ABHAY
              </h1>

              <p className="hero-description">
                We innovate. We secure. We transform.
                Step into the future with our cutting-edge solutions.
              </p>

              <div className="hero-buttons">
                <button >Discover</button>
                <button >Connect with us</button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;