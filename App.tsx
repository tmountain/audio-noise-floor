import React, { useRef, useState } from "react";
import { StyleSheet, View, Button, Text, TouchableOpacity } from "react-native";
import { Video, AVPlaybackStatus, ResizeMode } from "expo-av";
import { Audio } from "expo-av";

type Language = "EN" | "ES";

export default function App() {
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | {}>({});
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [language, setLanguage] = useState<Language>("EN");
  const [currentVolume, setCurrentVolume] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const loadAudio = async (audioURL: string) => {
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioURL },
      { shouldPlay: false }
    );
    setSound(sound);
  };

  const playVideoAndAudio = async (volume: number) => {
    setCurrentVolume(volume); // Set the current volume to highlight the active button

    if (!isPlaying) {
      setIsPlaying(true); // Set isPlaying to true to indicate that the video and audio are playing

      const videoURLs: Record<Language, string> = {
        EN: "https://nt-audio-test.s3.us-east-2.amazonaws.com/word_memory_english.mp4",
        ES: "https://nt-audio-test.s3.us-east-2.amazonaws.com/word_memory_spanish.mp4",
      };
      const audioURL =
        "https://nt-audio-test.s3.us-east-2.amazonaws.com/people-talking-busy-restaurant.mp3";

      if (!sound) {
        await loadAudio(audioURL);
      }

      await video.current?.loadAsync({ uri: videoURLs[language] }, {}, true);
      await sound?.setStatusAsync({ volume, shouldPlay: true });

      video.current?.playAsync();

      video.current?.setOnPlaybackStatusUpdate(async (statusUpdate) => {
        if (statusUpdate.isLoaded && statusUpdate.didJustFinish) {
          await sound?.unloadAsync();
          setSound(null); // Reset sound state after playback
          setIsPlaying(false); // Reset isPlaying to false when the video finishes
        }
      });
    } else {
      // Stop the video and audio if they are playing
      video.current?.stopAsync();
      sound?.stopAsync();
      setIsPlaying(false); // Set isPlaying to false to indicate that the video and audio have stopped
    }
  };

  // Function to render volume buttons with active state styling
  const renderVolumeButton = (title: string, volume: number) => (
    <TouchableOpacity
      style={[styles.button, currentVolume === volume && styles.activeButton]}
      onPress={() => playVideoAndAudio(volume)}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        onPlaybackStatusUpdate={(statusUpdate: AVPlaybackStatus) =>
          setStatus(() => statusUpdate)
        }
      />
      <Text style={styles.title}>Adjust Background Volume:</Text>
      <View style={styles.buttonContainer}>
        {renderVolumeButton("Very Low", 0.05)}
        {renderVolumeButton("Low", 0.25)}
        {renderVolumeButton("Medium", 0.5)}
        {renderVolumeButton("High", 0.75)}
        {renderVolumeButton("Very High", 1.0)}
      </View>
      <Button
        title={`Switch to ${language === "EN" ? "Spanish" : "English"}`}
        onPress={() => setLanguage(language === "EN" ? "ES" : "EN")}
      />
      <TouchableOpacity
        style={[styles.button, isPlaying && styles.stopButton]}
        onPress={() => playVideoAndAudio(currentVolume ?? 0.5)} // Use the current volume or a default value
      >
        <Text style={styles.buttonText}>{isPlaying ? "Stop" : "Start"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: 300,
    height: 300,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#e7e7e7",
    padding: 10,
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: "#4caf50",
  },
  stopButton: {
    backgroundColor: "#f44336",
    marginTop: 20,
  },
  buttonText: {
    color: "#ffffff",
  },
});
