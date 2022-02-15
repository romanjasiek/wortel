import React, { useState, useEffect } from "react";
import Keyboard from "./components/Keyboard";
import { wordList } from "./constants/data";
import './App.css';

const App = () => {
  const [boardData, setBoardData] = useState(
    JSON.parse(localStorage.getItem("board-data"))
  );
  const [charArray, setCharArray] = useState([]);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(false);

  const resetBoard = () => {
    let alphabetIndex = Math.floor(Math.random() * 26);
    let wordIndex = Math.floor(
      Math.random() * wordList[String.fromCharCode(alphabetIndex + 97)].length
    );
    let newBoardData = {
      ...boardData,
      solution: wordList[String.fromCharCode(alphabetIndex + 97)][wordIndex],
      "rowIndex": 0,
      "boardWords": [],
      "boardRowStatus": [],
      "presentCharArray": [],
      "absentCharArray": [],
      "correctCharArray": [],
      "status": "IN_PROGRESS",
    };
    setBoardData(newBoardData);
    localStorage.setItem("board-data", JSON.stringify(newBoardData));
  }

  const handleError = () => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  }

  const handleMessage = (message) => {
    setMessage(true);
    setTimeout(() => {
      setMessage(false);
    }, 3000);
  }

  const enterBoardWord = (word) => {
    let boardWords = boardData.boardWords;
    let boardRowStatus = boardData.boardRowStatus;
    let solution = boardData.solution;
    let presentCharArray = boardData.presentCharArray;
    let absentCharArray = boardData.absentCharArray;
    let correctCharArray = boardData.correctCharArray;
    let rowIndex = boardData.rowIndex;
    let rowStatus = [];
    let matchCount = 0;
    let status = boardData.status;

    for(let index = 0; index < word.length; index++) {
      if (solution.charAt(index) === word.charAt(index)) {
        matchCount++;
        rowStatus.push("correct");
        if(!correctCharArray.includes(word.charAt(index))) correctCharArray.push(word.charAt(index));
        if(presentCharArray.indexOf(word.charAt(index)) !== -1) presentCharArray.splice(presentCharArray.indexOf(word.charAt(index)), 1);
      } else if (solution.includes(word.charAt(index))) {
        rowStatus.push("present");
        if(!presentCharArray.includes(word.charAt(index)) &&
          !correctCharArray.includes(word.charAt(index))) correctCharArray.push(word.charAt(index));
      } else {
        rowStatus.push("absent");
        if(!absentCharArray.includes(word.charAt(index))) absentCharArray.push(word.charAt(index));
      }
    }
    if(matchCount === 5) {
      status = "WON";
      handleMessage("Du hast gewonnen!")
    } else if (rowIndex + 1 === 6) {
      status = "LOST";
      handleMessage("Du hast verloren! Versuche es noch einmal mit einem neuen Wort.")
    }
    boardRowStatus.push(rowStatus);
    boardWords[rowIndex] = word;

    let newBoardData = { ...boardData,
      "boardWords": boardWords,
      "boardRowStatus": boardRowStatus,
      "rowIndex": rowIndex + 1,
      "status": status,
      "presentCharArray": presentCharArray,
      "absentCharArray": absentCharArray,
      "correctCharArray": correctCharArray};

      setBoardData(newBoardData);
      localStorage.setItem("board-data", JSON.stringify(newBoardData));
  }

  const enterCurrentText = (word) => {
      let boardWords = boardData.boardWords;
      let rowIndex = boardData.rowIndex;
      boardWords[rowIndex] = word;
      let newBoardData = { ...boardData, "boardWords": boardWords };
      setBoardData(newBoardData);
  }

  const handleKeyPress = (key) => {
    if(boardData.rowIndex > 5 || boardData.status === "WIN") return;
    if(key === "ENTER"){
      if (charArray.length === 5) {
        let word = charArray.join("").toLowerCase();
        if(!wordList[word.charAt(0)].includes(word)){
          handleError();
          handleMessage("Nicht im Wörterbuch enthalten");
          return;
      }
      enterBoardWord(word);
      setCharArray([]);
    } else {
      handleMessage("Bitte 5 Buchstaben eingeben");
  }
  return;
}
  if(key === "⌫"){
    charArray.splice(charArray.length - 1, 1);
    setCharArray([...charArray]);
  } else if (charArray.length < 5) {
    charArray.push(key);
    setCharArray([...charArray]);
  }
  enterCurrentText(charArray.join("").toLowerCase());
}

  useEffect(() => {
    if (!boardData || !boardData.solution) {
      let alphabetIndex = Math.floor(Math.random() * 26);
      let wordIndex = Math.floor(
        Math.random() * wordList[String.fromCharCode(alphabetIndex + 97)].length
      );
      let newBoardData = {
        ...boardData,
        solution: wordList[String.fromCharCode(alphabetIndex + 97)][wordIndex],
        "rowIndex": 0,
        "boardWords": [],
        "boardRowStatus": [],
        "presentCharArray": [],
        "absentCharArray": [],
        "correctCharArray": [],
        "status": "IN_PROGRESS",
      };
      setBoardData(newBoardData);
      localStorage.setItem("board-data", JSON.stringify(newBoardData));
    }
  }, [boardData]);

  return <div className="container">
    <div className="top">
      <div className="title">WORTEL</div>
      <button className="reset-board" onClick={resetBoard}> {"\u27f3"}</button>
    </div>
    {message && <div className="message"> {message}</div>}
    <div className="cube">
      {[0,1,2,3,4,5].map((row, rowIndex) => (
        <div key={rowIndex} className={`cube-row ${boardData && row === boardData.rowIndex && error && "error"}`}>
          {
            [0,1,2,3,4].map((column, letterIndex) => (
              <div key={letterIndex} className={`letter ${boardData && boardData.boardRowStatus[row] ? boardData.boardRowStatus[row][column]: ""}`}>
                {boardData && boardData.boardWords[row] && boardData.boardWords[row].charAt(letterIndex)}
              </div>
            ))
          }
        </div>
      ))}
    </div>
    <div className="bottom">
          <Keyboard boardData={boardData} handleKeyPress={handleKeyPress} />
    </div>
  </div>;
};

export default App;
