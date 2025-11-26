import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export const exportService = {
  // Export to CSV
  exportToCSV: (responses, filename = 'mmesa-survey-responses') => {
    const flattenedData = responses.map(response => flattenResponse(response));
    
    const csv = Papa.unparse(flattenedData, {
      header: true,
      delimiter: ','
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  },

  // Export to Excel
  exportToExcel: (responses, filename = 'mmesa-survey-responses') => {
    const flattenedData = responses.map(response => flattenResponse(response));
    
    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Survey Responses');
    
    // Auto-size columns
    const colWidths = [];
    flattenedData.forEach(row => {
      Object.keys(row).forEach((key, index) => {
        const length = String(row[key]).length;
        if (!colWidths[index] || length > colWidths[index]) {
          colWidths[index] = length;
        }
      });
    });
    
    worksheet['!cols'] = colWidths.map(width => ({ width: Math.min(width + 2, 50) }));
    
    XLSX.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
  }
};

// Helper function to flatten nested response data
const flattenResponse = (response) => {
  const flattened = {
    'ID': response.id,
    'Index Number': response.index_number,
    'Email': response.email,
    'Year of Study': response.year_of_study,
    'Phone Number': response.phone_number,
    'Selected Option': response.selected_option,
    'Submitted At': new Date(response.submitted_at).toLocaleString(),
  };

  // Flatten category selections
  for (let i = 1; i <= 7; i++) {
    const categoryKey = `category${i}_selections`;
    const selections = response[categoryKey];
    if (selections && Array.isArray(selections)) {
      flattened[`Category ${i} Selections`] = selections.join('; ');
    } else {
      flattened[`Category ${i} Selections`] = '';
    }
  }

  // Flatten software selections
  const softwareSelections = response.software_selections;
  if (softwareSelections && Array.isArray(softwareSelections)) {
    flattened['Software Selections'] = softwareSelections.join('; ');
  } else {
    flattened['Software Selections'] = '';
  }

  // Additional courses
  flattened['Additional Courses'] = response.additional_courses || '';

  return flattened;
};