import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

import Header from './Header';
import Footer from './Footer';
import CookieBanner from './CookieBanner';
import ScrollToTop from './ScrollToTop';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  const router = useRouter();

  return (
    <div className={`min-h-screen flex flex-col bg-white dark:bg-gray-900 ${className}`}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={router.asPath}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
              type: 'tween',
              ease: 'anticipate',
              duration: 0.4,
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />

      {/* Additional Components */}
      <ScrollToTop />
      <CookieBanner />
    </div>
  );
};

export default Layout;