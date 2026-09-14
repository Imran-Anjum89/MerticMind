import './globals.css';

export const metadata = {
  title: 'MetricMind | Agentic Semantic BI Engine',
  description: 'Governed AI BI engine translating natural language questions into Cube.dev Semantic Layer API calls over Snowflake dbt models.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
