import { useSelector } from 'react-redux';

function DialogueOption ({ showOption, optionClick, dialogue }) {
    const flag = useSelector(state => state.flag)

    const setLock = (option) => {
        if(!option.lock) return false

        if(option.lock && flag[option.lock]){
            return true
        }else{
            return false
        }
    }


    return (
        <>
            <ul className="option center text-center" style={{ visibility: showOption ? 'visible' : 'hidden' }}>
                {
                    dialogue.option.map((opt, i) => {
                        return (
                            setLock(opt)?
                            <li className='option_disabled' key={i}>
                                { opt.label }
                            </li>
                            :
                            <li className='bg-white' key={i} onClick={() => optionClick(opt)}>
                                { opt.label }
                            </li>
                        )
                    })
                }
            </ul>
        </>
    )
}

export default DialogueOption