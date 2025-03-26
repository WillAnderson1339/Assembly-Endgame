import { useState, useEffect, useRef } from 'react'

import {languages} from '../data/languages'
// console.log(languages)

import '../css/Main.css'


function Main() {
    const [currentWord, setCurrentWord] = useState('react')

    const languageElements = languages.map((language, index) => {
        const styles = {
            backgroundColor: language.backgroundColor,
            color: language.color,
            // border: "1px solid green"
        }

        return (
            <span className="language-chip" style={styles} key={index}>{language.name}</span>
        )
    })

    const letterElements = currentWord.split("").map((letter, index) => {
        return (
            <span className="letter" key={index}>{letter.toUpperCase()}</span>
        )
    })

    return (
        <>
            <main>
                <header>
                    <h1>Assebmly Endgame</h1>
                    <p>Guess the word within 8 attempts to keep the prrogramming world safe from Assembly!</p>
                </header>
                <section className="game-status">
                    <h2>You Win!</h2>
                    <p>Well done! 🎉</p>
                </section>
                <section className="language-chips">
                    {/* <span style={{backgroundColor: '#E2680F', color: '#00FF00'}}>FOO</span> */}
                    {/* <span>BAR</span> */}
                    {languageElements}
                </section>
                <section className="word-spaces">
                    {letterElements}
                </section>
            </main>
        </>
    )
}

export default Main
