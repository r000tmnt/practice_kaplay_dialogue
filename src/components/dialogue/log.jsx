// Dialogue store
import dialogueStore, { setMode } from '../../store/dialogue';

function DialogueLog ({ dispalyLog }) {
  // Dialouge state
  const {
    log,
  } = dialogueStore.getState()

    return (
        <>
            <div className="log" style={{ display: dispalyLog? 'block' : 'none' }}>
                <button onClick={() => dialogueStore.dispatch(setMode(''))}>X</button>

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
