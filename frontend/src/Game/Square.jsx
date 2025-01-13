import React,{useState} from 'react'
import styles from './Square.module.css'
function Square(props)
{
return(<>

            <div onClick={props.onClick} className={styles.Square}> {props.value}</div>
    </>);


}
export default Square