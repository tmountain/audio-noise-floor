import React, { useRef, useState } from "react";
import { StyleSheet, View, Button, Text } from "react-native";
import { Video, AVPlaybackStatus, ResizeMode } from "expo-av";
import { Audio } from "expo-av";

type Language = "EN" | "ES";

export default function App() {
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | {}>({});
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [language, setLanguage] = useState<Language>("EN");

  const loadAudio = async (audioURL: string) => {
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioURL },
      { shouldPlay: false }
    );
    setSound(sound);
  };

  const playVideoAndAudio = async (volume: number) => {
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
      }
    });
  };

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
        <Button title="Very Low" onPress={() => playVideoAndAudio(0.05)} />
        <Button title="Low" onPress={() => playVideoAndAudio(0.25)} />
        <Button title="Medium" onPress={() => playVideoAndAudio(0.5)} />
        <Button title="High" onPress={() => playVideoAndAudio(0.75)} />
        <Button title="Very High" onPress={() => playVideoAndAudio(1.0)} />
      </View>
      <Button
        title={`Switch to ${language === "EN" ? "Spanish" : "English"}`}
        onPress={() => setLanguage(language === "EN" ? "ES" : "EN")}
      />
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
});
