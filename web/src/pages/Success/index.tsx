import React from 'react'
import { FiCheckCircle } from 'react-icons/fi'

import './styles.css'

interface SuccessScreenProps {
    hide: string
}

const SuccessScreen: React.FC<SuccessScreenProps> = (props) => {
    return (
        <div id="modal" className={props.hide}>
            <div className="content">
                <span>
                    <FiCheckCircle />
                </span>
                <h2>Ponto criado com sucesso!</h2>
            </div>
        </div>
    )
}

export default SuccessScreen