import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'FastGrocery Store',
  description: '24/7 delivery',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, minHeight: '100vh', backgroundColor: '#f5f5f0' }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
