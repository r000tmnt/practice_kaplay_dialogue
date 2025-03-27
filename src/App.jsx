// import { useState } from 'react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import './App.css'

function App() {
  // Scale the ui
  // Reference from: https://jslegenddev.substack.com/p/how-to-display-an-html-based-ui-on
  // const ui = document.querySelector(".ui");

  const uiRef = useRef(null);

  const scaleUI = () => {
    console.log(uiRef)
    if(uiRef.current){
      const ui = uiRef.current;
      
      document.documentElement.style.setProperty(
        "--scale",
        Math.min(
          window.innerWidth / ui.offsetWidth,
          window.innerHeight / ui.offsetHeight
        )
      );
    }
  }

  useEffect(() => {
    window.addEventListener('resize', scaleUI)
    // Fire the function on the first time
    scaleUI()

    // Cleanup: Remove event listener on component unmount
    return () => {
      window.removeEventListener('resize', scaleUI)
    }
  }
  , [])

  return (
    <>
    <div className="ui" ref={uiRef}>
      {
        // Add your UI here
      }
      <div className='dialogue_wrapper'>
        <div className='dialogue'>
          <p>Hi, I'm a dialogue box!</p>
        </div>
        <div className='name_tag'>
          name goes here
        </div>
      </div>
    </div>
    </>
  )
}

export default App
