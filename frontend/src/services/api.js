import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
export const surveyAPI = {
  // Submit survey response
  submitResponse: async (surveyData) => {
    try {
      // Transform the frontend data structure to match backend model
      const transformedData = {
        email: surveyData.email,
        index_number: surveyData.indexNumber,
        year_of_study: surveyData.yearOfStudy,
        phone_number: surveyData.phoneNumber,
        selected_option: surveyData.selectedOption,
        
        // Transform category data to match backend field names
        category1_selections: surveyData.category1 || [],
        category2_selections: surveyData.category2 || [],
        category3_selections: surveyData.category3 || [],
        category4_selections: surveyData.category4 || [],
        category5_selections: surveyData.category5 || [],
        category6_selections: surveyData.category6 || [],
        category7_selections: surveyData.category7 || [],
        
        // Software selections
        software_selections: surveyData.software || [],
        
        // Additional courses
        additional_courses: surveyData.additionalCourses || '',
      };
      
      console.log('Sending data to backend:', transformedData);
      const response = await api.post('/responses/', transformedData);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Get all survey responses
  getResponses: async () => {
    try {
      const response = await api.get('/responses/');
      return response.data;
    } catch (error) {
      console.error('API Error fetching responses:', error);
      throw error;
    }
  },

  // Get single response by ID
  getResponse: async (id) => {
    try {
      const response = await api.get(`/responses/${id}/`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

export default api;