import React, { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="error-boundary"
          style={{
            textAlign: "center",
            padding: "50px",
            color: "white",
            background: "#1a1a1a",
          }}
        >
          <h1>Something went wrong.</h1>
          <p>{this.state.error?.message || "An unexpected error occurred."}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              background: "#7e22ce",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
