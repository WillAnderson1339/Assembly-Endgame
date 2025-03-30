import { useRef, useState, useEffect } from 'react'

import {languages} from '../data/languages'
// console.log("Languages:")
// console.log(languages)
// import {words} from '../data/words'
// console.log(words)
import {hints} from '../data/hints'
// console.log(hints)
import '../css/Main.css'


import { clsx } from 'clsx'             // https://www.npmjs.com/package/clsx
import Confetti from 'react-confetti'
import { Tooltip } from 'react-tooltip' // https://www.npmjs.com/package/react-tooltip


// game states
const GAME_PLAYING = 0
const GAME_WIN = 1
const GAME_LOSE = 2

// constants
const MAX_ATTEMPTS = 9         // number of attempts per game
const NUM_WORDS_TO_FETCH = 2   // number of words to fetch from API
const HINT_DISPLAY_TIME = 3000  // show the hint for X milliseconds

function Main() {
    const hasRun = useRef(false);
    const [words, setWords] = useState([])
    const [currentWord, setCurrentWord] = useState("")
    const [guesses, setGuesses] = useState(() => generateGuesses()) // lazy state initialization to ensure is only callled once
    const [attempts, setAttempts] = useState(0)
    const [isWin, setIsWin] = useState(GAME_PLAYING)
    const [needResetCurrentWord, setNeedResetCurrentWord] = useState(false)
    const [showHint, setShowHint] = useState(false)

    // alternative API for words:
    // https://www.api-ninjas.com/api
    // https://www.api-ninjas.com/api/randomword
    // RestAPI: https://api.api-ninjas.com/v1/randomword
    // the thing: A3Nkc2zuyug49ZdMCycW4g==Z0fnB4D7xj0QLayw
    
    // NOTE: the useEffect callback function can (should) return a function that will be called to clean up the side effect
    useEffect(() => {
        // console.log("in useEffect for Main: ", hasRun.current )
        // using hasRun to ensure this code is only executed once (even in Development mode)
        // NOTE: since React 18 the Strict Mode will call the useEffect twice in development mode to help find bugs
        if (hasRun.current === false) {
            // console.log("calling LoadNewWords()")
            LoadNewWords()

            // set boolean flag to true so this code is not run again
            hasRun.current = true;
        }
    }, [])

    useEffect(() => {
        // console.log("in useEffect for words")
        if (words !== undefined && words.length !== 0) {
            if (needResetCurrentWord === true) {
                setCurrentWord(generateWord())
                setNeedResetCurrentWord(false)
            }
        }
    }, [words])
    
    useEffect(() => {
        checkWin()
        checkLose()
    }, [guesses])

    function LoadNewWords() {
        // console.log("in function LoadNewWords")

        setNeedResetCurrentWord(true)

        fetch("https://random-word-api.vercel.app/api?words=" + NUM_WORDS_TO_FETCH)
        .then(res => res.json())
        // .then(data => {console.log("returned data: ", data); return data})
        .then(data => setWords(data))
        .catch(err => console.error("Fetch error:", err));
    }

    const languageElements = languages.map((language, index) => {
        const styles = {
            backgroundColor: language.backgroundColor,
            color: language.color,
            // display: index < attempts ? "none" : ""
        }

        const className = clsx("language-chip", {
            "lost": index < attempts,
        })

        return (
            // <span className="language-chip" style={styles} key={index}>{language.name}</span>
            <span className={className} style={styles} key={index}>{language.name}</span>
        )
    })

    const letterElements = currentWord !== undefined && currentWord.split("").map((letter, index) => {
        // console.log("checking letter", letter)
        // console.log("isGuessed", isGuessed(letter))
        const bIsGuessed = isGuessed(letter)
        return (
            <span 
                // className={
                //     bIsGuessed === true ? "letter letter-guessed" : 
                //     isWin === GAME_LOSE ? "letter letter-game-lost" : 
                //     "letter"
                // } 
                className={clsx("letter", {
                    "letter-guessed": bIsGuessed,
                    "letter-game-lost": (isWin === GAME_LOSE && bIsGuessed === false),
                })}
                key={index}>
                    {letter.toUpperCase()}
            </span>
        )
    })

    const guessElements = guesses.map((guess, index) => {
        // the tutorial shows that the class names do not need the quotes around them, but I found that they do
        const className=clsx("guess", {
            "guess-right": guess.right,
            "guess-wrong": guess.wrong,
            "guess-normal": !guess.right && !guess.wrong,
        })

        return (
            <button 
                // className={
                // guess.right ? "guess guess-right" :
                //  guess.wrong ? "guess guess-wrong" : 
                // "guess guess-normal"
                //} 
                // className={clsx("guess", {
                //     "guess-right": guess.right,
                //     "guess-wrong": guess.wrong,
                //     "guess-normal": !guess.right && !guess.wrong,
                // })}
                className={className}
                key={index} 
                onClick={() => handleGuess(guess.letter)}
                disabled={isWin === GAME_WIN || isWin === GAME_LOSE}
                aria-label={'Letter ${letter}'}
                aria-disabled={isWin === GAME_WIN || isWin === GAME_LOSE}   // shoud add check if letter has been chosen so assisted technology knows it cannot be chosen again
                >
                {guess.letter.toUpperCase()}
            </button>
        )
    })

    function generateWord() {
        // console.log("in function generateWord")
        // console.log("words array: ", words)

        if (words === undefined) {
            console.log("words array is undefined")
            return "error"
        }
        else {
            if (words.length === 0) {
                console.log("words array is empty - fetching new words")
                LoadNewWords()
            }
            else {
                const randomIndex = Math.floor(Math.random() * words.length)
                const newWord = words[randomIndex]
                
                let currentWords = words
                // console.log("currentWords: ", currentWords)
                // console.log("randomIndex: ", randomIndex)
                currentWords.splice(randomIndex, 1)
                setWords (currentWords)
                
                // console.log("new word: ", newWord)
                return newWord
            }
        }
    }

    function generateGuesses() {
        console.log
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
        // console.log("in function checkWin")
        let bWin = false
        if (currentWord !== undefined && currentWord !== "") {
            bWin = currentWord.split("").every(letter => isGuessed(letter))
            if (currentWord === "") {
                console.log("..THE currentWord is empty")
            }
            if (bWin) {
                console.log("setting isWin to true")
                setIsWin(GAME_WIN)
            }
        } 

        return bWin
    }

    function checkLose() {
        if (attempts === MAX_ATTEMPTS) {
            setIsWin(GAME_LOSE) 
        }
    }

    function handleGuess(letter) {
        // console.log("in handleGuess: ", letter)
        if (isWin === GAME_PLAYING && isGuessed(letter) === false) {
            let attribute = "default"

            /*
            isInWord(letter) ? 
            (attribute = "right") : 
            (attribute = "wrong", setAttempts(attempts + 1), setShowHint(true))
            */

            if (isInWord(letter) === true) {
                attribute = "right"
            }
            else {
                attribute = "wrong"
                setAttempts(attempts + 1)

                setShowHint(true)
                setTimeout(() => setShowHint(false), HINT_DISPLAY_TIME);
            }

            setGuesses(prevGuessArray =>
                prevGuessArray.map(guess =>
                    guess.letter === letter
                    ? { ...guess, [attribute]: true }     // the [] is called computed property name and will be replaced with value of name
                    : guess
                )
                );
        }
    }

    function handleNewGame() {
        console.log("in function handleNewGame")
        setIsWin(GAME_PLAYING)
        setCurrentWord(generateWord())
        setGuesses(generateGuesses())
        setAttempts(0)
    }

    function getHint() {
        // console.log("in function getHint")
        const randomIndex = Math.floor(Math.random() * hints.length)
        return hints[randomIndex]
    }

    function renderGameStatus() {
        if (isWin === GAME_WIN) {
            return (
                <>
                    <h2 onClick={handleNewGame}>You Win!</h2>
                    <p>"Well Done! 🎉  Click to play again"</p>
                </>
            )
        }
        else if (isWin === GAME_LOSE) {
            return (
                <>
                    <h2 onClick={handleNewGame}>You Lose</h2>
                    <p>"Too bad 😟  Click to play again"</p>
                </>
            )
        }
        else {
            if (showHint === false) {
                return (
                    <>
                        <h2 onClick={handleNewGame}>Make guesses on the keyboard below</h2>
                        <p>You have {(MAX_ATTEMPTS - attempts)} guesses left</p>
                    </>
                )
            }
            else {
                return (
                    <>
                        <h2 onClick={handleNewGame}>The world has lost {languages[attempts-1].name} coding</h2>
                        <p>Hint: {getHint()}</p>
                    </>
                )
            }
        }

    }

    return (
        <>
            <main>
                <header>
                    <h1>Assembly Endgame</h1>
                    <p>Guess the word within 8 attempts to keep the prrogramming world safe from Assembly!</p>
                </header>
                {isWin === GAME_WIN && <Confetti recycle={false} numberOfPieces={400}/>}
                <section 
                    aria-live="polite"
                    role="status"
                    // className={isWin === GAME_PLAYING ? "game-status game-status-playing" : isWin === GAME_WIN ? "game-status game-status-win" : "game-status game-status-lose"}>
                    className={clsx("game-status", {
                        "game-status-win" : isWin === GAME_WIN,
                        "game-status-lose": isWin === GAME_LOSE,
                        "game-status-hint" : (showHint === true && isWin !== GAME_LOSE),
                        "game-status-playing" : isWin === GAME_PLAYING,
                    })}
                >
                    {renderGameStatus()}
                </section>
                <section className="language-chips">
                    {languageElements}
                </section>
                <section className="word-spaces">
                    {letterElements}
                </section>
                <section className="guesses">
                    {guessElements}
                </section>
                <section className="sr-only" aria-live="polite" role="status">
                    /**/
                    <p>Current word: {
                        //  should also add a <p> element that reads out the letter that was clicked and gives feedback on if it was right or wrong
                        // see 14:55:00 in the tutorial
                        currentWord !== undefined && currentWord.split("").map(letter =>     // NOTE: this reads all letters in the word - need to change to just the letters that have been guessed 
                            isInWord(letter) ? 
                            letter + "." : 
                            "blank."
                        ).join(" ")}</p>
                </section>
            </main>
        </>
    )
}

export default Main
