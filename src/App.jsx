import { useEffect, useRef, useState } from 'react'
import './App.css'
import k from './lib/kaplay';

const { scene, loadSprite, add, pos, sprite, go, wait } = k

const initScene = () => {
  scene('game', () => {
    // Load sprites
    loadSprite('test', 'portrait/unknow.png')
    loadSprite('cave', 'bg/cave.png')

    // Create sprites
    const cave = add([sprite('cave'), pos(0, 0)])
    const person = add([sprite('test'), pos(0, 0)])

    console.log(cave)
    console.log(person)
  })

  go('game')
}

if(typeof window !== 'undefined') initScene()

function App() {
  // Scale the ui
  // Reference from: https://jslegenddev.substack.com/p/how-to-display-an-html-based-ui-on
  // const ui = document.querySelector(".ui");

  const [isVisible, setIsVisible] = useState(false)

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

    wait(0.5, () => setIsVisible(true))

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
      <div className='dialogue_wrapper' style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
        <div className='dialogue border bg-black'>
          <p>Hi, I'm a dialogue box!</p>
        </div>
        <div className='name_tag border bg-black'>
          name goes here
        </div>
      </div>
    </div>
    </>
  )
}

export default App
