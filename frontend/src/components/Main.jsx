import { useState, useEffect, useRef } from 'react'

import {languages} from '../data/languages'
// console.log(languages)
import {words} from '../data/words'
console.log(words)
import '../css/Main.css'

// game states
const GAME_PLAYING = 0
const GAME_WIN = 1
const GAME_LOSE = 2

// number of attempts
const MAX_ATTEMPTS = 9

function Main() {
    const [currentWord, setCurrentWord] = useState('react')
    const [guesses, setGuesses] = useState(generateGuesses())
    const [attempts, setAttempts] = useState(0)
    const [isWin, setIsWin] = useState(GAME_PLAYING)

    useEffect(() => {
        checkWin()
        checkLose()
    }, [guesses])

    const languageElements = languages.map((language, index) => {
        const styles = {
            backgroundColor: language.backgroundColor,
            color: language.color,
            display: index < attempts ? "none" : ""
        }

        return (
            <span className="language-chip" style={styles} key={index}>{language.name}</span>
        )
    })

    const letterElements = currentWord.split("").map((letter, index) => {
        // console.log("checking letter", letter)
        // console.log("isGuessed", isGuessed(letter))
        const bIsGuessed = isGuessed(letter)
        return (
            <span className={bIsGuessed ? "letter letter-guessed" : "letter"} key={index}>{letter.toUpperCase()}</span>
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

    function generateWord() {
        const randomIndex = Math.floor(Math.random() * languages.length)
        return languages[randomIndex].name
    }

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

    function isGuessed(letter) {
        return (
            guesses.find(guess => guess.letter === letter).right || 
            guesses.find(guess => guess.letter === letter).wrong
        )
    }

    function checkWin() {
        const bWin = currentWord.split("").every(letter => isGuessed(letter))
        // console.log("in function checkWin, letter=", letter, "bWin =", bWin)
        if (bWin) {
            // console.log("setting isWin to true")
            setIsWin(GAME_WIN)
        }
        return bWin
    }

    function checkLose() {
        if (attempts === MAX_ATTEMPTS) {
            setIsWin(GAME_LOSE) 
        }
    }

    function handleGuess(letter) {
        // console.log(letter)
        if (isGuessed(letter) === false) {
            let attribute = "default"
            isInWord(letter) ? (attribute = "right") : (attribute = "wrong", setAttempts(attempts + 1))

            setGuesses(prevGuessArray =>
                prevGuessArray.map(guess =>
                    guess.letter === letter
                    ? { ...guess, [attribute]: true }     // the [] is called computed property name and will be replaced with value of name
                    : guess
                )
                );
        }
    }

    return (
        <>
            <main>
                <header>
                    <h1>Assebmly Endgame</h1>
                    <p>Guess the word within 8 attempts to keep the prrogramming world safe from Assembly!</p>
                </header>
                <section className={isWin === GAME_PLAYING ? "game-status game-status-playing" : isWin === GAME_WIN ? "game-status game-status-win" : "game-status game-status-lose"}>
                    <h2>{
                        isWin === GAME_PLAYING ? "Make guesses on the keyboard below" : 
                        isWin === GAME_WIN ? "You Win!" : 
                        "You Lose!"}
                    </h2>
                    <p>{
                        isWin === GAME_PLAYING ? "You have " + (MAX_ATTEMPTS - attempts -1) + " guesses left" : 
                        isWin === GAME_WIN ? "Well Done! 🎉" : 
                        "Too bad 😟"}
                    </p>
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
