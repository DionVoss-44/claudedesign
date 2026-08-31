import './globals.css';

export const metadata = {
  title: 'Cluster AI — Your business has the answer. Just ask Cluster.',
  description:
    'Cluster is your intelligent, real-time source of truth. We connect your systems behind the scenes and pull together exactly the knowledge you need — just ask.',
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M15 3.5 L24.5 20 L5.5 20 Z' fill='none' stroke='%238052ff' stroke-width='2'/%3E%3Cpath d='M23 23 L27.5 29.5 L18.5 29.5 Z' fill='none' stroke='%238052ff' stroke-width='1.6'/%3E%3Cpath d='M9.5 23.5 L12.5 28 L6.5 28 Z' fill='%238052ff'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
