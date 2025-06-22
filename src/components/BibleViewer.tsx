import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppSettings } from '../types';
import './BibleViewer.css';

interface BibleViewerProps {
  settings: AppSettings;
}

// ESV Bible structure
interface ESVBible {
  [bookName: string]: {
    [chapter: string]: {
      [verse: string]: string;
    };
  };
}

// CUVS Bible structure
interface CUVSBible {
  verses: Array<{
    book_name: string;
    book: number;
    chapter: number;
    verse: number;
    text: string;
  }>;
}

interface Verse {
  verse: number;
  text: string;
}

interface Chapter {
  chapter: number;
  verses: Verse[];
}

const BibleViewer: React.FC<BibleViewerProps> = ({ settings }) => {
  const { bookName, chapter } = useParams<{ bookName?: string; chapter?: string }>();
  const navigate = useNavigate();
  
  const [bibleData, setBibleData] = useState<ESVBible | CUVSBible | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentBook, setCurrentBook] = useState<string>('Genesis');
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [showBookDrawer, setShowBookDrawer] = useState(false);
  const [showChapterDrawer, setShowChapterDrawer] = useState(false);

  const loadBibleData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/data/${settings.translation.toLowerCase()}.json`);
      const data = await response.json();
      setBibleData(data);
    } catch (error) {
      console.error('Error loading Bible data:', error);
    } finally {
      setLoading(false);
    }
  }, [settings.translation]);

  useEffect(() => {
    loadBibleData();
  }, [loadBibleData]);

  useEffect(() => {
    // Set default values if no URL parameters are provided
    if (!bookName || !chapter) {
      const defaultBook = settings.translation === 'ESV' ? 'Genesis' : '创世记';
      setCurrentBook(defaultBook);
      setCurrentChapter(1);
      // Navigate to the default location
      navigate(`/bible/${defaultBook}/1`, { replace: true });
    } else {
      setCurrentBook(bookName);
      setCurrentChapter(parseInt(chapter));
    }
  }, [bookName, chapter, settings.translation, navigate]);

  useEffect(() => {
    // Scroll to top whenever book or chapter changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentBook, currentChapter]);

  const handleBookChange = (book: string) => {
    setCurrentBook(book);
    setCurrentChapter(1);
    setShowBookDrawer(false);
    navigate(`/bible/${book}/1`);
  };

  const handleChapterChange = (chapterNum: number) => {
    setCurrentChapter(chapterNum);
    setShowChapterDrawer(false);
    navigate(`/bible/${currentBook}/${chapterNum}`);
  };

  const handleVerseClick = (verseNum: number) => {
    setSelectedVerse(selectedVerse === verseNum ? null : verseNum);
  };

  const getCurrentChapterData = (): Chapter | null => {
    if (!bibleData) return null;

    if (settings.translation === 'ESV') {
      const esvData = bibleData as ESVBible;
      const bookData = esvData[currentBook];
      if (!bookData) {
        // Fallback to Genesis if book doesn't exist
        const genesisData = esvData['Genesis'];
        if (genesisData) {
          setCurrentBook('Genesis');
          setCurrentChapter(1);
          navigate('/bible/Genesis/1', { replace: true });
          return getCurrentChapterData();
        }
        return null;
      }

      const chapterData = bookData[currentChapter.toString()];
      if (!chapterData) {
        // Fallback to chapter 1 if chapter doesn't exist
        const firstChapter = bookData['1'];
        if (firstChapter) {
          setCurrentChapter(1);
          navigate(`/bible/${currentBook}/1`, { replace: true });
          return getCurrentChapterData();
        }
        return null;
      }

      const verses: Verse[] = Object.entries(chapterData).map(([verseNum, text]) => ({
        verse: parseInt(verseNum),
        text: text
      })).sort((a, b) => a.verse - b.verse);

      return {
        chapter: currentChapter,
        verses: verses
      };
    } else {
      // CUVS format
      const cuvsData = bibleData as CUVSBible;
      const bookVerses = cuvsData.verses.filter(v => 
        v.book_name === currentBook && v.chapter === currentChapter
      );

      if (bookVerses.length === 0) {
        // Fallback to Genesis if book doesn't exist
        const genesisVerses = cuvsData.verses.filter(v => 
          v.book_name === '创世记' && v.chapter === 1
        );
        if (genesisVerses.length > 0) {
          setCurrentBook('创世记');
          setCurrentChapter(1);
          navigate('/bible/创世记/1', { replace: true });
          return getCurrentChapterData();
        }
        return null;
      }

      const verses: Verse[] = bookVerses.map(v => ({
        verse: v.verse,
        text: v.text
      })).sort((a, b) => a.verse - b.verse);

      return {
        chapter: currentChapter,
        verses: verses
      };
    }
  };

  const getBookNames = (): { oldTestament: string[], newTestament: string[] } => {
    if (!bibleData) return { oldTestament: [], newTestament: [] };

    if (settings.translation === 'ESV') {
      // ESV books in biblical order
      const oldTestament = [
        'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
        'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
        '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
        'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
        'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
        'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
        'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
        'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
      ];
      
      const newTestament = [
        'Matthew', 'Mark', 'Luke', 'John', 'Acts',
        'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
        'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians',
        '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus',
        'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
        '1 John', '2 John', '3 John', 'Jude', 'Revelation'
      ];
      
      const esvData = bibleData as ESVBible;
      const availableBooks = Object.keys(esvData);
      
      return {
        oldTestament: oldTestament.filter(book => availableBooks.includes(book)),
        newTestament: newTestament.filter(book => availableBooks.includes(book))
      };
    } else {
      // CUVS books in biblical order (Chinese names)
      const oldTestament = [
        '创世记', '出埃及', '利未记', '民数记', '申命记',
        '约书亚记', '士师记', '路得记', '撒母耳记上', '撒母耳记下',
        '列王纪上', '列王纪下', '历代志上', '历代志下',
        '以斯拉记', '尼希米记', '以斯帖记', '约伯记', '诗篇', '箴言',
        '传道书', '雅歌', '以赛亚书', '耶利米书',
        '耶利米哀歌', '以西结书', '但以理书', '何西阿书', '约珥书',
        '阿摩司书', '俄巴底亚书', '约拿书', '弥迦书', '那鸿书', '哈巴谷书',
        '西番雅书', '哈该书', '撒迦利亚书', '玛拉基书'
      ];
      
      const newTestament = [
        '马太福音', '马可福音', '路加福音', '约翰福音', '使徒行传',
        '罗马书', '歌林多前书', '歌林多后书', '加拉太书',
        '以弗所书', '腓立比书', '歌罗西书', '帖撒罗尼迦前书',
        '帖撒罗尼迦后书', '提摩太前书', '提摩太后书', '提多书',
        '腓利门书', '希伯来书', '雅各书', '彼得前书', '彼得后书',
        '约翰一书', '约翰二书', '约翰三书', '犹大书', '启示录'
      ];
      
      const cuvsData = bibleData as CUVSBible;
      const availableBooks = Array.from(new Set(cuvsData.verses.map(v => v.book_name)));
      
      return {
        oldTestament: oldTestament.filter(book => availableBooks.includes(book)),
        newTestament: newTestament.filter(book => availableBooks.includes(book))
      };
    }
  };

  const getChapterCount = (): number => {
    if (!bibleData) return 0;

    if (settings.translation === 'ESV') {
      const esvData = bibleData as ESVBible;
      const bookData = esvData[currentBook];
      if (!bookData) return 0;
      return Object.keys(bookData).length;
    } else {
      // CUVS format
      const cuvsData = bibleData as CUVSBible;
      const chapters = Array.from(new Set(
        cuvsData.verses
          .filter(v => v.book_name === currentBook)
          .map(v => v.chapter)
      ));
      return Math.max(...chapters);
    }
  };

  if (loading) {
    return (
      <div className="bible-viewer">
        <div className="loading">Loading Bible...</div>
      </div>
    );
  }

  if (!bibleData) {
    return (
      <div className="bible-viewer">
        <div className="error">Error loading Bible data</div>
      </div>
    );
  }

  const currentChapterData = getCurrentChapterData();
  const { oldTestament, newTestament } = getBookNames();
  const chapterCount = getChapterCount();

  return (
    <div className="bible-viewer">
      <div className="bible-header">
        <div className="bible-navigation">
          <div className="navigation-buttons">
            <button 
              className="nav-button book-selector-btn"
              onClick={() => setShowBookDrawer(!showBookDrawer)}
            >
              📖 {currentBook}
            </button>
            
            <button 
              className="nav-button chapter-selector-btn"
              onClick={() => setShowChapterDrawer(!showChapterDrawer)}
            >
              📄 Chapter {currentChapter}
            </button>
          </div>
        </div>
      </div>

      <div className="bible-info">
        <h1>{currentBook} {currentChapter}</h1>
        <p className="translation-info">{settings.translation} Translation</p>
      </div>

      {/* Book Selection Drawer */}
      {showBookDrawer && (
        <div className="drawer-overlay" onClick={() => setShowBookDrawer(false)}>
          <div className="book-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Select Book</h3>
              <button className="close-btn" onClick={() => setShowBookDrawer(false)}>×</button>
            </div>
            
            <div className="testament-section">
              <h4>Old Testament</h4>
              <div className="book-grid">
                {oldTestament.map(book => (
                  <button
                    key={book}
                    className={`book-btn ${currentBook === book ? 'active' : ''}`}
                    onClick={() => handleBookChange(book)}
                  >
                    {book}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="testament-section">
              <h4>New Testament</h4>
              <div className="book-grid">
                {newTestament.map(book => (
                  <button
                    key={book}
                    className={`book-btn ${currentBook === book ? 'active' : ''}`}
                    onClick={() => handleBookChange(book)}
                  >
                    {book}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Selection Drawer */}
      {showChapterDrawer && (
        <div className="drawer-overlay" onClick={() => setShowChapterDrawer(false)}>
          <div className="chapter-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Select Chapter</h3>
              <button className="close-btn" onClick={() => setShowChapterDrawer(false)}>×</button>
            </div>
            
            <div className="chapter-grid">
              {Array.from({ length: chapterCount }, (_, i) => i + 1).map(ch => (
                <button
                  key={ch}
                  className={`chapter-btn ${currentChapter === ch ? 'active' : ''}`}
                  onClick={() => handleChapterChange(ch)}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bible-content">
        {currentChapterData ? (
          <div className="chapter-content">
            {currentChapterData.verses.map(verse => (
              <div 
                key={verse.verse}
                className={`verse ${selectedVerse === verse.verse ? 'selected' : ''}`}
                onClick={() => handleVerseClick(verse.verse)}
                style={{ fontSize: `${settings.fontSize}px` }}
              >
                <span className="verse-number">{verse.verse}</span>
                <span className="verse-text">{verse.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-content">
            <p>Chapter not found</p>
          </div>
        )}
      </div>

      <div className="bible-footer">
        <div className="navigation-buttons">
          {currentChapter > 1 && (
            <button 
              onClick={() => handleChapterChange(currentChapter - 1)}
              className="nav-button prev"
            >
              ← Previous Chapter
            </button>
          )}
          
          {currentChapter < chapterCount && (
            <button 
              onClick={() => handleChapterChange(currentChapter + 1)}
              className="nav-button next"
            >
              Next Chapter →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BibleViewer; 