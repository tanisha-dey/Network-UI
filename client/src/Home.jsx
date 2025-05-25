import React, { useState, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Papa from "papaparse";

function Home() {
  const [predictions, setPredictions] = useState([]);
  const [inputData, setInputData] = useState([]); // Parsed CSV rows as objects
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Parse CSV file to JSON objects on client side
  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (err) => reject(err),
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const file = fileInputRef.current.files[0];
    if (!file) {
      alert("Please select a CSV file.");
      return;
    }

    setLoading(true);
    setError("");
    setPredictions([]);
    setInputData([]);

    try {
      // Parse CSV locally for table display
      const parsed = await parseCSV(file);
      setInputData(parsed);

      // Send file to backend for prediction
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`http://127.0.0.1:5000/predict_csv?model=combined`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        if (!data.predictions || data.predictions.length !== parsed.length) {
          setError("Mismatch between input rows and predictions from server.");
        } else {
          setPredictions(data.predictions);
        }
      } else {
        setError(data.error || "Unexpected server error.");
      }
    } catch (err) {
      setError("Error processing the file or contacting server.");
    } finally {
      setLoading(false);
    }
  };

  // Count anomalies and normal predictions for bar chart and summary
  const anomalyCount = predictions.filter((p) => p === 1).length;
  const normalCount = predictions.length - anomalyCount;

  // Judgment based on anomaly count (you can customize thresholds)
  const attackJudgment =
    anomalyCount > 0
      ? anomalyCount / predictions.length > 0.1
        ? "⚠️ Attack Likely"
        : "⚠️ Suspicious Activity"
      : "✅ No Attack Detected";

  // Prepare CSV for download: add prediction column to input data
  const downloadCSV = () => {
    if (!inputData.length || !predictions.length) return;

    const dataWithPredictions = inputData.map((row, idx) => ({
      ...row,
      Prediction: predictions[idx] === 1 ? "Anomaly" : "Normal",
    }));

    const csv = Papa.unparse(dataWithPredictions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "predictions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Data for BarChart
  const chartData = [
    { name: "Normal", count: normalCount },
    { name: "Anomaly", count: anomalyCount },
  ];

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
                      url('./bg-2.img') no-repeat center center fixed;
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
          max-width: 900px;
          background: rgba(0, 0, 0, 0.55);
          margin: 30px auto 50px;
          border-radius: 15px;
          padding: 30px 40px;
          box-shadow: 0 0 20px 9px #ff61241f;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        h1 {
          color: #F3C693;
          margin-bottom: 30px;
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
          margin-bottom: 20px;
        }
        input[type="file"]:hover {
          border-color: #d9a969;
        }
        .submit-btn {
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
          margin-bottom: 20px;
        }
        .submit-btn:hover {
          background: #d9a969;
        }
        #predResults {
          margin-top: 20px;
          max-height: 280px;
          overflow-y: auto;
          width: 100%;
          font-size: 17px;
          text-align: left;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 15px 20px;
        }
        #predResults ul {
          list-style: none;
          padding-left: 20px;
        }
        #predResults li {
          margin-bottom: 10px;
          line-height: 1.4;
        }
        .anomaly {
          color: #ff6b6b;
          font-weight: bold;
        }
        .normal {
          color: #98fb98;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 25px;
          color: white;
        }
        th, td {
          border: 1px solid #F3C693;
          padding: 8px 10px;
          text-align: center;
        }
        th {
          background-color: #F3C693;
          color: black;
        }
        .prediction-cell.anomaly {
          background-color: #ff6b6b;
          color: white;
          font-weight: 700;
        }
        .prediction-cell.normal {
          background-color: #98fb98;
          color: black;
          font-weight: 700;
        }
        .summary {
          margin-top: 20px;
          font-size: 18px;
          font-weight: 700;
          color: #F3C693;
        }
        footer {
          background-color: rgba(0, 0, 0, 0.85);
          color: white;
          padding: 20px 10px;
          text-align: center;
          font-size: 15px;
          box-shadow: 0 -4px 10px rgba(0,0,0,0.7);
        }
        @media(max-width: 1024px) {
          .container {
            max-width: 95%;
          }
          table {
            font-size: 14px;
          }
        }
        @media(max-width: 480px) {
          .container {
            padding: 20px 15px;
          }
          header {
            font-size: 22px;
            padding: 20px;
          }
          table, #predResults {
            font-size: 12px;
          }
        }
      `}</style>

      <header>Network Intrusion Detection System - CSV Batch Prediction</header>

      <div className="container">
        <h1>Upload CSV File</h1>
        <form onSubmit={handleSubmit}>
          <input type="file" accept=".csv" ref={fileInputRef} required />
          <button type="submit" className="submit-btn">Upload & Predict</button>
        </form>

        {loading && <p style={{ marginTop: 20 }}>Processing... Please wait.</p>}
        {error && <p style={{ marginTop: 20, color: "#ff6b6b" }}>Error: {error}</p>}

        {predictions.length > 0 && (
          <>
            {/* Bar Chart */}
            <div style={{ width: "100%", height: 220, marginTop: 30 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#F3C693" />
                  <YAxis stroke="#F3C693" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#333", borderRadius: "8px" }}
                    labelStyle={{ color: "#F3C693" }}
                    formatter={(value) => [`${value}`, "Count"]}
                  />
                  <Bar dataKey="count" fill="#F3C693" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary */}
            <div className="summary">
              Total Rows: {predictions.length} | Anomalies: {anomalyCount} | {attackJudgment}
            </div>

            {/* Table with input data + prediction */}
            <div id="predResults" style={{ maxHeight: "400px", overflowY: "auto" }}>
              <table>
                <thead>
                  <tr>
                    {/* Show CSV columns dynamically */}
                    {inputData.length > 0 &&
                      Object.keys(inputData[0]).map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    <th>Prediction</th>
                  </tr>
                </thead>
                <tbody>
                  {inputData.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val, i) => (
                        <td key={i}>{val}</td>
                      ))}
                      <td
                        className={`prediction-cell ${
                          predictions[idx] === 1 ? "anomaly" : "normal"
                        }`}
                      >
                        {predictions[idx] === 1 ? "⚠️ Anomaly" : "✅ Normal"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={downloadCSV}
              className="submit-btn"
              style={{ marginTop: 25, maxWidth: 200, alignSelf: "center" }}
            >
              Download Results CSV
            </button>
          </>
        )}
      </div>

      <footer>&copy; 2025 Network Detection | All rights reserved.</footer>
    </>
  );
}

export default Home;
