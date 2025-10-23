import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";

// Use local backend API URL to avoid CORS issues when called from browser
const BACKEND_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8213/api/v1';

export default function ActionHandler() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Processing your request...");
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    const action = searchParams.get("action");
    const ticketNumber = searchParams.get("ticket_number");
    const customerEmail = searchParams.get("email");

    console.log('🔍 ActionHandler - Received params:', { action, ticketNumber, customerEmail });

    if (!action || !ticketNumber) {
      setStatus("error");
      setMessage("Invalid request: missing action or ticket number");
      return;
    }

    // Prevent duplicate API calls
    if (hasCalledAPI.current) {
      return;
    }
    hasCalledAPI.current = true;

    const requestUrl = `${BACKEND_API_URL}/shopify/webhook`;
    const requestBody = {
      action,
      ticket_number: ticketNumber,
      email: customerEmail || undefined // Make email optional
    };

    console.log('📤 ActionHandler - Sending request:', {
      url: requestUrl,
      method: 'PUT',
      body: requestBody
    });

    // Call your backend API
    fetch(requestUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(requestBody)
    })
      .then(async res => {
        console.log('📡 ActionHandler - Response status:', res.status);

        if (!res.ok) {
          // Try to get error message from response
          let errorMessage = `Server responded with status: ${res.status}`;
          try {
            const errorData = await res.json();
            console.error('❌ ActionHandler - Error response:', errorData);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            // If response is not JSON, try to get text
            try {
              const errorText = await res.text();
              console.error('❌ ActionHandler - Error text:', errorText);
              if (errorText) errorMessage = errorText;
            } catch (e2) {
              console.error('❌ ActionHandler - Could not parse error response');
            }
          }
          throw new Error(errorMessage);
        }
        return res.json();
      })
      .then(data => {
        console.log('✅ ActionHandler - Success response:', data);
        setStatus("success");
        setMessage(getSuccessMessage(action));
      })
      .catch(err => {
        console.error('❌ ActionHandler - Error:', err);
        setStatus("error");
        setMessage(`Error processing your request: ${err.message}`);
      });
  }, [searchParams]);

  const getSuccessMessage = (action: string) => {
    switch (action) {
      case "receive_share":
        return "✅ Thank you! We've received your request to receive your share.";
      case "recycle":
        return "✅ Thank you! We'll proceed with recycling your jewelry.";
      case "return_jewelry":
        return "✅ Thank you! We've received your request to return your jewelry.";
      default:
        return "✅ Your request has been processed successfully.";
    }
  };

  return (
    <div style={{
      padding: "3rem",
      textAlign: "center",
      maxWidth: "600px",
      margin: "0 auto",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        background: status === "loading" ? "#f0f0f0" : status === "success" ? "#e8f5e9" : "#ffebee",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{
          color: status === "loading" ? "#666" : status === "success" ? "#2e7d32" : "#c62828",
          marginBottom: "1rem"
        }}>
          {status === "loading" ? "Processing Your Request..." : status === "success" ? "Request Received" : "Error"}
        </h2>
        <p style={{
          fontSize: "1.1rem",
          color: "#333",
          lineHeight: "1.6"
        }}>
          {message}
        </p>
        {status !== "loading" && (
          <div style={{ marginTop: "2rem" }}>
            <button
              onClick={() => window.close()}
              style={{
                backgroundColor: "#5B8FCF",
                color: "white",
                padding: "12px 24px",
                borderRadius: "5px",
                border: "none",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              Close this tab
            </button>
          </div>
        )}
      </div>
    </div>
  );
}