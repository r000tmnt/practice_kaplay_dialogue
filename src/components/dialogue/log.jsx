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
                <div class="close-btn">
                    <button onClick={() => dispatch(setMode(''))}>X</button>
                </div>

                <div>
                    {
                        log.map((node) => {
                            return (
                                <p key={node}>{ node }</p>
                            )
                        })
                    }
                </div>
            </div>
        </>
    )
}

export default DialogueLog
