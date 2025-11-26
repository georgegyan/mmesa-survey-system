import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { surveyAPI } from '../services/api';

const Survey = () => {
  const { register, handleSubmit, watch, formState: { errors }, getValues, trigger } = useForm();
  const [selectionCount, setSelectionCount] = useState({ majors: 0, subs: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  const watchedOption = watch('selectedOption');

  // Monitor selections to enforce rules
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name?.startsWith('category') || name === 'software') {
        updateSelectionCount();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSelectionCount]);

  const updateSelectionCount = React.useCallback(() => {
    const values = getValues();
    let majors = 0;
    let subs = 0;

    // Count major modules (those with * in category names)
    Object.keys(values).forEach(key => {
      if (key.startsWith('category') && Array.isArray(values[key])) {
        values[key].forEach(module => {
          if (module && module.includes('*')) {
            majors++;
          } else if (module) {
            subs++;
          }
        });
      }
    });

    // Only update state when counts actually change to avoid extra re-renders
    setSelectionCount(prev => {
      if (prev.majors === majors && prev.subs === subs) return prev;
      return { majors, subs };
    });
  }, [getValues]);

  const nextStep = async () => {
    let isValid = false;

    // Validate current step
    switch (currentStep) {
      case 1:
        isValid = await trigger(['email', 'indexNumber', 'yearOfStudy', 'phoneNumber']);
        break;
      case 2:
        isValid = await trigger(['selectedOption']);
        break;
      case 3:
        // Module selection validation happens in final submission
        isValid = true;
        break;
      default:
        isValid = false;
    }

    if (isValid) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      console.log('Submitting data:', data);
      
      // Validate selection rules based on option
      const { majors, subs } = selectionCount;
      const softwareCount = data.software ? data.software.length : 0;
      const totalSelections = majors + subs + softwareCount;
      
      let isValid = true;
      let errorMessage = '';

      switch (data.selectedOption) {
        case 'Option 1':
          if (majors !== 2 || totalSelections !== 2) {
            isValid = false;
            errorMessage = 'Option 1 requires exactly 2 major modules (no software allowed)';
          }
          break;
        case 'Option 2':
          if (majors !== 1 || totalSelections !== 3) {
            isValid = false;
            errorMessage = 'Option 2 requires 1 major module + 2 sub-modules/software';
          }
          break;
        case 'Option 3':
          if (majors > 0 || totalSelections !== 4) {
            isValid = false;
            errorMessage = 'Option 3 requires exactly 4 sub-modules/software (no major modules)';
          }
          break;
        default:
          isValid = false;
          errorMessage = 'Please select an option';
      }

      if (!isValid) {
        setSubmitMessage(`Error: ${errorMessage}`);
        setIsSubmitting(false);
        return;
      }

      // Submit to backend API
      const response = await surveyAPI.submitResponse(data);
      console.log('Response submitted successfully:', response);
      
      setSubmitMessage('success:Survey submitted successfully! A confirmation email has been sent to your email address. Thank you for your participation.');
      
      // Reset form after successful submission
      setTimeout(() => {
        window.location.href = '/';
      }, 5000);
      
    } catch (error) {
      console.error('Submission error:', error);
      
      if (error.response) {
        setSubmitMessage(`Error: ${error.response.data.detail || 'Failed to submit survey. Please try again.'}`);
      } else if (error.request) {
        setSubmitMessage('Error: Cannot connect to server. Please check your internet connection and ensure the backend is running.');
      } else {
        setSubmitMessage('Error: An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCategory = (categoryNumber, categoryTitle, modules) => (
    <div className="category-section" key={categoryNumber}>
      <h3 className="category-title">Category {categoryNumber}: {categoryTitle}</h3>
      <p className="category-note">
        ▲ Kindly note that the text in asterisk * is the major module and those without asterisks are sub-modules ▲
      </p>
      
      <div className="checkbox-group">
        {modules.map((module, index) => (
          <label 
            key={index} 
            className={`checkbox-option ${module.includes('*') ? 'major-module' : 'sub-module'}`}
          >
            <input
              type="checkbox"
              value={module}
              {...register(`category${categoryNumber}`)}
              className="checkbox-input"
            />
            <span className={`module-name ${module.includes('*') ? 'major' : ''}`}>
              {module}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  // Progress Steps
  const steps = [
    { number: 1, title: 'Personal Information' },
    { number: 2, title: 'Module Option' },
    { number: 3, title: 'Module Selection' },
    { number: 4, title: 'Review & Submit' }
  ];

  return (
    <div className="survey-container">
      <div className="survey-header">
        <h1 className="survey-title">
          MMESA Short Course Survey
        </h1>
        <p className="survey-subtitle">
          Phase 2: Module Selection
        </p>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        {steps.map((step, index) => (
          <div key={step.number} className={`step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}>
            <div className="step-number">{step.number}</div>
            <div className="step-title">{step.title}</div>
            {index < steps.length - 1 && <div className="step-connector"></div>}
          </div>
        ))}
      </div>

      {/* Submit Message */}
      {submitMessage && (
        <div className={`submit-message ${submitMessage.startsWith('success:') ? 'success' : 'error'}`}>
          {submitMessage.replace('success:', '')}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="survey-form">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="form-step active">
            <h2 className="step-heading">Personal Information</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Email *
                </label>
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className="form-input"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Index Number *
                </label>
                <input
                  type="text"
                  {...register("indexNumber", { required: "Index number is required" })}
                  className="form-input"
                  placeholder="Enter your index number"
                />
                {errors.indexNumber && (
                  <p className="form-error">{errors.indexNumber.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  What is your current year of study? *
                </label>
                <select
                  {...register("yearOfStudy", { required: "Year of study is required" })}
                  className="form-input"
                >
                  <option value="">Select year</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3">Year 3</option>
                  <option value="Year 4">Year 4</option>
                </select>
                {errors.yearOfStudy && (
                  <p className="form-error">{errors.yearOfStudy.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Your active telephone number / WhatsApp number *
                </label>
                <input
                  type="tel"
                  {...register("phoneNumber", { required: "Phone number is required" })}
                  className="form-input"
                  placeholder="Enter your phone number"
                />
                {errors.phoneNumber && (
                  <p className="form-error">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>

            <div className="form-navigation">
              <button type="button" className="btn btn-next" onClick={nextStep}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Module Selection Option */}
        {currentStep === 2 && (
          <div className="form-step active">
            <h2 className="step-heading">Module Selection Option</h2>
            
            <div className="option-notice">
              <p>
                <strong>Important:</strong> Please read the following options carefully. You must select only ONE of the three options below. 
                Your chosen option will define the exact structure and number of modules you select.
              </p>
            </div>

            <div className="option-group">
              <div className="option-item">
                <input
                  type="radio"
                  id="option1"
                  value="Option 1"
                  {...register("selectedOption", { required: "Please select an option" })}
                  className="option-input"
                />
                <label htmlFor="option1" className="option-label">
                  <strong>Option 1:</strong> Only 2 major modules
                </label>
              </div>

              <div className="option-item">
                <input
                  type="radio"
                  id="option2"
                  value="Option 2"
                  {...register("selectedOption")}
                  className="option-input"
                />
                <label htmlFor="option2" className="option-label">
                  <strong>Option 2:</strong> Only 3 modules (1 major module + 2 sub-modules)
                </label>
              </div>

              <div className="option-item">
                <input
                  type="radio"
                  id="option3"
                  value="Option 3"
                  {...register("selectedOption")}
                  className="option-input"
                />
                <label htmlFor="option3" className="option-label">
                  <strong>Option 3:</strong> Only 4 sub-modules of your choice from any category
                </label>
              </div>
            </div>
            {errors.selectedOption && (
              <p className="form-error">{errors.selectedOption.message}</p>
            )}

            <div className="form-navigation">
              <button type="button" className="btn btn-prev" onClick={prevStep}>
                Back
              </button>
              <button type="button" className="btn btn-next" onClick={nextStep}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Module Categories */}
        {currentStep === 3 && watchedOption && (
          <div className="form-step active">
            <h2 className="step-heading">Module Categories</h2>
            
            {/* Selection Summary */}
            <div className="selection-summary">
              <p>
                <strong>Selected Option:</strong> {watchedOption} | 
                <strong> Current Selection:</strong> {selectionCount.majors} major(s), {selectionCount.subs} sub(s)
              </p>
              {watchedOption === 'Option 1' && (
                <p className="selection-rule">Requires: 2 major modules</p>
              )}
              {watchedOption === 'Option 2' && (
                <p className="selection-rule">Requires: 1 major module + 2 sub-modules</p>
              )}
              {watchedOption === 'Option 3' && (
                <p className="selection-rule">Requires: 4 sub-modules only (no major modules)</p>
              )}
            </div>

            {/* Categories */}
            {renderCategory(1, "Drilling & Blasting Technology", [
              "*Drilling & Blasting Technology*",
              "Rock Mechanics & Geology for Drilling & Blasting",
              "Drilling Technology & Equipment",
              "Explosives Science & Technology",
              "Blast Design & Engineering",
              "Blasting Operations & Safety Management",
              "Blast Monitoring, Analysis & Optimization",
              "Environmental Management & Specialized Applications"
            ])}

            {renderCategory(2, "Mine Excavation & Materials Transportation", [
              "*Mine Excavation & Materials Transportation*",
              "Mine Production Systems & Planning",
              "Excavation Equipment & Operations",
              "Loading Systems & Material Handling",
              "Hauling & Transportation Systems",
              "Equipment Maintenance & Reliability",
              "Safety Management & Operational Controls",
              "Performance Monitoring & Continuous Improvement"
            ])}

            {/* Add more categories as needed */}

            {/* Engineering Software Section */}
            <div className="software-section">
              <h3 className="section-title">Engineering Related Software</h3>
              
              <div className="software-notice">
                <p>
                  <strong>Important Notice:</strong> Selecting a software will count as part of your total selections according to the option you choose.
                </p>
              </div>

              <div className="checkbox-group">
                {[
                  "Ball Mill Simulation Software",
                  "Datamine",
                  "Deswik",
                  "Leapfrog",
                  "Surpac",
                  "ArcGIS",
                  "Matlab",
                  "Ansys",
                  "Solidworks",
                  "Autocad"
                ].map((software, index) => (
                  <label key={index} className="checkbox-option">
                    <input
                      type="checkbox"
                      value={software}
                      {...register("software")}
                      className="checkbox-input"
                    />
                    <span className="module-name">{software}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-navigation">
              <button type="button" className="btn btn-prev" onClick={prevStep}>
                Back
              </button>
              <button type="button" className="btn btn-next" onClick={nextStep}>
                Continue to Review
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review and Submit */}
        {currentStep === 4 && (
          <div className="form-step active">
            <h2 className="step-heading">Review Your Selections</h2>
            
            <div className="review-section">
              <h3>Personal Information</h3>
              <div className="review-grid">
                <div><strong>Email:</strong> {watch('email')}</div>
                <div><strong>Index Number:</strong> {watch('indexNumber')}</div>
                <div><strong>Year of Study:</strong> {watch('yearOfStudy')}</div>
                <div><strong>Phone:</strong> {watch('phoneNumber')}</div>
              </div>
            </div>

            <div className="review-section">
              <h3>Selected Option</h3>
              <p><strong>{watch('selectedOption')}</strong></p>
            </div>

            <div className="review-section">
              <h3>Module Selections Summary</h3>
              <p><strong>{selectionCount.majors} major module(s), {selectionCount.subs} sub-module(s)</strong></p>
              {watch('software') && watch('software').length > 0 && (
                <p><strong>{watch('software').length} software selection(s)</strong></p>
              )}
            </div>

            {/* Additional Courses */}
            <div className="form-group">
              <label className="form-label">
                Any additional short course you would like the department to consider?
                <span className="optional-text"> (Optional)</span>
              </label>
              <textarea
                {...register("additionalCourses")}
                className="form-input"
                placeholder="Enter any additional course suggestions..."
                rows="3"
              />
            </div>

            <div className="form-navigation">
              <button type="button" className="btn btn-prev" onClick={prevStep}>
                Back
              </button>
              <button type="submit" className="btn btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Survey'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Survey;