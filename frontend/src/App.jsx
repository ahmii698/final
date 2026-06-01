import { useState, useEffect } from 'react';
import EntranceAnimation from './animation/EntranceAnimation';
import Home from './pages/Home';

function App() {
  const [showAnimation, setShowAnimation] = useState(null);

  useEffect(() => {
    // LOCAL STORAGE - Sirf 1 baar life-time mein show hogi
    // Refresh karne ya browser close karne ke baad bhi nahi aayegi
    const hasShownAnimation = localStorage.getItem('animationShown');
    
    if (!hasShownAnimation) {
      // Pehli baar - animation show karo
      setShowAnimation(true);
      localStorage.setItem('animationShown', 'true');
    } else {
      // Already show ho chuki - directly home page
      setShowAnimation(false);
    }
  }, []);

  // Loading state - jab tak check ho raha hai
  if (showAnimation === null) {
    return null; // Ya koi loading spinner
  }

  // Animation show karo
  if (showAnimation) {
    return <EntranceAnimation onAnimationComplete={() => setShowAnimation(false)} />;
  }

  // Home page show karo
  return <Home />;
}

export default App;