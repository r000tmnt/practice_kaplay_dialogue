//react-icons
import { IoPlaySkipForward } from "react-icons/io5";
import { MdAutoMode } from "react-icons/md";
import { BiHide } from "react-icons/bi";
import { LuLogs } from "react-icons/lu";

// Dialogue store
import { setMode } from "../../store/dialogue";
import { useSelector, useDispatch } from 'react-redux';

function DialogueControl ({ isVisible }) {
  // Dialouge state
    const mode = useSelector((state) => state.mode)
    const dispatch = useDispatch()

    return(
        <>
            <ul className="control" style={{ visibility: (isVisible)? 'visible' : 'hidden' }}>
                <li>
                    <button onClick={() => dispatch(setMode('SKIP'))} style={(mode !== 'SKIP')? { opacity: 0.5 } : {}}>
                        <IoPlaySkipForward />
                    </button>
                </li>
                <li>
                    <button onClick={() => dispatch(setMode((mode === 'AUTO')? '' : 'AUTO'))} style={(mode !== 'AUTO')? { opacity: 0.5 } : {}}>
                        <MdAutoMode />
                    </button>
                </li>
                <li>
                    <button onClick={() => dispatch(setMode((mode === 'HIDE')? '' : 'HIDE'))} style={(mode !== 'HIDE')? { opacity: 0.5 } : {}}>
                        <BiHide />
                    </button>
                </li>
                <li>
                    <button onClick={() => dispatch(setMode('LOG'))} style={(mode !== 'LOG')? { opacity: 0.5 } : {}}>
                        <LuLogs />
                    </button>
                </li>
            </ul>        
        </>
    )    
}

export default DialogueControl
