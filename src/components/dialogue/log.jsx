// Dialogue store
import { setMode } from '../../store/dialogue';
import { useSelector, useDispatch } from 'react-redux';

function DialogueLog ({ dispalyLog }) {
  // Dialouge state
  const log = useSelector(state => state.log)
  const dispatch = useDispatch()

    return (
        <>
            <div className="log" style={{ display: dispalyLog? 'block' : 'none' }}>
                <div className="close-btn">
                    <button onClick={() => dispatch(setMode(''))}>X</button>
                </div>

                <div>
                    {
                        log.map((node, i) => {
                            return (
                                <p key={i}>{ node }</p>
                            )
                        })
                    }
                </div>
            </div>
        </>
    )
}

export default DialogueLog
