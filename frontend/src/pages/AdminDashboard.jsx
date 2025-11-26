import React, { useState, useEffect } from 'react';
import { surveyAPI } from '../services/api';
import { exportService } from '../services/exportService';

const AdminDashboard = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [filter, setFilter] = useState('all');
  const [exporting, setExporting] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      window.location.href = '/admin-login';
      return;
    }
    setAuthenticated(true);
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const data = await surveyAPI.getResponses();
      setResponses(data);
    } catch (err) {
      setError('Failed to fetch responses. Make sure the backend is running.');
      console.error('Error fetching responses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    window.location.href = '/admin-login';
  };

  const filteredResponses = responses.filter(response => {
    if (filter === 'all') return true;
    return response.selected_option === filter;
  });

  const handleExportCSV = async () => {
    try {
      setExporting('csv');
      const dataToExport = filter === 'all' ? responses : filteredResponses;
      exportService.exportToCSV(dataToExport, `mmesa-survey-${filter.toLowerCase()}`);
    } catch (err) {
      console.error('Export error:', err);
      alert('Error exporting data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting('excel');
      const dataToExport = filter === 'all' ? responses : filteredResponses;
      exportService.exportToExcel(dataToExport, `mmesa-survey-${filter.toLowerCase()}`);
    } catch (err) {
      console.error('Export error:', err);
      alert('Error exporting data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getSelectionSummary = (response) => {
    let majors = 0;
    let subs = 0;
    
    // Count selections from all categories
    for (let i = 1; i <= 7; i++) {
      const category = response[`category${i}_selections`];
      if (category && Array.isArray(category)) {
        category.forEach(module => {
          if (module && module.includes('*')) {
            majors++;
          } else if (module) {
            subs++;
          }
        });
      }
    }
    
    const softwareCount = response.software_selections?.length || 0;
    return { majors, subs, software: softwareCount };
  };

  if (!authenticated) {
    return (
      <div className="dashboard-container">
        <div className="loading-message">
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-message">
          <h2>Loading Survey Responses...</h2>
          <p>Please wait while we fetch the data.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={fetchResponses} className="btn btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Admin Header */}
      <div className="admin-header">
        <div className="admin-title">
          <h1>MMESA Survey Admin Dashboard</h1>
          <p>Manage and analyze survey responses</p>
        </div>
        <button onClick={handleLogout} className="btn btn-logout">
          Logout
        </button>
      </div>

      {/* Statistics Summary */}
      <div className="stats-grid">
        <div className="stat-card total">
          <h3>Total Responses</h3>
          <p className="stat-number">{responses.length}</p>
        </div>
        <div className="stat-card option1">
          <h3>Option 1</h3>
          <p className="stat-number">
            {responses.filter(r => r.selected_option === 'Option 1').length}
          </p>
        </div>
        <div className="stat-card option2">
          <h3>Option 2</h3>
          <p className="stat-number">
            {responses.filter(r => r.selected_option === 'Option 2').length}
          </p>
        </div>
        <div className="stat-card option3">
          <h3>Option 3</h3>
          <p className="stat-number">
            {responses.filter(r => r.selected_option === 'Option 3').length}
          </p>
        </div>
      </div>

      {/* Filter and Export Controls */}
      <div className="dashboard-controls">
        <div className="control-group">
          <div className="filter-control">
            <label className="control-label">
              Filter by Option:
            </label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="control-select"
            >
              <option value="all">All Options</option>
              <option value="Option 1">Option 1</option>
              <option value="Option 2">Option 2</option>
              <option value="Option 3">Option 3</option>
            </select>
          </div>
          <button onClick={fetchResponses} className="btn btn-refresh">
            Refresh Data
          </button>
        </div>

        <div className="export-control">
          <span className="export-label">Export Data:</span>
          <button 
            onClick={handleExportCSV} 
            className="btn btn-export-csv"
            disabled={exporting || filteredResponses.length === 0}
          >
            {exporting === 'csv' ? 'Exporting...' : 'Export CSV'}
          </button>
          <button 
            onClick={handleExportExcel} 
            className="btn btn-export-excel"
            disabled={exporting || filteredResponses.length === 0}
          >
            {exporting === 'excel' ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* Export Info */}
      {filteredResponses.length > 0 && (
        <div className="export-info">
          <p>
            Showing {filteredResponses.length} response(s) for export. 
            {filter !== 'all' && ` Filtered by: ${filter}`}
          </p>
        </div>
      )}

      {/* Responses Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>Survey Responses ({filteredResponses.length})</h3>
        </div>
        <table className="responses-table">
          <thead>
            <tr>
              <th>Index Number</th>
              <th>Email</th>
              <th>Year</th>
              <th>Option</th>
              <th>Selections</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredResponses.map((response) => {
              const summary = getSelectionSummary(response);
              return (
                <tr key={response.id}>
                  <td className="index-cell">{response.index_number}</td>
                  <td className="email-cell">{response.email}</td>
                  <td className="year-cell">{response.year_of_study}</td>
                  <td className="option-cell">
                    <span className={`option-badge option-${response.selected_option?.replace(' ', '').toLowerCase()}`}>
                      {response.selected_option}
                    </span>
                  </td>
                  <td className="selections-cell">
                    {summary.majors}M, {summary.subs}S, {summary.software}SW
                  </td>
                  <td className="date-cell">
                    {new Date(response.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => setSelectedResponse(response)}
                      className="btn btn-view"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredResponses.length === 0 && (
          <div className="no-data">
            <p>No responses found for the selected filter.</p>
          </div>
        )}
      </div>

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Response Details</h2>
              <button
                onClick={() => setSelectedResponse(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  <div>
                    <strong>Index Number:</strong> {selectedResponse.index_number}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedResponse.email}
                  </div>
                  <div>
                    <strong>Year of Study:</strong> {selectedResponse.year_of_study}
                  </div>
                  <div>
                    <strong>Phone:</strong> {selectedResponse.phone_number}
                  </div>
                  <div>
                    <strong>Selected Option:</strong> {selectedResponse.selected_option}
                  </div>
                  <div>
                    <strong>Submitted:</strong> {new Date(selectedResponse.submitted_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Module Selections */}
              {[1, 2, 3, 4, 5, 6, 7].map(categoryNum => {
                const selections = selectedResponse[`category${categoryNum}_selections`];
                if (!selections || selections.length === 0) return null;
                
                return (
                  <div key={categoryNum} className="detail-section">
                    <h3>Category {categoryNum} Selections</h3>
                    <ul className="module-list">
                      {selections.map((module, index) => (
                        <li key={index} className={module.includes('*') ? 'major-module' : 'sub-module'}>
                          {module}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {/* Software Selections */}
              {selectedResponse.software_selections && selectedResponse.software_selections.length > 0 && (
                <div className="detail-section">
                  <h3>Software Selections</h3>
                  <ul className="software-list">
                    {selectedResponse.software_selections.map((software, index) => (
                      <li key={index}>{software}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional Courses */}
              {selectedResponse.additional_courses && (
                <div className="detail-section">
                  <h3>Additional Course Suggestions</h3>
                  <p className="additional-courses">{selectedResponse.additional_courses}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;