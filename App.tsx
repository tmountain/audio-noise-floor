import React, { useRef, useState } from "react";
import { StyleSheet, View, Button, Text } from "react-native";
import { Video, AVPlaybackStatus } from "expo-av";
import { Audio, ResizeMode } from "expo-av";

export default function App() {
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | {}>({});
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const loadAudio = async (audioURL: string) => {
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioURL },
      { shouldPlay: false }
    );
    setSound(sound);
  };

  const playVideoAndAudio = async (volume: number) => {
    // Assuming you have a URL for the video and audio
    const videoURL: string =
      "https://nt-audio-test.s3.us-east-2.amazonaws.com/word_memory.mp4";
    const audioURL: string =
      "https://nt-audio-test.s3.us-east-2.amazonaws.com/people-talking-busy-restaurant.mp3";

    if (!sound) {
      await loadAudio(audioURL);
    }

    await video.current?.loadAsync({ uri: videoURL }, {}, true);
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
        <Button title="Low" onPress={() => playVideoAndAudio(0.1)} />
        <Button title="Medium" onPress={() => playVideoAndAudio(0.5)} />
        <Button title="High" onPress={() => playVideoAndAudio(1.0)} />
      </View>
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
