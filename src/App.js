import React, {useCallback, useState, useRef} from 'react'
import {useDropzone} from 'react-dropzone'
import axios from 'axios'
import './App.css';

// Run by cd to app, them use npm start to start live server
// try npm run dev to run on local webserver

const API = "https://recite-ai-backend.onrender.com"

function App() {
  const [image, setImage] = useState()
  const [text, setText] = useState('')
  const [play, setPlay] = useState()
  const audioRef = useRef()

  const onDrop = useCallback((acceptedFiles) => { // Backend caller
    acceptedFiles.forEach((img) => {
      const reader = new FileReader() 

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        const binaryStr = reader.result

        setImage(binaryStr)

        const imageToText = new FormData();
        imageToText.append("image", img);

        axios.post(`${API}`, imageToText)
        .then(response => { // go to backend, get text from image
          const data = String(response.data.text)
          const tts = response.data.audio

          console.log(response.data.status)

          setText(data)
          audioRef.current = new Audio(`data:audio/mp3;base64,${tts}`)
          setPlay(false)
        })
        .catch(error => console.error('Error returning image', error));
      } 
      reader.readAsDataURL(img)
    }) 
  }, []) 

  const{getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  function handleAudio() {
    if (play){ // if sound is playing
      audioRef.current.pause()
      setPlay(false) // pause and setPlay to false
    }
    else{ // if sound is not playing
      audioRef.current.play()
      setPlay(true) // play sound and setPlay to true
    }
  }

  return (
    <div>
      <h1 className="Title">Recite.ai</h1>
      <p className='Paragraph'>This website is made for a friend, and functions as a image to text and speech. Drop an image with text into the square, then 
        read the words and listen to the audio. You can copy and paste the text into a document for another voice model, or listen to the one provided.
      </p>
      <div className="Box" {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drag and drop here</p>
        ) : (
          <p>Drop in the square</p>
        )}
      </div>
      <div>
        {image && (
          <div>
            <h2>Image Dropped:</h2>
            <img src={image} alt='Null' />
          </div>
        )}
        </div>
        <div>
          {text && (
            <div>
              <h2>Text Received:</h2>
              <p className='Paragraph'> {text} </p>
            </div>
          )}
          {audioRef.current && (
            <div>
              <button onClick={handleAudio}>
                {play ? "Pause" : "Play"}
              </button>
            </div>
          )}
        </div>
    </div>
  );
}

export default App;
