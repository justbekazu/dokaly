import { Link } from 'react-router-dom';
import React, { useState, useMemo } from 'react'
import Swipes from '../Swipes'

import { useQuery } from '@apollo/client';
import { QUERY_THOUGHTS } from '../../utils/queries';


function Cards () {

  const { data } = useQuery(QUERY_THOUGHTS);
  const thoughts = data?.thoughts || [];

  var db=thoughts.map(thought => {return {name:thought.username, url: thought.thoughtText}});
  const alreadyRemoved = []

  let charactersState = db // This fixes issues with updating characters state forcing it to use the current state and not the state that was active when the card was created.
  
  const [characters, setCharacters] = useState(db)
  const [lastDirection, setLastDirection] = useState()

  const childRefs = useMemo(() => Array(db.length).fill(0).map(i => React.createRef()), [])

  const swiped = (direction, nameToDelete) => {
    console.log('removing: ' + nameToDelete)
    setLastDirection(direction)
    alreadyRemoved.push(nameToDelete)
  }

  const outOfFrame = (name) => {
    console.log(name + ' left the screen!')
    charactersState = charactersState.filter(character => character.name !== name)
    setCharacters(charactersState)
  }

  const swipe = (dir) => {
    const cardsLeft = characters.filter(person => !alreadyRemoved.includes(person.name))
    if (cardsLeft.length) {
      const toBeRemoved = cardsLeft[cardsLeft.length - 1].name // Find the card object to be removed
      const index = db.map(person => person.name).indexOf(toBeRemoved) // Find the index of which to make the reference to
      alreadyRemoved.push(toBeRemoved) // Make sure the next card gets removed next time if this card do not have time to exit the screen
      childRefs[index].current.swipe(dir) // Swipe the card!
    }
  }

  return (
    <div id='cardDivs'>

      <div className='cardContainer'>
        {db.map((character, index) =>
          <Swipes ref={childRefs[index]} className='swipe' key={character.url} onSwipe={(dir) => swiped(dir, character.name)} onCardLeftScreen={() => outOfFrame(character.name)}>
            <div style={{ backgroundImage: 'url(' + character.url + ')' }} className='card'>
            <Link to={`profile/${character.name}`}>
              <h3>{character.name}</h3>
            </Link>
            </div>
          </Swipes>
        )}
      </div>
      <div className='buttons hidden'>
        <button onClick={() => swipe('left')}>No</button>
        <button onClick={() => swipe('right')}>Yes</button>
      </div>
      <br /><br />
      <div className="centered px-3">
        {lastDirection ? <h2 key={lastDirection} className='infoText'>You swiped {lastDirection}</h2> : <h3 className='infoText'>Press play to start listening Blackanese by DJ Kaz, and swipe right if you like this picture as the art for the song!</h3>}
      </div>
    </div>
  )
}

export default Cards