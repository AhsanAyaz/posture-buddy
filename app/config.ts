const userDir = process.env.USERPROFILE
  ? process.env.USERPROFILE
  : process.env.HOME;

const isProduction = process.env.NODE_ENV !== "production";

export const userDirectory = {
  modelDirectory: userDir + "/Downloads/posture-buddy/model",
  soundDirectory: userDir + "/Downloads/posture-buddy/sound",
  logsDirectory: userDir + "/Downloads/posture-buddy/logs",
};

export const SOUND_FILE_NAME = "notification.mp3";

export const soundSourceDirectory = !isProduction
  ? `src/assets/sound/${SOUND_FILE_NAME}`
  : `resources/dist/assets/sound/${SOUND_FILE_NAME}`;
