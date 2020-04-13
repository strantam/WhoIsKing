import {GameModel} from "../model/GameModel";

const DELAY = 1000;

export function calculateTimes(nextGame: GameModel) {
  const timeDelta = new Date().getTime() - nextGame.frontendTime.getTime();
  const currentBackendTime = nextGame.currentTime.getTime() + timeDelta;
  const remainingTimeToOpenSolution = (nextGame.openTime.getTime() - currentBackendTime) + DELAY;
  const remainingTimeToCloseSolution = (nextGame.changeToGuessTime.getTime() - currentBackendTime) - DELAY;
  const remainingTimeToGuess = (nextGame.changeToGuessTime.getTime() - currentBackendTime) + DELAY;
  const remainingTimeToClose = (nextGame.closeTime.getTime() - currentBackendTime) - DELAY;
  const remainingTimeToSum = (nextGame.closeTime.getTime() - currentBackendTime) + DELAY;
  return {
    remainingTimeToOpenSolution,
    remainingTimeToCloseSolution,
    remainingTimeToGuess,
    remainingTimeToClose,
    remainingTimeToSum,
  }
}
