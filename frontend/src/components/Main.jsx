import { useState, useEffect, useRef } from 'react'

import {languages} from '../data/languages'
// console.log(languages)

import '../css/Main.css'


function Main() {
    const [currentWord, setCurrentWord] = useState('react')
    const [guesses, setGuesses] = useState(generateGuesses())
    const [attempts, setAttempts] = useState(8)

    const languageElements = languages.map((language, index) => {
        const styles = {
            backgroundColor: language.backgroundColor,
            color: language.color,
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

    const guessElements = guesses.map((guess, index) => {
        return (
            // <span 
            //     className={guess.right ? "guess guess-right" : guess.wrong ? "guess guess-wrong" : "guess guess-normal"} 
            //     // className="guess-right"  
            //     key={index}
            //     >
            //     {guess.letter.toUpperCase()}
            // </span>
                <button 
                    // className="guess" 
                    className={guess.right ? "guess guess-right" : guess.wrong ? "guess guess-wrong" : "guess guess-normal"} 
                    key={index} 
                    onClick={() => handleGuess(guess.letter)}
                    >
                    {guess.letter.toUpperCase()}
                </button>
            )
    })

    function generateGuesses() {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz'
        const alphabetArray = alphabet.split("")
        const guessArray = []
        const guessElements = alphabetArray.map((letter, index) => {
            const guess = {
                id: index,
                letter: letter, 
                right: false, 
                wrong: false
            }
            guessArray.push(guess)
        })

        return guessArray
    }

    function isInWord(letter) {
        return currentWord.includes(letter)
    }

    function handleGuess(letter) {
        // console.log(letter)
        let attribute = "default"
        isInWord(letter) ? attribute = "right" : attribute = "wrong"

        setGuesses(prevGuessArray =>
            prevGuessArray.map(guess =>
              guess.letter === letter
                ? { ...guess, [attribute]: true }     // the [] is called computed property name and will be replaced with value of name
                : guess
            )
          );
    }

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
                    {languageElements}
                </section>
                <section className="word-spaces">
                    {letterElements}
                </section>
                <section className="guesses">
                    {/* <h2>Guesses</h2> */}
                    {guessElements}
                </section>
            </main>
        </>
    )
}

export default Main
