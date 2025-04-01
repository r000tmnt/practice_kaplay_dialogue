import { useEffect, useRef, useState } from 'react'
import './App.css'
import k from './lib/kaplay';

// Dialouge object
import dialogue from './data/dialogue';

// Dialogue store
import { useSelector, useDispatch } from 'react-redux';
import dialogueStore, { 
  setDialogue, 
  setName, 
  setIndex, 
  setSpeed, 
  setLog, 
  clearLog, 
  setFlag, 
  setPoint, } from './store/dialogue';

// Components
import DialogueControl from './components/dialogue/control';
import DialogueLog from './components/dialogue/log';

const { scene, loadSprite, add, pos, sprite, go, wait, loop } = k

const conversation = dialogue.start

const initScene = () => {
  // Scenes can accept argument from go()
  scene('game', () => {
    // Load sprites
    loadSprite('test', 'portrait/unknow_sprite_sheet.png', {
      sliceX: 2
    })
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
  const [showOption, setShowOption] = useState(false)

  // Dialouge state
  const dialogue = useSelector(state => state.dialogue) 
  const name = useSelector(state => state.name)
  const index = useSelector(state => state.index)
  const speed = useSelector(state => state.speed)
  const mode = useSelector(state => state.mode)
  const flag = useSelector(state => state.flag) 
  const point = useSelector(state => state.point)
  const [autoDialogue, setAutoDialogue] = useState(false)
  const [dispalyLog, setDisplayLog] = useState(false)
  const [clickLock, setClickLock] = useState(false)
  const [timer, setTimer] = useState({})
  const dispatch = useDispatch()
  const getStoreState = (target) => {
    return dialogueStore.getState()[target]
  }

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
  }, [isVisible, index])
  // #endregion

  // #region Option Click
  const optionClick = (option) => {
    setShowOption(false)
    console.log(option)

    // Set flag. Set points...etc.
    if(option.flag) 
      dispatch(setFlag(option.flag))

    if(option.point) {
      dispatch(setPoint(Object.values(point))) // ex. { friendly: 10 } => ['friendly', 10]
    }
  }

  useEffect(() => {
    // Check current option
    const theOption = conversation[index].option.find(opt => {
      if(opt.flag && flag[opt.flag]) return opt
    })

    if(theOption && !theOption.point){
      proceedWithOption(theOption.next)
    }
  }, [flag])

  useEffect(() => {
    // Check current option
    const theOption = conversation[index].option.find(opt => {
      if(opt.point && Object.entries(opt.point).find(p =>  point[p[0]])) return opt
    })
    
    if(theOption) proceedWithOption(theOption.next)
  }, [point])

  // Go to the next part where the option leads to
  const proceedWithOption = (next) => {
    console.log('clear dialogue box by option')
    dispatch(setDialogue(''))
    dispatch(setIndex(next))
    setIsVisible(true)
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
            dispatch(setIndex(i))
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
      const person = conversation[index].person

      if(!Object.entries(people[peopleIndex]).length){
        people[peopleIndex] = add([sprite(person.sprite, { frame: person.frame || 0 }), pos(0, 0)])
      } else {
        if (person.frame && person.frame !== people[peopleIndex].frame) people[peopleIndex].frame = person.frame

        if(conversation[index].person.sprite !== person.sprite) {
          people[peopleIndex].use(sprite(person.sprite, { frame: person.frame || 0 }))
        }
      }      

      people[peopleIndex].flipX = conversation[index].person.flipX
      people[peopleIndex].flipY = conversation[index].person.flipY

      // if (conversation[index].person.vfx){}

      if(conversation[index].person.name && conversation[index].person.name !== name){
        dispatch(setName(conversation[index].person.name)) 
      }

      // Dispalay dialouge
      if(mode === 'AUTO'){
        setTimer(
          loop(getStoreState('speed'), () => {
            const dialogue = getStoreState('dialogue')
            if(dialogue.length === conversation[index].dialogue.length){
              handleContinue()
            }else{
              dispatch(setDialogue(conversation[index].dialogue.slice(0, dialogue.length + 1)))
            }
          }, 
          // max loop
          conversation[index].dialogue.length)
        )
      }else{
        setTimer(
          loop(speed, () => {
            const dialogue = getStoreState('dialogue')
            dispatch(setDialogue(conversation[index].dialogue.slice(0, dialogue.length + 1)))
          }, 
          // max loop
          conversation[index].dialogue.length)
        )
      }
    }
  }

  const stopTimer = () => {
    timer.paused = true
    timer.cancel()
  }

  const handleContinue = () => {
    console.log('clicked')
    console.log(timer)
    
    if(!clickLock){
      setClickLock(true)
      
      if(getStoreState('dialogue').length < conversation[index].dialogue.length){
        stopTimer()
        dispatch(setDialogue(conversation[index].dialogue))
      }else{
        // Check if option exit
        if(conversation[index].option.length){
          // Display option
          stopTimer()
          setShowOption(true)
          dispatch(setName(''))
          setIsVisible(false)
        }else{
          const next = index + 1
          if(conversation[next]){
            dispatch(setLog(`${name.length? `${name}:` : ''}${dialogue}`))
            console.log('clear dialogue box by click')
            dispatch(setDialogue(''))
            dispatch(setIndex(next))
          }else{
            // TODO - If no more dialogue
            dispatch(clearLog())
            stopTimer()
          }
        }
      }  
      
      // Prevent click rapidly
      wait(speed, () => setClickLock(false))
    }
  }
  // #endregion

  // #region Mode listener
  useEffect(() => {
    switch(mode){
      case 'SKIP':
        // SKIP the scene
        dispatch(clearLog())
      break;
      case 'AUTO':
        setAutoDialogue((preState) => !preState)
      break;
      case 'HIDE':
        setIsVisible((preState) => !preState)
      break;  
      case 'LOG':
        setDisplayLog((preState) => !preState)
      break;
      default:
        setIsVisible(true)
        setDisplayLog(false)
        setAutoDialogue(false)
      break;
    }
  }, [mode])


  useEffect(() => {
    // Fast forward dialogue
    if(autoDialogue){
      dispatch(setSpeed(0.1)) // 2x speed
    }else{
      dispatch(setSpeed(0.2)) // 1x speed
    }

    if(Object.entries(timer).length){
      stopTimer()
      displayDialogue(index)      
    }
  }, [autoDialogue])
  // #endregion

  return (
    <>
    <div className="ui" ref={uiRef}>
      {
        // Add your UI here
      }

      <DialogueControl isVisible={isVisible} />

      <ul className="option center text-center" style={{ visibility: showOption ? 'visible' : 'hidden' }}>
        {/* <li v-for="opt in conversarion" key="e" onClick={optionClick}>{  }</li> */}
        {
          conversation[index].option.map((opt, i) => {
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

      <DialogueLog dispalyLog={dispalyLog}></DialogueLog>
    </div>
    </>
  )
}

export default App
