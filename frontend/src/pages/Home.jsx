import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1 className="welcome-title">
          Welcome to the MMESA Short Course Survey
        </h1>
        <p className="welcome-description">
          Phase 2 aims to offer additional information and gather more precise facts about course choice. 
          This form is organized into two main sections to streamline your selection process.
        </p>
      </div>

      {/* Module Selection Section */}
      <div className="section-card">
        <h2 className="section-title">Section 1: Module Selection</h2>
        <p className="section-description">
          Choose from a list of available modules. Select the ones that align with your academic interests or field of study.
        </p>
      </div>

      {/* Engineering Software Section */}
      <div className="section-card">
        <h2 className="section-title">Section 2: Engineering Software</h2>
        <p className="section-description">
          Focuses on software applications commonly used in engineering. Select your preferred software or areas you'd like practical exposure in.
        </p>
      </div>

      {/* Important Note */}
      <div className="note-section">
        <p className="note-text">
          <strong>Note:</strong> Courses are not free, but the Kumah-Mensah Led Administration is working to reduce fees so every participant can afford them.
        </p>
      </div>

      {/* Start Survey Button */}
      <div className="action-section">
        <Link to="/survey" className="start-survey-button">
          Start Survey
        </Link>
      </div>
    </div>
  );
};

export default Home;