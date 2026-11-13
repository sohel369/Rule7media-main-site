import { useEffect, useState } from "react";
import Countdown from "react-countdown";
import { useDispatch } from "react-redux";
import {
  updateAuctionStatus,
  selectAuctionWinner,
  reset,
} from "../store/auction/auctionSlice";

const CountDownTimer = (props) => {
  const dispatch = useDispatch();

  const [auctionStarted, setAuctionStarted] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);
  // Store these as state to avoid recalculations
  const [timeData, setTimeData] = useState({
    currentTime: null,
    startTime: null,
    endTime: null,
    targetDate: null,
  });

  // Only calculate times once on initial render and when props change
  useEffect(() => {
    if (!props.startTime || !props.endTime) return;

    const currentTime = new Date().getTime();
    const startTime = new Date(props.startTime).getTime();
    const endTime = new Date(props.endTime).getTime();

    // Determine target date for countdown
    let targetDate;
    if (currentTime < startTime) {
      targetDate = startTime;
    } else if (currentTime >= startTime && currentTime < endTime) {
      targetDate = endTime;
      setAuctionStarted(true);
    } else if (currentTime >= endTime) {
      targetDate = null;
      setAuctionEnded(true);
      setAuctionStarted(false);
    }

    setTimeData({
      currentTime,
      startTime,
      endTime,
      targetDate,
    });
  }, [props.startTime, props.endTime]);

  // Handle auction status changes
  useEffect(() => {
    if (!props.id) return;

    // Handle auction end
    if (auctionStarted && auctionEnded) {
      dispatch(selectAuctionWinner({ id: props.id }));
      dispatch(reset());
      if (props.Winner && typeof props.Winner === "function") {
        props.Winner();
      }
      setAuctionStarted(false);
    }
  }, [auctionStarted, auctionEnded, dispatch, props.id, props.Winner]);

  // Custom renderer to avoid multiple re-renders
  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed || !timeData.targetDate) {
      return <span>Auction Ended!</span>;
    } else if (timeData.currentTime < timeData.startTime) {
      return (
        <span>
          Auction starts at {new Date(timeData.startTime).toLocaleString()}
        </span>
      );
    } else {
      return (
        <span>
          {days}d {hours}h {minutes}m {seconds}s
        </span>
      );
    }
  };

  // Only render countdown if we have valid data
  if (!timeData.targetDate && !auctionEnded) {
    return <span>Loading...</span>;
  }

  return auctionEnded ? (
    <span>Auction Ended!</span>
  ) : (
    <Countdown
      date={timeData.targetDate}
      renderer={renderer}
      onComplete={() => {
        // We'll update the auction status using the useEffect above instead of here
        if (timeData.currentTime < timeData.startTime) {
          setAuctionStarted(true);
        } else if (
          timeData.currentTime >= timeData.startTime &&
          !auctionEnded
        ) {
          setAuctionEnded(true);
        }
      }}
    />
  );
};

export default CountDownTimer;
