import { Label } from "@radix-ui/react-label";
import { FileVideo, Upload } from "lucide-react";
import { Button } from "./button";
import { Separator } from "@radix-ui/react-separator";
import { Textarea } from "./textarea";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export function VideoInputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget;
    if (!files) {
      return;
    }

    const selectedFile = files[0];

    setVideoFile(selectedFile);
  }

  async function convertVideoToAudio(video: File) {
    console.log("Coverte start");

    const ffmpeg = await getFFmpeg();

    await ffmpeg?.writeFile("input.mp4", await fetchFile(video));

    /*   ffmpeg?.on('log', log => {
      console.log("🚀 ~ file: video-input-form.tsx:34 ~ convertVideoToAudio ~ log:", log)
      
    }) */

    ffmpeg?.on("progress", (progress) => {
      console.log("Convert progress: " + Math.round(progress.progress * 100));
    });

    await ffmpeg?.exec([
      "-i",
      "input.mp4",
      "-map",
      "0:a",
      "-b:a",
      "20k",
      "-acodec",
      "libmp3lame",
      "output.mp3",
    ]);

    const data = await ffmpeg?.readFile("output.mp3");

    const audioFileBlob = new Blob([data], { type: "audio/mpeg" });
    const audioFile = new File([audioFileBlob], "audio.mpp3", {
      type: "audio/mpeg",
    });

    console.log("Convert Finished");

    return audioFile;
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const prompt = promptInputRef.current?.value;

    if (!videoFile) {
      return;
    }

    const audioFile = await convertVideoToAudio(videoFile);

    console.log(
      "🚀 ~ file: video-input-form.tsx:78 ~ handleUploadVideo ~ audioFile:",
      audioFile,
      prompt
    );
  }

  const previewURL = useMemo(() => {
    if (!videoFile) {
      return null;
    }

    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  return (
    <form onSubmit={handleUploadVideo} className="space-y-6">
      <label
        htmlFor="video"
        className="border relative flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
      >
        {videoFile ? (
          <video
            src={previewURL || undefined}
            controls={false}
            className="point-event-none absolute inset-0"
          />
        ) : (
          <>
            <FileVideo className="w-4 h-4" />
            Selecione um vídeo
          </>
        )}
      </label>

      <input
        type="file"
        id="video"
        accept="video/mp4"
        className="sr-only"
        onChange={handleFileSelected}
      />

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="transcription_prompt">Prompt de transcrição</Label>
        <Textarea
          ref={promptInputRef}
          id="transcription_prompt"
          className="h-20 leading-relaxed resize-none"
          placeholder="Inclu palavras-chaves mercionados no video separado por virgulas (,)"
        />
      </div>

      <Button variant="secondary" type="submit" className="w-full">
        Carregar video
        <Upload className="w-4 h-4 ml-2" />
      </Button>
    </form>
  );
}
