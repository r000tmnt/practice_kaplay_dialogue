import { useEffect, useRef, useState } from 'react'
import './App.css'
import k from './lib/kaplay';

// Dialouge object
import dialogue from './data/dialogue';

const { scene, loadSprite, add, pos, sprite, go, wait, loop } = k

const conversation = dialogue.start

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
  const [showOptions, setShowOptions] = useState(false)

  // Dialouge state
  const [name, setName] = useState('')
  const [dialogue, setDialogue] = useState('')
  const [timer, setTimer] = useState()
  const [speed, setSpeed] = useState(0.1)
  const [index, setIndex] = useState(0)
  const [flag, setFlag] = useState({})
  const [point, setPoint] = useState({})

  // Sprite state
  const [bg, setBg] = useState({})
  const [people] = useState([{}, {}, {}])

  const uiRef = useRef(null);

  // #region Scale UI
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

    wait(0.5, () => {
      setIsVisible(true)
    })

    // Cleanup: Remove event listener on component unmount
    return () => {
      window.removeEventListener('resize', scaleUI)
    }
  }, [])

  useEffect(() => {
    if(isVisible){
      console.log('show dialogue box')
      displayDialogue(index)
    }
  }, [isVisible])
  // #endregion

  // #region Option Click
  const optionClick = (option) => {
    setShowOptions(false)
    console.log(option)

    // Set flag. Set points...etc.
    if(option.flag) 
      setFlag((prevState) => ({ 
        ...prevState, 
        [option.flag]: true 
      }))

    if(option.point) {
      const newState = {}
      Object.entries(option.point).forEach(point => {
        newState[point[0]] += point[1]
      })   
      setPoint((prevState) => ({
        ...prevState,
        ...newState
      }))
    }
  }

  useEffect(() => {
    // Check current option
    const theOption = conversation[index].options.find(opt => {
      if(opt.flag && flag[opt.flag]) return opt
    })

    if(theOption && !theOption.point){
      proceedWithOption(theOption.next)
    }
  }, [flag])

  useEffect(() => {
    // Check current option
    const theOption = conversation[index].options.find(opt => {
      if(opt.point && Object.entries(opt.point).find(p =>  point[p[0]])) return opt
    })
    
    if(theOption) proceedWithOption(theOption.next)
  }, [point])

  // Go to the next part where the option leads to
  const proceedWithOption = (next) => {
    setDialogue('')
    setIndex(next)
    setIsVisible(true)
    displayDialogue(next)
  } 
  // #endregion

  // #region Display Dialogue
  const displayDialogue = (index) => {
    if(conversation[index]){
      // Check flag
      if(conversation[index].requiredFlag && !flag[conversation[index].requiredFlag] ){
        // If the flag didn't match
        // Find the next part of the conversation
        for(let i= index + 1; i < Object.entries(conversation).length; i++){
          if(!conversation[i].requiredFlag){
            setIndex(i)
            break;
          }
        }
        return
      }

      // Check point


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

      if(conversation[index].person.name.length ){
        setName(conversation[index].person.name)
      }

      // Dispalay dialouge
      setTimer(
        loop(speed, () => {
          setDialogue((prevDialogue) => {
            return conversation[index].dialogue.slice(0, prevDialogue.length + 1)
          })
        }, 
        // max loop
        conversation[index].dialogue.length)
      )

      // Cancel the event when the loop is finished
      // timer.onEnd(() => timer.cancel())
    }
  }

  const handleContinue = () => {
    console.log('clicked')
    console.log(timer)

    if(dialogue.length < conversation[index].dialogue.length){
      timer.paused = true
      timer.cancel()
      setDialogue(conversation[index].dialogue)
    }else{
      // Check if option exit
      if(conversation[index].options.length){
        // Display options
        setShowOptions(true)
        setName('')
        setIsVisible(false)
      }else{
        const next = index + 1
        if(conversation[next]){
          setDialogue('')
          displayDialogue(next)
          setIndex(next)
        }  
      }
    }
  }
  // #endregion

  return (
    <>
    <div className="ui" ref={uiRef}>
      {
        // Add your UI here
      }
      <ul className="option center text-center" style={{ visibility: showOptions ? 'visible' : 'hidden' }}>
        {/* <li v-for="opt in conversarion" key="e" onClick={optionClick}>{  }</li> */}
        {
          conversation[index].options.map((opt, i) => {
            return (
              <li className='bg-white' key={i} onClick={() => optionClick(opt)}>{ opt.label }</li>
            )
          })
        }
      </ul>

      <div 
        className='dialogue_wrapper' 
        style={{ visibility: isVisible ? 'visible' : 'hidden' }}
        onClick={handleContinue}  
      >
        <div className='name_tag border bg-black' style={ name.length? { visibility: 'visible', zIndex: 11 } : { visibility: 'hidden' } }>
          { name }
        </div>
        <div className='dialogue border bg-black disable-scrollbars'>
          <p>{ dialogue }</p>
        </div>
      </div>
    </div>
    </>
  )
}

export default App
