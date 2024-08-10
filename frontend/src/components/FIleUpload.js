import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle file input change
  const onFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Handle form submission
  const onFileUpload = async () => {
    if (!file) {
      setMessage('Please select a file before uploading.');
      return;
    }

    setUploading(true);
    setMessage('');

    // Create FormData object to send file to server
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send file to server
      const response = await axios.post('http://localhost:3001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(response.data);
    } catch (error) {
      setMessage('Error uploading file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };
  console.log(file)

  return (
    <div>
      <h1>File Upload</h1>
      <input type="file" onChange={onFileChange} />
      <button onClick={onFileUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FileUpload;
