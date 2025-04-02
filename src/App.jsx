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
import DialogueOption from './components/dialogue/option';

const { 
  scene, 
  loadSprite, 
  add, 
  pos, 
  sprite, 
  go, 
  wait, 
  loop,
  opacity,
  rotate,
  animate,
  vec2,
  width,
} = k

const conversation = dialogue.start

const initScene = () => {
  // Scenes can accept argument from go()
  scene('game', () => {
    // Load sprites
    loadSprite('test', 'portrait/unknow_sprite_sheet.png', {
      sliceX: 2
    })
    loadSprite('cave', 'bg/cave.png')
    loadSprite('cave_colored', 'bg/cave_colored.png')

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
  // If the flag(s) matched
  const [flagMatched, setFlagMatched] = useState(false)
  // Where to move the sprite
  const [direction, setDirection] = useState('')
  const dispatch = useDispatch()
  const getStoreState = (target) => {
    return dialogueStore.getState()[target]
  }

  // Sprite state
  const [bg, setBg] = useState({})
  const [people] = useState([{}, {}, {}])

  const uiRef = useRef(null);

  // #region Scale UI
  // Reference from: https://jslegenddev.substack.com/p/how-to-display-an-html-based-ui-on
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
    if(option.flag) {
      dispatch(setFlag(option.flag))
      if(option.flag.includes('move')){
        setDirection(option.flag.split('_')[1])
      }
    }

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
  const flagCheck = (index) => {
    // If the requiredFlag is an array
    if(Array.isArray(conversation[index].requiredFlag)){
      let matched = conversation[index].requiredFlag.every((item) => flag[item])
      setFlagMatched(matched)
      return matched
    }
    else
    // If the requiredFlag is a string
    if(conversation[index].requiredFlag && !flag[conversation[index].requiredFlag] ){
      // If the flag didn't match
      // Find the next part of the conversation
      for(let i= index + 1; i < Object.entries(conversation).length; i++){
        if(!conversation[i].requiredFlag){
          dispatch(setIndex(i))
          break;
        }
      }
      setFlagMatched(false)
      return false
    }else{
      // If the flag matches
      setFlagMatched(true)
      return true
    }
  } 

  const setAnimation = (person, index) => {
    // Stop current playing animation if any
    if(people[index].getCurAnim()) people[index].stop()
    // Stop current playing animation which came from the animate component
    if(people[index].animation.duration > 0) people[index].unanimateAll()
    // If the angle is off, reset the number
    if(people[index].angle > 0) people[index].rotateTo(0)
    // If the sprite position moved
    // TODO - Back to default position if needed, which could be varied
    // if(people[index].pos.x > 0 || people[index].pos.y > 0) people[index].moveTo(0, 0)

    // If there is animation to play
    if(person.animate){
      const animation_name = Object.entries(person.animate)[0][0]

      if(animation_name === 'rotate'){
        people[index].animate("angle", [0, 360], {
          duration: 2,
          direction: person.animate[animation_name].direction,
          // loops: 1
        })

        people[index].animation.seek(0)
      }

      if(animation_name.includes('move')){
        let newPosition = {}

        switch(direction){
          case 'left': {
            const gameWidth = width()
            console.log(gameWidth)
            newPosition = vec2(-gameWidth * (person.animate.move.value / 100), 0)
          }
          break;
          case 'right': {
            const gameWidth = width()
            console.log(gameWidth)
            newPosition = vec2(gameWidth * (person.animate.move.value / 100), 0)
          }
          break;
          // And more...
        }

        people[index].tween(people[index].pos, newPosition, 0.5, (p) => people[index].pos = p)

        // people[index].animate("pos", [people[index].pos, newPosition], {
        //   duration: 5,
        //   loops: 1
        // })

        // people[index].onUpdate(() => {
           // const deltaTime = dt()
           // const times = Math.floor((deltaTime % 2) / 2)
           // people[index].pos = lerp(people[index].pos, newPosition, times)
          
        // })
      }
    }
  }

  const displayDialogue = (index) => {
    if(conversation[index]){
      // Check flag
      const flagMatched = flagCheck(index)

      // Check point


      // If the condition is allowd to be matched partially
      if(conversation[index].condition && !conversation[index].condition.all && !flagMatched) {
        // Do nothing, continue with the rest
      } else if(!flagMatched) return

      // Create sprites
      if(!bg.sprite) setBg(add([sprite(conversation[index].bg), pos(0, 0)]))
      else
      if(conversation[index].bg.length && bg.sprite !== conversation[index].bg){
        bg.sprite = conversation[index].bg
      }

      const peopleIndex = conversation[index].person.order? conversation[index].person.order - 1 : 0
      const person = conversation[index].person

      // If the character is not redered yet
      if(!Object.entries(people[peopleIndex]).length){
        people[peopleIndex] = add([
          sprite(person.sprite, { frame: person.frame || 0 }), 
          pos(0, 0),
          opacity(1),
          rotate(0),
          k.timer(),
          animate()
        ])
      } else {
        if (person.frame && person.frame !== people[peopleIndex].frame) people[peopleIndex].frame = person.frame

        if(person.sprite.length && person.sprite !== conversation[index].person.sprite) {
          people[peopleIndex].use(sprite(person.sprite, { frame: person.frame || 0 }))
        }
      }      

      people[peopleIndex].flipX = conversation[index].person.flipX
      people[peopleIndex].flipY = conversation[index].person.flipY

      // if (conversation[index].person.vfx){}

      if(conversation[index].person.name && conversation[index].person.name !== name){
        dispatch(setName(conversation[index].person.name)) 
      }

      // Reset and play animation
      setAnimation(person, peopleIndex)

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

          if(conversation[index].transition){
            // If there are transitions to play
          }

          // If the requiredFlag is an array
          if(Array.isArray(conversation[index].requiredFlag)){
            dispatch(setLog(`${name.length? `${name}: ` : ''}${dialogue}`))
            dispatch(setDialogue(''))
            // Go the index whether the flags matched or not
            dispatch(setIndex(conversation[index].condition[String(flagMatched)]))
          }else{
            const next = index + 1
            if(conversation[next]){
              dispatch(setLog(`${name.length? `${name}: ` : ''}${dialogue}`))
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
        setIsVisible((preState) => !preState)
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

      <DialogueOption showOption={showOption} optionClick={optionClick} dialogue={conversation[index]} />

      <div 
        className='dialogue_wrapper' 
        style={{ visibility: isVisible? 'visible' : 'hidden' }}
        onClick={handleContinue}  
      >
        <div className='name_tag border bg-black' style={{ visibility: isVisible? 'visible' : 'hidden', zIndex: name.length? 11 : -1 }}>
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
