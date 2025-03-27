import { useEffect, useRef, useState } from 'react'
import './App.css'
import k from './lib/kaplay';

const { scene, loadSprite, add, pos, sprite, go, wait, loop } = k

// Dialouge object
const conversation = [
  {
    person: {
      name: 'Unknown',
      sprite: 'test'
    },
    dialogue: 'Hello there!',
    bg: 'cave',
    options: [],
    // transition: []
  },
  {
    person: {
      name: '',
      sprite: ''
    },
    dialogue: 'Anyway. Here is a really long sentence that I want to display on the screen. I hope it works.',
    bg: 'cave',
    options: [],
    // transition: []
  },
  {
    person: {
      name: '',
      sprite: ''
    },
    dialogue: 'Well. I need a much longer one to work with. Just enough to test the scrollbars. placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...placeholder...',
    bg: 'cave',
    options: [],
    // transition: []
  }
]

const initScene = () => {
  scene('game', () => {
    // Load sprites
    loadSprite('test', 'portrait/unknow.png')
    loadSprite('cave', 'bg/cave.png')

    // Create sprites
    // const cave = add([sprite('cave'), pos(0, 0)])
    // const person = add([sprite('test'), pos(0, 0)])

    // console.log(cave)
    // console.log(person)
  })

  go('game')
}

if(typeof window !== 'undefined') initScene()

function App() {
  // Scale the ui
  // Reference from: https://jslegenddev.substack.com/p/how-to-display-an-html-based-ui-on
  // const ui = document.querySelector(".ui");

  const [isVisible, setIsVisible] = useState(false)

  // Dialouge state
  const [name, setName] = useState('')
  const [dialogue, setDialogue] = useState('')
  const [speed, setSpeed] = useState(0.1)
  const [index, setIndex] = useState(0)

  // Sprite state
  const [bg, setBg] = useState({})
  const [people] = useState([{}, {}, {}])

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

  const displayDialogue = (index) => {
    if(conversation[index]){
      // Create sprites
      if(!bg.sprite) setBg(add([sprite(conversation[index].bg), pos(0, 0)]))

      if(bg.sprite !== conversation[index].bg){
        bg.sprite = conversation[index].bg
      }

      const peopleIndex = conversation[index].person.order? conversation[index].person.order - 1 : 0

      if(!Object.entries(people[peopleIndex]).length){
        people[peopleIndex] = add([sprite(conversation[index].person.sprite), pos(0, 0)])
      } else {
        if(conversation[index].person.sprite.length) people[peopleIndex].sprite = conversation[index].person.sprite
      }

      people[peopleIndex].flipX = conversation[index].person.flipX
      people[peopleIndex].flipY = conversation[index].person.flipY

      // if (conversation[index].person.vfx){}

      if(conversation[index].person){
        setName(conversation[index].person.name)
      }

      // Dispalay dialouge
      loop(speed, () => {
        setDialogue((prevDialogue) => {
          return conversation[index].dialogue.slice(0, prevDialogue.length + 1)
        })
      }, 
      // max loop
      conversation[index].dialogue.length)
    }
  }

  const handleContinue = () => {
    console.log('clicked')
    const next = index + 1
    if(conversation[next]){
      setDialogue('')
      displayDialogue(next)
      setIndex(next)
    }
  }

  useEffect(() => {
    window.addEventListener('resize', scaleUI)
    // Fire the function on the first time
    scaleUI()

    wait(0.5, () => {
      setIsVisible(true)
      displayDialogue(index)
    })

    // Cleanup: Remove event listener on component unmount
    return () => {
      window.removeEventListener('resize', scaleUI)
    }
  }, [])

  return (
    <>
    <div className="ui" ref={uiRef}>
      {
        // Add your UI here
      }
      <div 
        className='dialogue_wrapper' 
        style={{ visibility: isVisible ? 'visible' : 'hidden' }}
        onClick={handleContinue}  
      >
        <div className='dialogue border bg-black disable-scrollbars'>
          <p>{ dialogue }</p>
        </div>
        <div className='name_tag border bg-black' style={{ visibility: name ? 'visible' : 'hidden' }}>
          { name }
        </div>
      </div>
    </div>
    </>
  )
}

export default App
