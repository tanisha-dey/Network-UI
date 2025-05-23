import React, { useState } from 'react';

function Home() {
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('csvFile');
    if (!fileInput.files.length) {
      alert('Please select a CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    setLoading(true);
    setError('');
    setPredictions([]);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict_csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setLoading(false);

      if (data.error) {
        setError(data.error);
      } else {
        setPredictions(data.predictions);
      }
    } catch (err) {
      setLoading(false);
      setError('Error contacting the server.');
    }
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          height: 100%;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
                      url('bg-2.jpg') no-repeat center center fixed;
          background-size: cover;
          color: white;
          display: flex;
          flex-direction: column;
        }
        header {
          background-color: rgba(0, 0, 0, 0.85);
          padding: 30px 50px;
          font-size: 28px;
          font-weight: 600;
          text-align: center;
          letter-spacing: 1px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.7);
        }
        .container {
          flex: 1;
          max-width: 400px;
          background: rgba(0, 0, 0, 0.45);
          margin: 50px auto 30px;
          border-radius: 15px;
          padding: 40px 30px;
          box-shadow: 0 0 20px 9px #ff61241f;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        h1 {
          color: #F3C693;
          margin-bottom: 40px;
          font-weight: 700;
          letter-spacing: 1.1px;
        }
        input[type="file"] {
          background: transparent;
          color: white;
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 2px solid #F3C693;
          cursor: pointer;
          font-size: 16px;
          transition: border-color 0.3s ease;
        }
        input[type="file"]:hover {
          border-color: #d9a969;
        }
        .submit-btn {
          margin-top: 30px;
          width: 100%;
          background: #F3C693;
          border: none;
          padding: 15px 0;
          font-size: 18px;
          font-weight: 700;
          border-radius: 30px;
          cursor: pointer;
          color: black;
          transition: background 0.3s ease;
        }
        .submit-btn:hover {
          background: #d9a969;
        }
        #predResults {
          margin-top: 40px;
          max-height: 280px;
          overflow-y: auto;
          width: 100%;
          font-size: 17px;
          text-align: left;
        }
        #predResults ul {
          list-style: none;
          padding-left: 20px;
        }
        #predResults li {
          margin-bottom: 10px;
          line-height: 1.4;
        }
        footer {
          background-color: rgba(0, 0, 0, 0.85);
          color: white;
          padding: 20px 10px;
          text-align: center;
          font-size: 15px;
          box-shadow: 0 -4px 10px rgba(0,0,0,0.7);
        }
        @media(max-width: 480px) {
          .container {
            max-width: 90%;
            padding: 30px 20px;
            margin: 30px auto 20px;
          }
          header {
            font-size: 22px;
            padding: 20px 20px;
          }
        }
      `}</style>

      <header>Network Intrusion Detection System - CSV Batch Prediction</header>

      <div className="container">
        <h1>Upload CSV File</h1>
        <form onSubmit={handleSubmit}>
          <input type="file" id="csvFile" accept=".csv" required />
          <button type="submit" className="submit-btn">Upload & Predict</button>
        </form>
        <div id="predResults">
          {loading && <p>Processing... Please wait.</p>}
          {error && <p style={{ color: '#ff6b6b' }}>Error: {error}</p>}
          {predictions.length > 0 && (
            <div>
              <h3>Predictions:</h3>
              <ul>
                {predictions.map((pred, idx) => (
                  <li key={idx}>
                    Row {idx + 1}: {pred === 1 ? '⚠️ Anomaly Detected' : '✅ Normal Traffic'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <footer>&copy; 2025 Network Detection | All rights reserved.</footer>
    </>
  );
}

export default Home;
