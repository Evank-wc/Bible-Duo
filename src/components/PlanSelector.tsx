import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSettings } from '../types';
import './PlanSelector.css';

interface PlanSelectorProps {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

interface ReadingPlan {
  id: string;
  name: string;
  info: string;
  data: string[];
  data2: string[][];
}

const PlanSelector: React.FC<PlanSelectorProps> = ({ settings, updateSettings }) => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<ReadingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // UI text based on language
  const uiText = {
    en: {
      title: 'Choose Your Reading Plan',
      subtitle: 'Select a plan to start your daily Bible reading journey',
      loading: 'Loading reading plans...',
      duration: 'Duration:',
      totalReadings: 'Total Readings:',
      days: 'days',
      startPlan: 'Start This Plan'
    },
    zh: {
      title: '选择您的阅读计划',
      subtitle: '选择一个计划开始您的每日圣经阅读之旅',
      loading: '正在加载阅读计划...',
      duration: '持续时间:',
      totalReadings: '总阅读数:',
      days: '天',
      startPlan: '开始此计划'
    }
  };

  const currentText = uiText[settings.uiLanguage || 'en'];

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const response = await fetch('/data/esveverydayinword_plan.json');
      const planData = await response.json();
      
      // Convert the single plan data to our expected format
      const plan: ReadingPlan = {
        id: planData.id,
        name: planData.name,
        info: planData.info,
        data: planData.data,
        data2: planData.data2
      };
      
      setPlans([plan]);
    } catch (error) {
      console.error('Error loading reading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectPlan = (plan: ReadingPlan) => {
    updateSettings({ 
      selectedPlan: plan.id,
      currentDay: 1,
      completedDays: new Set()
    });
    navigate('/reading');
  };

  if (loading) {
    return (
      <div className="plan-selector">
        <div className="loading">{currentText.loading}</div>
      </div>
    );
  }

  return (
    <div className="plan-selector">
      <div className="plan-selector-content">
        <h2>{currentText.title}</h2>
        <p className="subtitle">{currentText.subtitle}</p>
        <div className="plans-grid">
          {plans.map(plan => (
            <div key={plan.id} className="plan-card">
              <div className="plan-header">
                <h3>{plan.name}</h3>
              </div>
              <div className="plan-info" dangerouslySetInnerHTML={{ __html: plan.info }} />
              <div className="plan-details">
                <div className="detail">
                  <span className="detail-label">{currentText.duration}</span>
                  <span className="detail-value">{plan.data2.length} {currentText.days}</span>
                </div>
                <div className="detail">
                  <span className="detail-label">{currentText.totalReadings}</span>
                  <span className="detail-value">{plan.data.length}</span>
                </div>
              </div>
              <div className="plan-actions">
                <button className="select-plan-btn" onClick={() => selectPlan(plan)}>
                  {currentText.startPlan}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanSelector; 