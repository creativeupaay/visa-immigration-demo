import axios from 'axios';

export const downloadFile = async (url: string, filename?: string) => {
  try {
    const response = await axios.get(url, {
      responseType: 'blob',
      withCredentials: true,
    });

    // Get filename from Content-Disposition header or use provided filename
    const contentDisposition = response.headers['content-disposition'];
    let downloadFilename = filename || 'download.xlsx';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch) {
        downloadFilename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Create blob URL and trigger download
    const blobUrl = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = downloadFilename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up blob URL
    window.URL.revokeObjectURL(blobUrl);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};
