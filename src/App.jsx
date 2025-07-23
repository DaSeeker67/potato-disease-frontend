import React, { useState, useCallback } from 'react';


const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export default function App() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setPrediction(null); 
      setError(''); 
    }
  };

  // Handles the prediction logic
  const handleDetect = useCallback(async () => {
    if (!imageFile) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setPrediction(null);

    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await fetch('https://us-central1-potato-466816.cloudfunctions.net/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok, status: ${response.status}`);
      }

      const data = await response.json();
      setPrediction(data);

    } catch (err) {
        console.error("Fetch Error:", err);
        setError('Failed to get a prediction. The model endpoint might be down or the image format is incorrect.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  return (
    <div className="bg-gray-100 min-h-screen font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 md:p-8">
        
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Potato Disease Detection</h1>
          <p className="text-gray-500 mt-2">Upload an image of a potato leaf to classify its disease.</p>
        </header>

        <main>
          {/* Image Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-green-500 transition-colors">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <UploadIcon />
              <span className="mt-2 text-sm font-medium text-gray-600">
                {imageFile ? imageFile.name : 'Click to upload an image'}
              </span>
            </label>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-6 text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Image Preview</h3>
              <img src={imagePreview} alt="Preview" className="max-w-xs mx-auto rounded-lg shadow-md"/>
            </div>
          )}

          {/* Action Button */}
          <div className="text-center mb-6">
            <button
              onClick={handleDetect}
              disabled={!imageFile || isLoading}
              className="w-full md:w-auto bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {isLoading ? 'Detecting...' : 'Detect Disease'}
            </button>
          </div>

          {/* Results Section */}
          {isLoading && <div className="text-center text-gray-500">Analyzing image...</div>}
          
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">{error}</div>}

          {prediction && (
            <div className="bg-gray-50 rounded-lg p-6 shadow-inner">
                <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Detection Result</h2>
                <div className="flex items-center justify-center bg-white p-4 rounded-lg shadow">
                    <LeafIcon />
                    <div className="ml-4">
                        <p className="text-xl font-bold text-gray-900">{prediction.class}</p>
                        <p className="text-md text-gray-600">
                            Confidence: 
                            <span className="font-semibold text-green-600"> {parseFloat(prediction.confidence).toFixed(2)}%</span>
                        </p>
                    </div>
                </div>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
