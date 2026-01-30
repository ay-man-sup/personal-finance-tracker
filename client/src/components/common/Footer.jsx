import React from 'react';
import { FiInstagram, FiGithub, FiLinkedin, FiGlobe, FiHeart, FiCoffee } from 'react-icons/fi';

const socialLinks = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/ay_man_._._?igsh=MWNsYXp0anRjZDFmZQ%3D%3D&utm_source=qr',
    icon: FiInstagram,
    color: 'hover:text-pink-500',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/ay-man-sup',
    icon: FiGithub,
    color: 'hover:text-gray-900 dark:hover:text-white',
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/ayman-afroz-jalil',
    icon: FiLinkedin,
    color: 'hover:text-blue-600',
  },
  {
    name: 'Website',
    url: 'https://ayman-jalil.netlify.app/',
    icon: FiGlobe,
    color: 'hover:text-accent-500',
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-accent-500/20 bg-white/80 dark:bg-space-900/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-accent-600 dark:text-accent-400 font-display">
              JALIL TECH
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-md flex items-center gap-2 justify-center md:justify-start flex-wrap">
              <span>Made with</span>
              <FiHeart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>by Ayman</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-xl bg-gray-100 dark:bg-space-700/50 text-gray-600 dark:text-gray-400 
                    border border-gray-200 dark:border-accent-500/20 
                    hover:border-accent-500/50 hover:scale-110 
                    transition-all duration-300 ${link.color}`}
                  aria-label={link.name}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-accent-500/10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500 italic flex items-center justify-center gap-2 flex-wrap">
            <FiCoffee className="w-4 h-4" />
            <span>"I love helping people save money while spending all of mine :)"</span>
          </p>
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-600">
            © {currentYear} Jalil Tech. Built with React & Node.js
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
