import React, { useState } from 'react';
import axios from 'axios';
import { FaSearch, FaCopy, FaDownload } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import './App.css';

const ITEMS_PER_PAGE = 500; // Pagination limit per page

function App() {
    const [url, setUrl] = useState('');
    const [transcript, setTranscript] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [analysis, setAnalysis] = useState('');

    const handleAnalyze = async () => {
        try {
            const response = await axios.post('/api/analyze-transcript', { transcript });
            setAnalysis(response.data.analyzedTranscript);
          } catch (error) {
            console.error('Error analyzing transcript:', error);
            alert('Failed to analyze transcript.');
        }
    };

    const handleAIDownloadPDF = async () => {
      try {
          const response = await axios.post('/api/download-analyzed-pdf',
              { content: analysis }, // Send data in body
              { responseType: 'blob' }     // Important for file data
          );

          console.log(response);
          
  
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.setAttribute('download', 'analyzed_transcript.pdf');
          document.body.appendChild(link);
          link.click();
          link.remove();
      } catch (error) {
          console.error('Error downloading PDF:', error);
          alert('Failed to download PDF.');
      }
  };

    const fetchTranscript = async () => {
        setLoading(true);
        setError('');
        setTranscript('');
        setCurrentPage(1);

        try {
            const response = await axios.get(`/api/transcript?url=${url}`);
            setTranscript(response.data.transcript);
        } catch (err) {
            setError('Failed to fetch transcript. Check the URL or try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(transcript);
        alert('Transcript copied to clipboard!');
    };

    const downloadPDF = () => {
        const pdf = new jsPDF();
        pdf.setFont('helvetica');
        pdf.setFontSize(12);
        const splitText = pdf.splitTextToSize(transcript, 180);
        pdf.text(splitText, 10, 10);
        pdf.save('Transcript.pdf');
    };

    const totalPages = Math.ceil(transcript.length / ITEMS_PER_PAGE);
    const displayedText = transcript.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="app-container">
            <div className="card">
                <h1>YouTube Transcript Extractor</h1>
                <div className="input-container">
                    <input
                        type="text"
                        placeholder="Enter YouTube URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <button onClick={fetchTranscript}>
                        <FaSearch /> Get Transcript
                    </button>
                </div>

                {transcript && (
                    <div className="action-buttons">
                        <button onClick={copyToClipboard}>
                            <FaCopy /> Copy
                        </button>
                        <button onClick={downloadPDF}>
                            <FaDownload /> Download PDF
                        </button>
                        <div className="buttons">
                            <button onClick={handleAnalyze}>AI Analyzer</button>
                            {analysis && <button onClick={handleAIDownloadPDF}>Download Analyzed PDF</button>}
                        </div>
                    </div>
                )}

                {loading && <p className="loading">⏳ Fetching transcript...</p>}

                {transcript && (
                    <div className="transcript-container">
                        <h3>Transcript:</h3>
                        <p>{displayedText}</p>

                        <div className="pagination">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index + 1}
                                    className={index + 1 === currentPage ? 'active' : ''}
                                    onClick={() => setCurrentPage(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
}

export default App;
