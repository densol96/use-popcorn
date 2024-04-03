import { useState } from 'react';
import PropTypes from 'prop-types';

// When ossible keep this in the global state, so it is not read agin on every re-render
const starContainerStyle = {
  display: 'flex',
  gap: '1px',
};

StarRating.propTypes = {
  maxRating: PropTypes.number,
  defaultRating: PropTypes.number,
  color: PropTypes.string,
  size: PropTypes.number,
  messages: PropTypes.array,
  onSetRating: PropTypes.func,
};

export default function StarRating({
  maxRating = 5,
  defaultRating = 0,
  color = '#fcc419',
  size = 24,
  messages = [],
  onSetRating,
}) {
  const [rating, setRating] = useState(defaultRating);
  const [clicked, setClicked] = useState(defaultRating ? true : false);

  const textStyle = {
    lineHeight: '1',
    margin: '0',
    fontSize: size * 0.9,
    color,
  };

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  };

  function handleClick(id) {
    if (rating === id && clicked) {
      setClicked(false);
      setRating(0);
      onSetRating(0);
    } else {
      setClicked(true);
      setRating(id);
      onSetRating(id);
    }
  }

  function onMouseEnter(id) {
    if (!clicked) {
      /* Do not want hover to affect associated states.
       * Hower affect the stars inside this component.
       * But only a clicked element is affirmitive
       */
      // onSetRating(0);
      setRating(id);
    }
  }

  function onMouseLeave(id) {
    if (!clicked) setRating(0);
  }

  return (
    <div style={containerStyle}>
      <div style={starContainerStyle}>
        {Array.from({ length: maxRating }, (_, i) => (
          <Star
            currentRating={rating}
            key={i}
            id={i + 1}
            onClick={handleClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            size={size}
            color={color}
          />
        ))}
      </div>
      <p style={textStyle}>{rating}</p>
    </div>
  );
}

function Star({
  id,
  onClick,
  currentRating,
  onMouseLeave,
  onMouseEnter,
  size: widthHeight,
  color,
}) {
  const starStyle = {
    width: `${widthHeight}px`,
    height: `${widthHeight}px`,
    display: 'block',
    cursor: 'pointer',
  };

  const fullStar = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill={color}
      stroke={color}
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  const emptyStar = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke={color}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="{2}"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );

  return (
    <span
      onClick={() => onClick(id)}
      onMouseEnter={() => onMouseEnter(id)}
      onMouseLeave={() => onMouseLeave(id)}
      style={starStyle}
    >
      {id <= currentRating ? fullStar : emptyStar}
    </span>
  );
}

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 20 20"
  fill="#000"
  stroke="#000"
>
  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
</svg>;
