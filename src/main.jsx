import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', background: '#fff1f2', color: '#9f1239', fontFamily: 'monospace', minHeight: '100vh' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>Application Render Error</h1>
          <p style={{ marginTop: '10px', fontSize: '15px' }}>{this.state.error && this.state.error.toString()}</p>
          <pre style={{ marginTop: '15px', background: '#ffe4e6', padding: '15px', borderRadius: '6px', fontSize: '12px', overflow: 'auto' }}>
            {this.state.error && this.state.error.stack}
            {'\n'}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button
            onClick={() => { window.location.reload(); }}
            style={{ marginTop: '20px', padding: '8px 16px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
