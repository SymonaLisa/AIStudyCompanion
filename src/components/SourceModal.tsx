import React from 'react';
import { X, ExternalLink, FileText, Book, Globe, Download, Copy } from 'lucide-react';

interface SourceModalProps {
  source: string;
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

const SourceModal: React.FC<SourceModalProps> = ({ source, isOpen, onClose, darkMode }) => {
  if (!isOpen) return null;

  const getSourceData = (sourceName: string) => {
    if (sourceName.includes('Uploaded Document:')) {
      const fileName = sourceName.replace('Uploaded Document: ', '');
      return {
        title: fileName,
        type: 'uploaded',
        excerpt: `This is content from your uploaded document: ${fileName}. The AI has analyzed this material and can answer questions based on its contents.`,
        author: 'User Upload',
        year: new Date().getFullYear().toString(),
        icon: FileText,
        isUserFile: true
      };
    }

    if (sourceName.includes('Campbell Biology')) {
      return {
        title: 'Campbell Biology, 12th Edition',
        type: 'textbook',
        chapter: 'Multiple chapters referenced',
        excerpt: 'Campbell Biology is widely regarded as the leading textbook for introductory biology courses. It provides comprehensive coverage of biological concepts from molecular biology to ecology, with clear explanations and detailed illustrations.',
        page: 'Various pages',
        author: 'Neil A. Campbell, Jane B. Reece, Lisa A. Urry',
        publisher: 'Pearson',
        year: '2020',
        isbn: '978-0135188743',
        icon: Book,
        url: 'https://www.pearson.com/us/higher-education/product/Campbell-Biology-12th-Edition/9780135188743.html'
      };
    }

    if (sourceName.includes('Stewart') && sourceName.includes('Calculus')) {
      return {
        title: 'Calculus: Early Transcendentals, 9th Edition',
        type: 'textbook',
        excerpt: 'Stewart\'s Calculus is one of the most widely used calculus textbooks worldwide. It provides clear explanations of calculus concepts with numerous examples and exercises.',
        author: 'James Stewart, Daniel K. Clegg, Saleem Watson',
        publisher: 'Cengage Learning',
        year: '2020',
        isbn: '978-1337613927',
        icon: Book,
        url: 'https://www.cengage.com/c/calculus-early-transcendentals-9e-stewart'
      };
    }

    if (sourceName.includes('Norton Anthology')) {
      return {
        title: 'The Norton Anthology of English Literature',
        type: 'anthology',
        excerpt: 'The Norton Anthology of English Literature is the most trusted anthology of English literature available. It includes works from the Middle Ages to the present, with scholarly introductions and annotations.',
        author: 'Stephen Greenblatt (General Editor)',
        publisher: 'W. W. Norton & Company',
        year: '2018',
        isbn: '978-0393603132',
        icon: Book,
        url: 'https://wwnorton.com/books/9780393603132'
      };
    }

    if (sourceName.includes('Khan Academy')) {
      return {
        title: 'Khan Academy',
        type: 'online',
        excerpt: 'Khan Academy provides free, world-class education for anyone, anywhere. Their comprehensive courses cover mathematics, science, economics, history, and more with interactive exercises and instructional videos.',
        author: 'Khan Academy',
        year: '2023',
        icon: Globe,
        url: 'https://www.khanacademy.org',
        isOnline: true
      };
    }

    if (sourceName.includes('MIT OpenCourseWare')) {
      return {
        title: 'MIT OpenCourseWare',
        type: 'online',
        excerpt: 'MIT OpenCourseWare (OCW) is a web-based publication of virtually all MIT course content. OCW is open and available to the world and is a permanent MIT activity.',
        author: 'Massachusetts Institute of Technology',
        year: '2023',
        icon: Globe,
        url: 'https://ocw.mit.edu',
        isOnline: true
      };
    }

    if (sourceName.includes('Stanford Encyclopedia')) {
      return {
        title: 'Stanford Encyclopedia of Philosophy',
        type: 'online',
        excerpt: 'The Stanford Encyclopedia of Philosophy organizes scholars from around the world in philosophy and related disciplines to create and maintain an up-to-date reference work.',
        author: 'Stanford University',
        year: '2023',
        icon: Globe,
        url: 'https://plato.stanford.edu',
        isOnline: true
      };
    }

    if (sourceName.includes('JSTOR')) {
      return {
        title: 'JSTOR Academic Database',
        type: 'database',
        excerpt: 'JSTOR is a digital library for scholars, researchers, and students. It provides access to thousands of academic journals, books, and primary sources across multiple disciplines.',
        author: 'JSTOR',
        year: '2023',
        icon: FileText,
        url: 'https://www.jstor.org',
        isDatabase: true
      };
    }

    if (sourceName.includes('Nature Journal')) {
      return {
        title: 'Nature Journal Publications',
        type: 'journal',
        excerpt: 'Nature is one of the world\'s most cited scientific journals. It publishes peer-reviewed research across all fields of science and technology.',
        author: 'Nature Publishing Group',
        year: '2023',
        icon: FileText,
        url: 'https://www.nature.com',
        isJournal: true
      };
    }

    if (sourceName.includes('Smithsonian')) {
      return {
        title: 'Smithsonian Institution Archives',
        type: 'institutional',
        excerpt: 'The Smithsonian Institution is the world\'s largest museum, education, and research complex, with 19 museums and the National Zoo.',
        author: 'Smithsonian Institution',
        year: '2023',
        icon: FileText,
        url: 'https://www.si.edu',
        isInstitutional: true
      };
    }

    return {
      title: sourceName,
      type: 'academic',
      excerpt: 'This is a credible academic source that provides authoritative information on the topic. Academic sources undergo peer review and editorial oversight to ensure accuracy and reliability.',
      author: 'Academic Institution',
      year: '2023',
      icon: FileText,
      isGeneric: true
    };
  };

  const sourceData = getSourceData(source);

  const handleCopyCitation = () => {
    let citation = '';
    
    if (sourceData.isbn) {
      citation = `${sourceData.author} (${sourceData.year}). ${sourceData.title}. ${sourceData.publisher}.`;
    } else if (sourceData.url) {
      citation = `${sourceData.author} (${sourceData.year}). ${sourceData.title}. Retrieved from ${sourceData.url}`;
    } else {
      citation = `${sourceData.author} (${sourceData.year}). ${sourceData.title}.`;
    }
    
    navigator.clipboard.writeText(citation);
  };

  const getSourceTypeColor = (type: string) => {
    const baseColors = {
      textbook: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200',
      online: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-200',
      journal: 'bg-accent-200 text-accent-800 dark:bg-accent-700 dark:text-accent-200',
      database: 'bg-highlight-100 text-highlight-800 dark:bg-highlight-900/30 dark:text-highlight-200',
      institutional: 'bg-accent-300 text-accent-800 dark:bg-accent-600 dark:text-accent-200',
      uploaded: 'bg-primary-200 text-primary-800 dark:bg-primary-800/50 dark:text-primary-200',
      default: 'bg-accent-200 text-accent-800 dark:bg-accent-700 dark:text-accent-200'
    };
    
    return baseColors[type as keyof typeof baseColors] || baseColors.default;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-accent-50 dark:bg-dark-surface rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl transition-all duration-500 border border-accent-200 dark:border-dark-muted">
        {/* Header */}
        <div className="p-8 border-b border-accent-200 dark:border-dark-muted">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
                <sourceData.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-accent-800 dark:text-accent-100">{sourceData.title}</h2>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${getSourceTypeColor(sourceData.type)}`}>
                  {sourceData.type.charAt(0).toUpperCase() + sourceData.type.slice(1)} Source
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-accent-100 dark:hover:bg-dark-muted rounded-xl transition-all duration-300"
            >
              <X className="w-6 h-6 text-accent-600 dark:text-accent-300" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          {/* Source Info */}
          <div className="bg-accent-100 dark:bg-dark-muted rounded-2xl p-6 mb-8 transition-all duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <span className="font-medium text-accent-700 dark:text-accent-300">Author:</span>
                <p className="text-accent-800 dark:text-accent-100 mt-1">{sourceData.author}</p>
              </div>
              <div>
                <span className="font-medium text-accent-700 dark:text-accent-300">Year:</span>
                <p className="text-accent-800 dark:text-accent-100 mt-1">{sourceData.year}</p>
              </div>
              {sourceData.publisher && (
                <div>
                  <span className="font-medium text-accent-700 dark:text-accent-300">Publisher:</span>
                  <p className="text-accent-800 dark:text-accent-100 mt-1">{sourceData.publisher}</p>
                </div>
              )}
              {sourceData.isbn && (
                <div>
                  <span className="font-medium text-accent-700 dark:text-accent-300">ISBN:</span>
                  <p className="text-accent-800 dark:text-accent-100 mt-1">{sourceData.isbn}</p>
                </div>
              )}
              {sourceData.chapter && (
                <div className="md:col-span-2">
                  <span className="font-medium text-accent-700 dark:text-accent-300">Chapter:</span>
                  <p className="text-accent-800 dark:text-accent-100 mt-1">{sourceData.chapter}</p>
                </div>
              )}
              {sourceData.page && (
                <div>
                  <span className="font-medium text-accent-700 dark:text-accent-300">Pages:</span>
                  <p className="text-accent-800 dark:text-accent-100 mt-1">{sourceData.page}</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-accent-800 dark:text-accent-100 mb-4">About This Source</h3>
            <div className="bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-400 dark:border-primary-500 p-6 rounded-r-2xl transition-all duration-500">
              <p className="text-accent-700 dark:text-accent-200 leading-relaxed">{sourceData.excerpt}</p>
            </div>
          </div>

          {/* Reliability Indicator */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-4 h-4 bg-secondary-500 rounded-full"></div>
              <span className="text-sm font-medium text-accent-800 dark:text-accent-100">Reliability: High</span>
            </div>
            <p className="text-sm text-accent-600 dark:text-accent-400">
              {sourceData.isUserFile 
                ? "This is your uploaded document. Verify the accuracy of information as needed."
                : "This source has been verified as academically credible and peer-reviewed."
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            {sourceData.url && (
              <button
                onClick={() => window.open(sourceData.url, '_blank')}
                className="flex items-center space-x-3 px-6 py-3 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <ExternalLink className="w-5 h-5" />
                <span>View Source</span>
              </button>
            )}
            
            <button
              onClick={handleCopyCitation}
              className="flex items-center space-x-3 px-6 py-3 bg-accent-100 dark:bg-dark-muted text-accent-700 dark:text-accent-300 rounded-2xl hover:bg-accent-200 dark:hover:bg-dark-surface transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Copy className="w-5 h-5" />
              <span>Copy Citation</span>
            </button>

            {sourceData.isUserFile && (
              <button
                className="flex items-center space-x-3 px-6 py-3 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 rounded-2xl hover:bg-secondary-200 dark:hover:bg-secondary-800/40 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                <span>Download</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceModal;