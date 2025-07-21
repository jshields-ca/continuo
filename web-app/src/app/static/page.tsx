export default function StaticPage() {
  return (
    <html>
      <head>
        <title>Static Test Page</title>
      </head>
      <body style={{ 
        fontFamily: 'Arial, sans-serif', 
        padding: '20px',
        backgroundColor: '#f0f0f0'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#333', marginBottom: '20px' }}>
            🎉 Static Test Page Working!
          </h1>
          
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            This is a completely static page with no dependencies. 
            If you can see this, Next.js is working correctly.
          </p>
          
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            padding: '15px', 
            borderRadius: '5px',
            marginTop: '20px'
          }}>
            <h3 style={{ color: '#2d5a2d', margin: '0 0 10px 0' }}>
              ✅ Success Indicators:
            </h3>
            <ul style={{ color: '#2d5a2d', margin: 0 }}>
              <li>Server is running on port 8080</li>
              <li>Next.js is processing requests</li>
              <li>Static pages are working</li>
              <li>No auth context dependencies</li>
            </ul>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <a href="/" style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              textDecoration: 'none',
              borderRadius: '5px',
              display: 'inline-block'
            }}>
              Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
} 