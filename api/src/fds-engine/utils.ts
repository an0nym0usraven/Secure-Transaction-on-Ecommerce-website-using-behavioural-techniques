import Redis from "ioredis";
import { CurrentScoresOutput } from "./types";

export const FDS_LOGGER = (message: string) => {
  console.log(`[fds-engine] ${message}`);
};

export const printScore = async (user_id: string, redis: Redis.Redis) => {
  let currentTC = await redis.get(`TC:${user_id}`);
  let currentDS = await redis.get(`DS:${user_id}`);

  FDS_LOGGER(`DEVIATION SCORE: ${currentDS} | TRY COUNTER: ${currentTC}`);
};

export const getCurrentScores = async (
  user_id: string,
  redis: Redis.Redis
): Promise<CurrentScoresOutput> => {
  let currentTC = parseInt((await redis.get(`TC:${user_id}`)) as string);
  let currentDS = parseInt((await redis.get(`DS:${user_id}`)) as string);

  return {
    scores: [currentDS, currentTC],
  };
};
