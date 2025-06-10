import { NextPage, GetStaticProps } from 'next';
import { NextSeo } from 'next-seo';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Layout from '@/components/Layout';
import HeroSection from '@/components/sections/HeroSection';
import StatsSection from '@/components/sections/StatsSection';
import InvestmentOpportunities from '@/components/sections/InvestmentOpportunities';
import CompanyOverview from '@/components/sections/CompanyOverview';
import FinancialHighlights from '@/components/sections/FinancialHighlights';
import ESGImpact from '@/components/sections/ESGImpact';
import NewsSection from '@/components/sections/NewsSection';
import ContactCTA from '@/components/sections/ContactCTA';
import { getCompanyStats, getLatestNews, getFinancialData } from '@/lib/api';
import { CompanyStats, NewsItem, FinancialData } from '@/types';

interface HomePageProps {
  stats: CompanyStats;
  news: NewsItem[];
  financialData: FinancialData;
}

const HomePage: NextPage<HomePageProps> = ({ stats, news, financialData }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
  };

  return (
    <>
      <NextSeo
        title="iWORKZ - Revolutionizing Global Talent Acquisition | Investor Relations"
        description="Join the future of work with iWORKZ. AI-powered talent acquisition platform connecting global talent with opportunities. Discover our investment opportunities and company performance."
        canonical="https://investors.iworkz.com"
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: 'https://investors.iworkz.com',
          title: 'iWORKZ - Revolutionizing Global Talent Acquisition',
          description: 'AI-powered talent acquisition platform. Join our mission to transform how the world works.',
          images: [
            {
              url: 'https://investors.iworkz.com/images/og-image.jpg',
              width: 1200,
              height: 630,
              alt: 'iWORKZ Investor Relations',
            },
          ],
          siteName: 'iWORKZ Investors',
        }}
        twitter={{
          handle: '@iworkzplatform',
          site: '@iworkzplatform',
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1.0',
          },
          {
            name: 'theme-color',
            content: '#2563EB',
          },
          {
            name: 'author',
            content: 'iWORKZ Platform',
          },
          {
            name: 'keywords',
            content: 'talent acquisition, AI recruitment, job matching, global workforce, investment opportunity, SaaS, HR technology',
          },
        ]}
        additionalLinkTags={[
          {
            rel: 'icon',
            href: '/favicon.ico',
          },
          {
            rel: 'apple-touch-icon',
            href: '/apple-touch-icon.png',
            sizes: '180x180',
          },
          {
            rel: 'manifest',
            href: '/site.webmanifest',
          },
        ]}
      />

      <Layout>
        <motion.div
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {/* Hero Section */}
          <HeroSection />

          {/* Company Stats */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <StatsSection stats={stats} />
          </motion.div>

          {/* Investment Opportunities */}
          <div data-aos="fade-up" data-aos-delay="100">
            <InvestmentOpportunities />
          </div>

          {/* Company Overview */}
          <div data-aos="fade-up" data-aos-delay="200">
            <CompanyOverview />
          </div>

          {/* Financial Highlights */}
          <div data-aos="fade-up" data-aos-delay="300">
            <FinancialHighlights financialData={financialData} />
          </div>

          {/* ESG Impact */}
          <div data-aos="fade-up" data-aos-delay="400">
            <ESGImpact />
          </div>

          {/* Latest News */}
          <div data-aos="fade-up" data-aos-delay="500">
            <NewsSection news={news} />
          </div>

          {/* Contact CTA */}
          <div data-aos="fade-up" data-aos-delay="600">
            <ContactCTA />
          </div>
        </motion.div>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Fetch data from APIs or CMS
    const [stats, news, financialData] = await Promise.all([
      getCompanyStats(),
      getLatestNews(3), // Get latest 3 news items
      getFinancialData(),
    ]);

    return {
      props: {
        stats,
        news,
        financialData,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching page data:', error);
    
    // Return default/fallback data
    return {
      props: {
        stats: {
          totalUsers: 150000,
          activeJobs: 25000,
          companiesServed: 2500,
          successfulMatches: 85000,
          platformUptime: 99.9,
          averageMatchTime: 24,
        },
        news: [],
        financialData: {
          revenue: 12500000,
          growth: 285,
          funding: 50000000,
          valuation: 250000000,
          quarters: [],
        },
      },
      revalidate: 3600,
    };
  }
};

export default HomePage;