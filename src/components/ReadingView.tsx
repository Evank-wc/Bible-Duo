import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { AppSettings } from '../types';
import './ReadingView.css';

interface ReadingViewProps {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
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

interface ReadingPlan {
  id: string;
  name: string;
  info: string;
  data: string[];
  data2: string[][];
}

interface PassageInfo {
  book: string;
  startChapter: number;
  startVerse: number;
  endChapter: number;
  endVerse: number;
}

// Parse passage reference like "Genesis 1:1-2:25" or "Genesis 1:1-6"
const parsePassageReference = (reference: string): PassageInfo | null => {
  // Handle cross-chapter passages like "Genesis 1:1-2:25"
  const crossChapterMatch = reference.match(/^(.+?)\s+(\d+):(\d+)-(\d+):(\d+)$/);
  if (crossChapterMatch) {
    const [, book, startChapter, startVerse, endChapter, endVerse] = crossChapterMatch;
    return {
      book,
      startChapter: parseInt(startChapter),
      startVerse: parseInt(startVerse),
      endChapter: parseInt(endChapter),
      endVerse: parseInt(endVerse)
    };
  }
  
  // Handle single chapter passages like "Genesis 1:1-6"
  const singleChapterMatch = reference.match(/^(.+?)\s+(\d+):(\d+)-(\d+)$/);
  if (singleChapterMatch) {
    const [, book, chapter, startVerse, endVerse] = singleChapterMatch;
    const chapterNum = parseInt(chapter);
    return {
      book,
      startChapter: chapterNum,
      startVerse: parseInt(startVerse),
      endChapter: chapterNum,
      endVerse: parseInt(endVerse)
    };
  }
  
  // Handle single verse like "Genesis 1:1"
  const singleVerseMatch = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (singleVerseMatch) {
    const [, book, chapter, verse] = singleVerseMatch;
    const chapterNum = parseInt(chapter);
    const verseNum = parseInt(verse);
    return {
      book,
      startChapter: chapterNum,
      startVerse: verseNum,
      endChapter: chapterNum,
      endVerse: verseNum
    };
  }
  
  return null;
};

const ReadingView: React.FC<ReadingViewProps> = ({ settings, updateSettings }) => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<ReadingPlan | null>(null);
  const [bible, setBible] = useState<ESVBible | CUVSBible | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);

  const currentDay = settings.currentDay || 1;
  const completedDays = settings.completedDays || new Set<number>();
  const isCompleted = completedDays.has(currentDay);

  // UI text based on language
  const uiText = {
    en: {
      loading: "Loading today's reading...",
      error: 'Unable to load reading data',
      dayOf: 'Day',
      of: 'of',
      home: 'Home',
      markComplete: 'Mark as Complete',
      completed: 'Completed',
      passageNotAvailable: 'Passage not available in current translation',
      previousDay: 'Previous Day',
      nextDay: 'Next Day'
    },
    zh: {
      loading: '正在加载今日阅读...',
      error: '无法加载阅读数据',
      dayOf: '第',
      of: '天，共',
      home: '首页',
      markComplete: '标记为完成',
      completed: '已完成',
      passageNotAvailable: '当前翻译版本中无此段落',
      previousDay: '前一天',
      nextDay: '下一天'
    }
  };

  const currentText = uiText[settings.uiLanguage || 'en'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch reading plan
        const planResponse = await fetch('/data/esveverydayinword_plan.json');
        const planData = await planResponse.json();
        setPlan(planData);
        
        // Fetch Bible text
        const bibleResponse = await fetch(`/data/${settings.translation.toLowerCase()}.json`);
        const bibleData = await bibleResponse.json();
        setBible(bibleData);
        
      } catch (error) {
        console.error('Error loading reading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [settings.translation]);

  const handleComplete = () => {
    const newCompletedDays = new Set(completedDays);
    newCompletedDays.add(currentDay);
    
    // Store the completion date
    const newCompletionDates = new Map(settings.completionDates || new Map());
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    newCompletionDates.set(currentDay, today);
    
    console.log('Debug - Marking day', currentDay, 'as complete on', today);
    console.log('Debug - New completion dates map:', newCompletionDates);
    
    updateSettings({ 
      completedDays: newCompletedDays,
      completionDates: newCompletionDates
    });
  };

  const navigateToDay = (targetDay: number) => {
    updateSettings({ currentDay: targetDay });
    // Auto-scroll to top when navigating to a new day
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVerseClick = (verseNumber: number) => {
    setHighlightedVerse(highlightedVerse === verseNumber ? null : verseNumber);
  };

  const handleScrollProgress = () => {
    const element = document.documentElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    setReadingProgress(Math.min(progress, 100));
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScrollProgress);
    return () => window.removeEventListener('scroll', handleScrollProgress);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [settings.currentDay]);

  const getVersesForPassage = (reference: string): Verse[] => {
    if (!bible || !plan) return [];

    const passageInfo = parsePassageReference(reference);
    if (!passageInfo) {
      console.error('Could not parse reference:', reference);
      return [];
    }

    // Map book names from reading plan to actual Bible data
    const mapBookName = (bookName: string): string => {
      if (settings.translation === 'ESV') {
        return bookName;
      } else {
        // CUVS uses Chinese names, map from English to Chinese
        const bookMapping: { [key: string]: string } = {
          'Genesis': '创世记',
          'Exodus': '出埃及',
          'Leviticus': '利未记',
          'Numbers': '民数记',
          'Deuteronomy': '申命记',
          'Joshua': '约书亚记',
          'Judges': '士师记',
          'Ruth': '路得记',
          '1Samuel': '撒母耳记上',
          '2Samuel': '撒母耳记下',
          '1Kings': '列王纪上',
          '2Kings': '列王纪下',
          '1Chronicles': '历代志上',
          '2Chronicles': '历代志下',
          'Ezra': '以斯拉记',
          'Nehemiah': '尼希米记',
          'Esther': '以斯帖记',
          'Job': '约伯记',
          'Psalm': '诗篇',
          'Proverbs': '箴言',
          'Ecclesiastes': '传道书',
          'SongOfSongs': '雅歌',
          'Isaiah': '以赛亚书',
          'Jeremiah': '耶利米书',
          'Lamentations': '耶利米哀歌',
          'Ezekiel': '以西结书',
          'Daniel': '但以理书',
          'Hosea': '何西阿书',
          'Joel': '约珥书',
          'Amos': '阿摩司书',
          'Obadiah': '俄巴底亚书',
          'Jonah': '约拿书',
          'Micah': '弥迦书',
          'Nahum': '那鸿书',
          'Habakkuk': '哈巴谷书',
          'Zephaniah': '西番雅书',
          'Haggai': '哈该书',
          'Zechariah': '撒迦利亚书',
          'Malachi': '玛拉基书',
          'Matthew': '马太福音',
          'Mark': '马可福音',
          'Luke': '路加福音',
          'John': '约翰福音',
          'Acts': '使徒行传',
          'Romans': '罗马书',
          '1Corinthians': '歌林多前书',
          '2Corinthians': '歌林多后书',
          'Galatians': '加拉太书',
          'Ephesians': '以弗所书',
          'Philippians': '腓立比书',
          'Colossians': '歌罗西书',
          '1Thessalonians': '帖撒罗尼迦前书',
          '2Thessalonians': '帖撒罗尼迦后书',
          '1Timothy': '提摩太前书',
          '2Timothy': '提摩太后书',
          'Titus': '提多书',
          'Philemon': '腓利门书',
          'Hebrews': '希伯来书',
          'James': '雅各书',
          '1Peter': '彼得前书',
          '2Peter': '彼得后书',
          '1John': '约翰一书',
          '2John': '约翰二书',
          '3John': '约翰三书',
          'Jude': '犹大书',
          'Revelation': '启示录'
        };
        return bookMapping[bookName] || bookName;
      }
    };

    const mappedBookName = mapBookName(passageInfo.book);

    if (settings.translation === 'ESV') {
      const esvData = bible as ESVBible;
      const bookData = esvData[mappedBookName];
      if (!bookData) {
        console.error('ESV: Book not found:', mappedBookName);
        return [];
      }

      const verses: Verse[] = [];
      
      // Handle cross-chapter passages
      for (let chapter = passageInfo.startChapter; chapter <= passageInfo.endChapter; chapter++) {
        const chapterData = bookData[chapter.toString()];
        if (!chapterData) {
          console.error(`ESV: Chapter ${chapter} not found in ${mappedBookName}`);
          continue;
        }

        const startVerse = chapter === passageInfo.startChapter ? passageInfo.startVerse : 1;
        const endVerse = chapter === passageInfo.endChapter ? passageInfo.endVerse : 999;

        for (let verse = startVerse; verse <= endVerse; verse++) {
          const verseText = chapterData[verse.toString()];
          if (verseText) {
            verses.push({
              verse,
              text: verseText
            });
          }
        }
      }

      return verses;
    } else {
      // CUVS format
      const cuvsData = bible as CUVSBible;
      
      // Debug: Log what we're looking for
      console.log('CUVS Debug:', {
        lookingFor: mappedBookName,
        passageInfo,
        availableBooks: Array.from(new Set(cuvsData.verses.map(v => v.book_name))).slice(0, 10)
      });
      
      // Check if the book exists in the data
      const availableBooks = Array.from(new Set(cuvsData.verses.map(v => v.book_name)));
      const bookExists = availableBooks.includes(mappedBookName);
      console.log('Book exists:', bookExists, 'Looking for:', mappedBookName);
      
      if (!bookExists) {
        console.log('Available books:', availableBooks);
        return [];
      }
      
      // Get all verses for this book first
      const bookVerses = cuvsData.verses.filter(v => v.book_name === mappedBookName);
      console.log(`Found ${bookVerses.length} total verses for ${mappedBookName}`);
      
      const verses: Verse[] = [];
      
      // Handle cross-chapter passages properly
      for (let chapter = passageInfo.startChapter; chapter <= passageInfo.endChapter; chapter++) {
        const chapterVerses = bookVerses.filter(v => v.chapter === chapter);
        console.log(`Chapter ${chapter} has ${chapterVerses.length} verses`);
        
        if (chapterVerses.length === 0) continue;
        
        // Determine verse range for this chapter
        const startVerse = chapter === passageInfo.startChapter ? passageInfo.startVerse : 1;
        const endVerse = chapter === passageInfo.endChapter ? passageInfo.endVerse : Math.max(...chapterVerses.map(v => v.verse));
        
        console.log(`Chapter ${chapter}: looking for verses ${startVerse} to ${endVerse}`);
        
        // Filter verses within the range for this chapter
        const chapterRangeVerses = chapterVerses
          .filter(v => v.verse >= startVerse && v.verse <= endVerse)
          .map(v => ({
            verse: v.verse,
            text: v.text
          }))
          .sort((a, b) => a.verse - b.verse);
        
        console.log(`Chapter ${chapter}: found ${chapterRangeVerses.length} verses in range`);
        verses.push(...chapterRangeVerses);
      }

      console.log('CUVS total verses found:', verses.length, 'for', mappedBookName);
      return verses;
    }
  };

  if (loading) {
    return (
      <div className="reading-view">
        <div className="reading-content">
          <div className="loading">{currentText.loading}</div>
        </div>
      </div>
    );
  }

  if (!plan || !bible) {
    return (
      <div className="reading-view">
        <div className="reading-content">
          <div className="error">{currentText.error}</div>
        </div>
      </div>
    );
  }

  const dailyReadings = plan.data2[currentDay - 1] || [];
  const totalDays = plan.data2.length;

  return (
    <div className="reading-view">
      <div className="reading-content">
        <div className="reading-header">
          <div className="reading-info">
            <h2>{plan.name}</h2>
            <p className="day-info">{currentText.dayOf} {currentDay} {currentText.of} {totalDays}</p>
            <p className="date-info">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          
          <div className="reading-actions">
            <button 
              onClick={() => navigate('/')}
              className="nav-button"
            >
              ← {currentText.home}
            </button>
          </div>
        </div>

        <div className="passages-container">
          {dailyReadings.map((reference, index) => {
            const verses = getVersesForPassage(reference);
            
            if (verses.length === 0) {
              return (
                <div key={index} className="passage-error">
                  <h3>{reference}</h3>
                  <p>{currentText.passageNotAvailable}</p>
                </div>
              );
            }

            return (
              <div key={index} className="passage">
                <h3 className="passage-reference">
                  {reference}
                </h3>
                <div className="bible-text">
                  {verses.map((verse) => (
                    <div 
                      key={verse.verse} 
                      className={`verse ${highlightedVerse === verse.verse ? 'highlighted' : ''}`}
                      onClick={() => handleVerseClick(verse.verse)}
                      style={{ fontSize: `${settings.fontSize}px` }}
                    >
                      <span className="verse-number">{verse.verse}</span>
                      <span className="verse-text">{verse.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="reading-navigation">
          {currentDay > 1 && (
            <button 
              onClick={() => navigateToDay(currentDay - 1)}
              className="nav-button"
            >
              ← {currentText.previousDay}
            </button>
          )}
          
          {currentDay < totalDays && (
            <button 
              onClick={() => navigateToDay(currentDay + 1)}
              className="nav-button"
            >
              {currentText.nextDay} →
            </button>
          )}
        </div>

        {/* Mark as Complete Button */}
        <div className="completion-section">
          {!isCompleted ? (
            <button 
              onClick={handleComplete}
              className="complete-button"
            >
              {currentText.markComplete}
            </button>
          ) : (
            <div className="completed-badge">✅ {currentText.completed}</div>
          )}
        </div>

        <div className="reading-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${readingProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingView; 