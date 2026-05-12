import { useState } from 'react';
import EntranceAnimation from './animation/EntranceAnimation';
import Home from './pages/Home';

function App() {
  const [showAnimation, setShowAnimation] = useState(true);

  if (showAnimation) {
    return <EntranceAnimation onAnimationComplete={() => setShowAnimation(false)} />;
  }

  return <Home />;
}

export default App;







// for just 1 time 

// import { useState, useEffect } from 'react';
// import EntranceAnimation from './animation/EntranceAnimation';
// import Home from './pages/Home';

// function App() {
//   const [showAnimation, setShowAnimation] = useState(null);

//   useEffect(() => {
//     // Check if animation has been shown in this session
//     const hasShownAnimation = sessionStorage.getItem('animationShown');
    
//     if (!hasShownAnimation) {
//       // First time in this session - show animation
//       setShowAnimation(true);
//       sessionStorage.setItem('animationShown', 'true');
//     } else {
//       // Already shown animation in this session - directly go to home
//       setShowAnimation(false);
//     }
//   }, []);

//   if (showAnimation === null) {
//     // Loading state
//     return null;
//   }

//   if (showAnimation) {
//     return <EntranceAnimation onAnimationComplete={() => setShowAnimation(false)} />;
//   }

//   return <Home />;
// }

// export default App;