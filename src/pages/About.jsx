import { motion } from 'motion/react';
import { BookOpen, Sparkles, Heart, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import './About.css';

export function About() {
  const objectives = [
    {
      title: "Pristine Presentation",
      description: "Presenting Islam in its original purity to help clear misconceptions and share the universal message of peace.",
      icon: Sparkles
    },
    {
      title: "Reliable Publications",
      description: "Translating and publishing the Holy Qur'an, Hadith selections, and core Islamic text in Tamil, English, Arabic, and Urdu.",
      icon: BookOpen
    },
    {
      title: "Communal Harmony",
      description: "Building strong bridges of understanding and cooperation among diverse communities through healthy dialogue.",
      icon: Heart
    }
  ];

  const statistics = [
    { label: "Years of Service", value: "50+", desc: "Est. 1973" },
    { label: "Book Publications", value: "552", desc: "Unique Titles" },
    { label: "Readers Enriched", value: "10M+", desc: "Worldwide" },
    { label: "Scholarly Reviewers", value: "100+", desc: "Theologians" }
  ];

  return (
    <div className="about-page">
      <div className="about-hero-bg" />

      {/* Hero Section */}
      <section className="about-hero">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="about-hero-content"
        >
          <Badge className="about-badge">
            Est. 1973 in Chennai
          </Badge>
          <h1 className="about-title">
            About <span>IFT Chennai</span>
          </h1>
          <p className="about-subtitle">
            Islamic Foundation Trust (IFT) Chennai is a premier Islamic publication house committed to producing high-quality, authentic translation and literature to foster understanding, ethics, and values.
          </p>
        </motion.div>
      </section>

      {/* Trust & Profile Section with Logo */}
      <section className="about-profile">
        <div className="about-profile-card">
          <div className="about-logo-wrapper">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              transition={{ duration: 0.3 }}
              className="about-logo-container"
            >
              <img 
                src="/assets/logo.png" 
                alt="IFT Chennai Logo" 
                className="about-logo-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fb = document.getElementById('logo-fallback');
                  if (fb) fb.classList.remove('hidden');
                }}
              />
              <div id="logo-fallback" className="about-logo-fallback hidden">
                <BookOpen className="w-16 h-16 text-primary" />
                <span className="text-xs font-bold text-primary mt-1">IFT CHENNAI</span>
              </div>
            </motion.div>
            <h3>Islamic Foundation Trust</h3>
            <p>Chennai, India</p>
          </div>

          <div className="about-profile-content">
            <h2>Our Mission & Foundation</h2>
            <p className="about-profile-text">
              Founded in <strong>1973</strong>, Islamic Foundation Trust (IFT) Chennai is a non-profit publishing organisation and charitable trust. For over five decades, IFT has stood at the forefront of providing clear, accurate, and faithful translations of Islamic texts, particularly the holy Quran and Hadith compilations into contemporary <strong>Tamil</strong> and <strong>English</strong>.
            </p>
            <p className="about-profile-text">
              Through painstaking efforts of qualified panels of theologians, Arabic lexicographers, and subject matter experts, IFT has published hundreds of volumes that have enlightened millions of readers, shaping morals, enriching minds, and nurturing hearts.
            </p>

            <div className="about-check-grid">
              <div className="about-check-item">
                <CheckCircle className="about-check-icon" />
                <span className="about-check-text">Scholarly Peer-Review</span>
              </div>
              <div className="about-check-item">
                <CheckCircle className="about-check-icon" />
                <span className="about-check-text">Modern Layouts & Prints</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Objectives */}
      <section className="about-objectives">
        <div className="about-objectives-header">
          <h2>Core Objectives</h2>
          <p>We operate guided by timeless principles to enrich communities.</p>
        </div>

        <div className="about-objectives-grid">
          {objectives.map((obj, i) => {
            const Icon = obj.icon;
            return (
              <motion.div
                key={obj.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <Card className="about-objective-card">
                  <CardContent className="p-6 space-y-4">
                    <div className="about-objective-icon-wrapper">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="about-objective-title">{obj.title}</h3>
                    <p className="about-objective-desc">{obj.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="about-stats">
        <div className="about-stats-container">
          <div className="about-stats-grid">
            {statistics.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="about-stat-item"
              >
                <p className="about-stat-value">{stat.value}</p>
                <div>
                  <p className="about-stat-label">{stat.label}</p>
                  <p className="about-stat-desc">{stat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
export default About;
