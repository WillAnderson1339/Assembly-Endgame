import { useRef, useState, useEffect } from 'react'

import {languages} from '../data/languages'
// console.log(languages)
// import {words} from '../data/words'
// console.log(words)
import '../css/Main.css'

// https://www.npmjs.com/package/clsx
import { clsx } from 'clsx';


// game states
const GAME_PLAYING = 0
const GAME_WIN = 1
const GAME_LOSE = 2

// constants
const MAX_ATTEMPTS = 9         // number of attempts per game
const NUM_WORDS_TO_FETCH = 2   // number of words to fetch from API

function Main() {
    const hasRun = useRef(false);
    const [words, setWords] = useState([])
    const [currentWord, setCurrentWord] = useState("")
    const [guesses, setGuesses] = useState(generateGuesses())
    const [attempts, setAttempts] = useState(0)
    const [isWin, setIsWin] = useState(GAME_PLAYING)
    const [needResetCurrentWord, setNeedResetCurrentWord] = useState(false)

    // alternative API for words:
    // https://www.api-ninjas.com/api
    // https://www.api-ninjas.com/api/randomword
    // RestAPI: https://api.api-ninjas.com/v1/randomword
    // the thing: A3Nkc2zuyug49ZdMCycW4g==Z0fnB4D7xj0QLayw
    
    // NOTE: the useEffect callback function can (should) return a function that will be called to clean up the side effect
    useEffect(() => {
        console.log("in useEffect for Main: ", hasRun.current )
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
        console.log("in useEffect for words")
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
        console.log("in function LoadNewWords")

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
                >
                {guess.letter.toUpperCase()}
            </button>
        )
    })

    function generateWord() {
        console.log("in function generateWord")
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

    function handleNewGame() {
        console.log("in function handleNewGame")
        setIsWin(GAME_PLAYING)
        setCurrentWord(generateWord())
        setGuesses(generateGuesses())
        setAttempts(0)
    }

    return (
        <>
            <main>
                <header>
                    <h1>Assebmly Endgame</h1>
                    <p>Guess the word within 8 attempts to keep the prrogramming world safe from Assembly!</p>
                </header>
                <section className={isWin === GAME_PLAYING ? "game-status game-status-playing" : isWin === GAME_WIN ? "game-status game-status-win" : "game-status game-status-lose"}>
                    <h2 onClick={handleNewGame}>{
                        isWin === GAME_PLAYING ? "Make guesses on the keyboard below" : 
                        isWin === GAME_WIN ? "You Win!" : 
                        "You Lose!"}
                    </h2>
                    <p>{
                        isWin === GAME_PLAYING ? "You have " + (MAX_ATTEMPTS - attempts -1) + " guesses left" : 
                        isWin === GAME_WIN ? "Well Done! 🎉  Click to play again" : 
                        "Too bad 😟 Click to play again"}
                    </p>
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
            </main>
        </>
    )
}

export default Main
